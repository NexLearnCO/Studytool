import time
import json
from flask import Blueprint, request, jsonify, g
from sqlalchemy import and_, desc
from models import Artifact, Note
from services.database_service import DatabaseService

artifacts_bp = Blueprint('artifacts', __name__)
db_service = DatabaseService()

def serialize_artifact(a: Artifact) -> dict:
    """Convert Artifact ORM object to dictionary"""
    try:
        data_json = json.loads(a.data_json) if a.data_json else {}
    except (json.JSONDecodeError, TypeError):
        data_json = {}
    
    return {
        'id': a.id,
        'user_id': a.user_id,
        'note_id': a.note_id,
        'kind': a.kind,
        'status': a.status,
        'data_json': data_json,
        'created_at': a.created_at,
        'updated_at': a.updated_at,
    }

@artifacts_bp.route('/api/v1/notes/<int:note_id>/artifacts', methods=['POST'])
def create_artifact(note_id: int):
    """Create new artifact for a note"""
    try:
        user_id = getattr(g, 'user', {}).get('id', 'demo-user')
        body = request.get_json(force=True) or {}
        kind = body.get('kind')
        data_json = body.get('data_json')
        status = body.get('status', 'draft')

        if kind not in ('flashcards', 'quiz', 'markmap'):
            return jsonify({'ok': False, 'message': 'Invalid kind'}), 400
        if data_json is None:
            return jsonify({'ok': False, 'message': 'data_json is required'}), 400

        now = int(time.time() * 1000)
        with db_service.get_session() as s:
            # Check if note exists and belongs to user
            note = s.query(Note).filter(and_(
                Note.id == note_id,
                Note.user_id == user_id,
                Note.deleted_at.is_(None)
            )).first()
            if not note:
                return jsonify({'ok': False, 'message': 'Note not found'}), 404

            # Convert data_json to string if needed
            if isinstance(data_json, (dict, list)):
                data_json = json.dumps(data_json, ensure_ascii=False)

            # Create artifact
            a = Artifact(
                user_id=user_id,
                note_id=note.id,
                kind=kind,
                data_json=data_json,
                status=status,
                created_at=now,
                updated_at=now,
            )
            s.add(a)
            s.commit()
            s.refresh(a)
            return jsonify({'ok': True, 'data': serialize_artifact(a)}), 201

    except Exception as e:
        print(f'create_artifact error: {e}')
        return jsonify({'ok': False, 'message': 'Internal server error'}), 500

@artifacts_bp.route('/api/v1/notes/<int:note_id>/artifacts', methods=['GET'])
def list_artifacts(note_id: int):
    """List artifacts for a note"""
    try:
        user_id = getattr(g, 'user', {}).get('id', 'demo-user')
        kind = request.args.get('kind')
        
        with db_service.get_session() as s:
            # Check if note exists and belongs to user
            note = s.query(Note).filter(and_(
                Note.id == note_id,
                Note.user_id == user_id,
                Note.deleted_at.is_(None)
            )).first()
            if not note:
                return jsonify({'ok': False, 'message': 'Note not found'}), 404

            # List artifacts
            q = s.query(Artifact).filter(and_(
                Artifact.user_id == user_id,
                Artifact.note_id == note_id
            ))
            if kind:
                q = q.filter(Artifact.kind == kind)

            items = q.order_by(desc(Artifact.updated_at)).all()
            return jsonify({'ok': True, 'data': [serialize_artifact(x) for x in items]})
            
    except Exception as e:
        print(f'list_artifacts error: {e}')
        return jsonify({'ok': False, 'message': 'Internal server error'}), 500

@artifacts_bp.route('/api/v1/artifacts/<int:artifact_id>', methods=['GET'])
def get_artifact(artifact_id: int):
    """Get a specific artifact"""
    try:
        user_id = getattr(g, 'user', {}).get('id', 'demo-user')
        
        with db_service.get_session() as s:
            a = s.query(Artifact).filter(Artifact.id == artifact_id).first()
            if not a or a.user_id != user_id:
                return jsonify({'ok': False, 'message': 'Artifact not found'}), 404
            return jsonify({'ok': True, 'data': serialize_artifact(a)})
            
    except Exception as e:
        print(f'get_artifact error: {e}')
        return jsonify({'ok': False, 'message': 'Internal server error'}), 500

@artifacts_bp.route('/api/v1/artifacts/<int:artifact_id>', methods=['DELETE'])
def delete_artifact(artifact_id: int):
    """Delete an artifact"""
    try:
        user_id = getattr(g, 'user', {}).get('id', 'demo-user')
        
        with db_service.get_session() as s:
            a = s.query(Artifact).filter(Artifact.id == artifact_id).first()
            if not a or a.user_id != user_id:
                return jsonify({'ok': False, 'message': 'Artifact not found'}), 404
            s.delete(a)
            s.commit()
            return jsonify({'ok': True, 'message': 'Artifact deleted'})
            
    except Exception as e:
        print(f'delete_artifact error: {e}')
        return jsonify({'ok': False, 'message': 'Internal server error'}), 500
