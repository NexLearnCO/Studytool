"""Notes API Blueprint."""
import json
import time
from flask import Blueprint, request, jsonify, g
from sqlalchemy import and_, or_, desc
from models import Note, Event
from services.database_service import DatabaseService

notes_bp = Blueprint('notes', __name__)
db_service = DatabaseService()


def serialize_note(note: Note) -> dict:
    """Serialize note to JSON with proper type conversion."""
    return {
        'id': str(note.id),
        'org_id': note.org_id,
        'course_id': note.course_id,
        'folder_id': note.folder_id,
        'title': note.title,
        'content': note.content,  # Legacy field
        'content_md': note.content_md,
        'content_json': json.loads(note.content_json) if note.content_json else None,
        'tags': json.loads(note.tags) if note.tags else [],
        'status': note.status or 'draft',
        'language': note.language,
        'exam_system': note.exam_system,
        'subject': note.subject,
        'topic': note.topic,
        'created_at': note.created_at,
        'updated_at': note.updated_at,
        'deleted_at': note.deleted_at
    }


@notes_bp.route('/notes', methods=['GET'])
def list_notes():
    """List notes with pagination and filtering."""
    try:
        user_id = getattr(g, 'user', {}).get('id', 'demo-user')
        
        # Query parameters
        limit = min(int(request.args.get('limit', 50)), 100)
        cursor = request.args.get('cursor')  # epoch ms for pagination
        folder_id = request.args.get('folder_id')
        tag = request.args.get('tag')
        org_id = request.args.get('org_id')
        course_id = request.args.get('course_id')
        
        with db_service.get_session() as session:
            query = session.query(Note).filter(
                and_(
                    Note.user_id == user_id,
                    Note.deleted_at.is_(None)  # Exclude soft-deleted
                )
            )
            
            # Apply filters
            if folder_id:
                query = query.filter(Note.folder_id == folder_id)
            if org_id:
                query = query.filter(Note.org_id == org_id)
            if course_id:
                query = query.filter(Note.course_id == course_id)
            if tag:
                # Search for tag in JSON array (simple contains)
                query = query.filter(Note.tags.contains(f'"{tag}"'))
            
            # Cursor-based pagination
            if cursor:
                query = query.filter(Note.updated_at < int(cursor))
            
            # Order by updated_at DESC and limit
            notes = query.order_by(desc(Note.updated_at)).limit(limit + 1).all()
            
            # Check if there are more results
            has_more = len(notes) > limit
            if has_more:
                notes = notes[:-1]
            
            next_cursor = notes[-1].updated_at if notes and has_more else None
            
            return jsonify({
                'ok': True,
                'data': {
                    'items': [serialize_note(note) for note in notes],
                    'nextCursor': next_cursor
                }
            })
            
    except Exception as e:
        return jsonify({'ok': False, 'message': str(e)}), 500


@notes_bp.route('/notes/<int:note_id>', methods=['GET'])
def get_note(note_id: int):
    """Get a single note by ID."""
    try:
        user_id = getattr(g, 'user', {}).get('id', 'demo-user')
        
        with db_service.get_session() as session:
            note = session.query(Note).filter(
                and_(
                    Note.id == note_id,
                    Note.user_id == user_id,
                    Note.deleted_at.is_(None)
                )
            ).first()
            
            if not note:
                return jsonify({'ok': False, 'message': 'Note not found'}), 404
            
            return jsonify({
                'ok': True,
                'data': serialize_note(note)
            })
            
    except Exception as e:
        return jsonify({'ok': False, 'message': str(e)}), 500


@notes_bp.route('/notes', methods=['POST'])
def create_note():
    """Create a new note."""
    try:
        user_id = getattr(g, 'user', {}).get('id', 'demo-user')
        org_id = getattr(g, 'user', {}).get('org_id')
        course_id = getattr(g, 'user', {}).get('course_id')
        
        data = request.get_json() or {}
        now = int(time.time() * 1000)
        
        # Process tags (convert array to JSON string)
        tags = data.get('tags', [])
        tags_json = json.dumps(tags) if isinstance(tags, list) else tags
        
        # Process content_json (convert object to JSON string)
        content_json = data.get('content_json')
        if isinstance(content_json, (dict, list)):
            content_json = json.dumps(content_json)
        
        with db_service.get_session() as session:
            note = Note(
                user_id=user_id,
                org_id=data.get('org_id') or org_id,
                course_id=data.get('course_id') or course_id,
                folder_id=data.get('folder_id'),
                title=data.get('title', '未命名筆記'),
                content=data.get('content', ''),  # Legacy fallback
                content_md=data.get('content_md'),
                content_json=content_json,
                tags=tags_json,
                status=data.get('status', 'draft'),
                language=data.get('language', 'zh-tw'),
                exam_system=data.get('exam_system'),
                subject=data.get('subject'),
                topic=data.get('topic'),
                created_at=now,
                updated_at=now
            )
            
            session.add(note)
            session.commit()
            session.refresh(note)
            
            return jsonify({
                'ok': True,
                'data': serialize_note(note)
            }), 201
            
    except Exception as e:
        return jsonify({'ok': False, 'message': str(e)}), 500


@notes_bp.route('/notes/<int:note_id>', methods=['PATCH'])
def update_note(note_id: int):
    """Update a note."""
    try:
        user_id = getattr(g, 'user', {}).get('id', 'demo-user')
        data = request.get_json() or {}
        now = int(time.time() * 1000)
        
        with db_service.get_session() as session:
            note = session.query(Note).filter(
                and_(
                    Note.id == note_id,
                    Note.user_id == user_id,
                    Note.deleted_at.is_(None)
                )
            ).first()
            
            if not note:
                return jsonify({'ok': False, 'message': 'Note not found'}), 404
            
            # Update fields if provided
            for field in ['org_id', 'course_id', 'folder_id', 'title', 'content', 
                         'content_md', 'status', 'language', 'exam_system', 'subject', 'topic']:
                if field in data:
                    setattr(note, field, data[field])
            
            # Handle special fields
            if 'tags' in data:
                tags = data['tags']
                note.tags = json.dumps(tags) if isinstance(tags, list) else tags
                
            if 'content_json' in data:
                content_json = data['content_json']
                note.content_json = json.dumps(content_json) if isinstance(content_json, (dict, list)) else content_json
            
            note.updated_at = now
            
            session.commit()
            session.refresh(note)
            
            return jsonify({
                'ok': True,
                'data': serialize_note(note)
            })
            
    except Exception as e:
        return jsonify({'ok': False, 'message': str(e)}), 500


@notes_bp.route('/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id: int):
    """Soft delete a note."""
    try:
        user_id = getattr(g, 'user', {}).get('id', 'demo-user')
        now = int(time.time() * 1000)
        
        with db_service.get_session() as session:
            note = session.query(Note).filter(
                and_(
                    Note.id == note_id,
                    Note.user_id == user_id,
                    Note.deleted_at.is_(None)
                )
            ).first()
            
            if not note:
                return jsonify({'ok': False, 'message': 'Note not found'}), 404
            
            note.deleted_at = now
            session.commit()
            
            return jsonify({'ok': True, 'message': 'Note deleted'})
            
    except Exception as e:
        return jsonify({'ok': False, 'message': str(e)}), 500
