"""Events API Blueprint."""
import json
import time
import uuid
from flask import Blueprint, request, jsonify, g
from sqlalchemy import desc
from models import Event
from services.database_service import DatabaseService

events_bp = Blueprint('events', __name__)
db_service = DatabaseService()


def serialize_event(event: Event) -> dict:
    """Serialize event to JSON with proper type conversion."""
    return {
        'id': event.id,
        'user_id': event.user_id,
        'org_id': event.org_id,
        'event': event.event,
        'target_type': event.target_type,
        'target_id': event.target_id,
        'ts': event.ts,
        'props': json.loads(event.props) if event.props else {}
    }


@events_bp.route('/events', methods=['POST'])
def create_event():
    """Create a new event."""
    try:
        user_id = getattr(g, 'user', {}).get('id', 'demo-user')
        org_id = getattr(g, 'user', {}).get('org_id')
        
        data = request.get_json() or {}
        event_name = data.get('event')
        
        if not event_name:
            return jsonify({'ok': False, 'message': 'event field is required'}), 400
        
        # Generate ULID-style ID (using UUID4 for simplicity)
        event_id = str(uuid.uuid4())
        now = data.get('ts', int(time.time() * 1000))
        
        # Process props (convert object to JSON string)
        props = data.get('props', {})
        props_json = json.dumps(props) if isinstance(props, dict) else props
        
        with db_service.get_session() as session:
            event = Event(
                id=event_id,
                user_id=user_id,
                org_id=data.get('org_id') or org_id,
                event=event_name,
                target_type=data.get('target_type'),
                target_id=data.get('target_id'),
                ts=now,
                props=props_json
            )
            
            session.add(event)
            session.commit()
            session.refresh(event)
            
            return jsonify({
                'ok': True,
                'data': serialize_event(event)
            }), 201
            
    except Exception as e:
        return jsonify({'ok': False, 'message': str(e)}), 500


@events_bp.route('/events', methods=['GET'])
def list_events():
    """List events for admin explorer."""
    try:
        # Simple pagination
        limit = min(int(request.args.get('limit', 200)), 500)
        
        with db_service.get_session() as session:
            events = session.query(Event).order_by(desc(Event.ts)).limit(limit).all()
            
            return jsonify({
                'ok': True,
                'data': {
                    'items': [serialize_event(event) for event in events]
                }
            })
            
    except Exception as e:
        return jsonify({'ok': False, 'message': str(e)}), 500
