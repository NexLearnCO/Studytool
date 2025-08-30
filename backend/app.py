from flask import Flask, request, jsonify, g
from flask_cors import CORS
from config import Config
from services.youtube_service import YouTubeService
from services.openai_service import OpenAIService
from services.pdf_service import PDFService
from services.flashcard_service import FlashcardService
from api.notes import notes_bp
from api.events import events_bp
from api.artifacts import artifacts_bp
from api.ingest import ingest_bp
from utils.sqlite_helpers import ensure_note_columns
import json
import os
import pathlib
import time

# Initialize Flask app
app = Flask(__name__, static_url_path="/static", static_folder="static")

# Configure CORS with custom headers
cors_origin = os.getenv('APP_CORS_ORIGIN', '*')
CORS(app,
     origins=cors_origin,
     allow_headers=['Content-Type', 'X-User-Id', 'X-Org-Id', 'X-Course-Id', 'X-Role'],
     methods=['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'])

# Register blueprints  
app.register_blueprint(notes_bp, url_prefix='/api/v1')
app.register_blueprint(events_bp, url_prefix='/api/v1')
app.register_blueprint(artifacts_bp)
app.register_blueprint(ingest_bp, url_prefix='/api/v1')

# Ensure schema is up to date
try:
    ensure_note_columns(Config.DATABASE_URL)
    
    # Initialize artifacts table (SQLAlchemy will auto-create)
    print("✅ Schema updated (artifacts table will be auto-created by SQLAlchemy)")
except Exception as e:
    print(f"Warning: Could not ensure schema: {e}")


@app.before_request
def load_user():
    """Load user context from headers (temp auth)."""
    g.user = {
        'id': request.headers.get('X-User-Id', 'demo-user'),
        'org_id': request.headers.get('X-Org-Id'),
        'course_id': request.headers.get('X-Course-Id')
    }

# Initialize services
youtube_service = YouTubeService()
openai_service = OpenAIService()
pdf_service = PDFService()
flashcard_service = FlashcardService()

@app.route('/')
def home():
    return jsonify({
        "message": "NexLearn AI Notes API",
        "endpoints": [
            "/api/youtube-to-notes",
            "/api/pdf-to-notes",
            "/api/text-to-notes",
            "/api/unified-notes",
            "/api/generate-flashcards",
            "/api/generate-quiz",
            "/api/v1/notes",
            "/api/v1/events"
        ]
    })


@app.route('/healthz')
def health_check():
    """Health check endpoint."""
    return jsonify({'ok': True})

@app.route('/api/youtube-to-notes', methods=['POST'])
def youtube_to_notes():
    """Convert YouTube video to notes"""
    try:
        data = request.json
        youtube_url = data.get('youtube_url')
        detail_level = data.get('detail_level', 'medium')
        language = data.get('language', 'zh-tw')
        
        if not youtube_url:
            return jsonify({"error": "YouTube URL is required"}), 400
        
        # Get transcript
        video_info = youtube_service.get_transcript(youtube_url)
        
        # Generate notes with YouTube-specific content type
        notes = openai_service.generate_notes(
            video_info['transcript'], 
            detail_level,
            language,
            'youtube'
        )
        
        return jsonify({
            "success": True,
            "video_id": video_info['video_id'],
            "notes": notes,
            "transcript": video_info['transcript']
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/pdf-to-notes', methods=['POST'])
def pdf_to_notes():
    """Convert PDF to notes"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        detail_level = request.form.get('detail_level', 'medium')
        language = request.form.get('language', 'zh-tw')
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Check file size
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > Config.MAX_FILE_SIZE:
            return jsonify({"error": "File too large (max 10MB)"}), 400
        
        # Extract text from PDF
        text = pdf_service.extract_text(file)
        
        # Generate notes with PDF-specific content type
        notes = openai_service.generate_notes(text, detail_level, language, 'pdf')
        
        return jsonify({
            "success": True,
            "notes": notes,
            "original_text": text[:500] + "..."  # Send first 500 chars
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/text-to-notes', methods=['POST'])
def text_to_notes():
    """Convert plain text to notes"""
    try:
        data = request.json
        text = data.get('text')
        detail_level = data.get('detail_level', 'medium')
        language = data.get('language', 'zh-tw')
        
        if not text:
            return jsonify({"error": "Text is required"}), 400
        
        # Generate notes with general content type (default)
        notes = openai_service.generate_notes(text, detail_level, language, 'general')
        
        return jsonify({
            "success": True,
            "notes": notes
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-quiz', methods=['POST'])
def generate_quiz():
    """Generate quiz from notes or note_id"""
    try:
        data = request.json or {}
        notes = data.get('notes')
        note_id = data.get('note_id')
        language = data.get('language', 'zh-tw')
        count = int(data.get('count', 5))
        
        # Support note_id parameter for AI Studio
        if note_id and not notes:
            try:
                from models import Note
                from services.database_service import DatabaseService
                from sqlalchemy import and_
                db_service = DatabaseService()
                with db_service.get_session() as s:
                    note = s.query(Note).filter(and_(
                        Note.id == note_id,
                        Note.user_id == g.user['id'],
                        Note.deleted_at.is_(None)
                    )).first()
                    if not note:
                        return jsonify({"ok": False, "error": "筆記不存在或無權訪問"}), 404
                    
                    notes = note.content_md or note.content or ''
                    # Align quiz language with note language when available
                    try:
                        note_lang = getattr(note, 'language', None)
                        if note_lang:
                            language = note_lang
                    except Exception:
                        pass
            except Exception as e:
                return jsonify({"ok": False, "error": f"獲取筆記失敗: {str(e)}"}), 500
        
        if not notes:
            return jsonify({"ok": False, "error": "Notes are required"}), 400
        
        quiz_json = openai_service.generate_quiz(notes, language, count)
        
        # Try to parse JSON, with fallback for malformed responses
        try:
            quiz = json.loads(quiz_json)
        except json.JSONDecodeError:
            # Extract JSON from response if it's wrapped in text
            import re
            json_match = re.search(r'\[.*\]', quiz_json, re.DOTALL)
            if json_match:
                quiz = json.loads(json_match.group())
            else:
                # Fallback: create a simple quiz
                quiz = [
                    {
                        "question": "What is the main topic of these notes?",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correct": "A",
                        "explanation": "Based on the content analysis"
                    }
                ]
        
        return jsonify({
            "ok": True,
            "data": {
                "questions": quiz
            },
            "success": True,  # Keep for backward compatibility
            "quiz": quiz
        })
        
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route('/api/generate-flashcards', methods=['POST'])
def generate_flashcards_enhanced():
    """Generate flashcards from note content or note_id"""
    try:
        data = request.json or {}
        note_content = data.get('note_content')
        note_id = data.get('note_id')
        count = data.get('count', 15)
        difficulty = data.get('difficulty', 'medium')
        types = data.get('types', ['definition', 'example'])
        language = data.get('language', 'zh-tw')

        # Support note_id parameter for AI Studio
        if note_id and not note_content:
            try:
                from models import Note
                from services.database_service import DatabaseService
                from sqlalchemy import and_
                db_service = DatabaseService()
                with db_service.get_session() as s:
                    note = s.query(Note).filter(and_(
                        Note.id == note_id,
                        Note.user_id == g.user['id'],
                        Note.deleted_at.is_(None)
                    )).first()
                    if not note:
                        return jsonify({"ok": False, "error": "筆記不存在或無權訪問"}), 404
                    
                    note_content = note.content_md or note.content or ''
                    # Use note language if available to ensure consistency with note
                    try:
                        note_lang = getattr(note, 'language', None)
                        if note_lang:
                            language = note_lang
                    except Exception:
                        pass
            except Exception as e:
                return jsonify({"ok": False, "error": f"獲取筆記失敗: {str(e)}"}), 500

        if not note_content:
            return jsonify({"ok": False, "error": "Note content is required"}), 400

        # Generate flashcards using OpenAI
        flashcards = openai_service.generate_flashcards(
            note_content, count, difficulty, types, language
        )

        return jsonify({
            "ok": True,
            "data": {
                "cards": flashcards
            },
            "success": True,
            "flashcards": flashcards,
            "count": len(flashcards)
        })

    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route('/api/generate-notes', methods=['POST'])
@app.route('/api/unified-notes', methods=['POST'])
def unified_notes():
    """Generate notes from multiple sources (YouTube, PDF, text, webpages).
    Compatible with both legacy payload and standardized payload.
    """
    try:
        data = request.json or {}

        # --- Compatibility mapping for keys ---
        # Standardized keys
        title = data.get('title', '未命名筆記')
        exam_system = data.get('exam_system') or data.get('examSystem', '')
        subject = data.get('subject', '')
        topic = data.get('topic', '')
        custom_topic = data.get('customTopic', '')
        language = data.get('language', 'zh-tw')
        mode = data.get('mode', 'hybrid')

        # detail level mapping (standard: brief|normal|deep → legacy: brief|medium|detailed)
        detail_level_std = data.get('detail_level')
        if detail_level_std:
            mapping = {'brief': 'brief', 'normal': 'medium', 'deep': 'detailed'}
            detail_level = mapping.get(detail_level_std, 'medium')
        else:
            detail_level = data.get('detailLevel', 'medium')

        # expansion mapping
        expansion = data.get('expand_level')
        if expansion is None:
            expansion = data.get('expansion', 0)

        # --- Normalize sources ---
        # Accept both array form and legacy object form
        sources = data.get('sources', {})
        normalized = {'youtube': [], 'text': [], 'webpages': [], 'files': []}

        if isinstance(sources, list):
            for src in sources:
                if not isinstance(src, dict):
                    continue
                stype = (src.get('type') or '').lower()
                if stype == 'youtube' and src.get('url'):
                    normalized['youtube'].append(src['url'])
                elif stype in ('webpage', 'webpages') and src.get('url'):
                    normalized['webpages'].append(src['url'])
                elif stype == 'text' and src.get('text'):
                    normalized['text'].append(src['text'])
                elif stype in ('pdf', 'file', 'files'):
                    # Accept base64 uploads directly
                    if src.get('data'):
                        normalized['files'].append(src)
                    else:
                        # Or accept document_id placeholder
                        doc_id = src.get('document_id')
                        if doc_id:
                            normalized['files'].append({'name': f'doc:{doc_id}', 'size': 0, 'type': 'application/pdf', 'data': None})
                else:
                    # Unknown type; ignore gracefully
                    pass
        elif isinstance(sources, dict):
            # Keep as-is
            normalized['youtube'] = sources.get('youtube', []) or []
            normalized['text'] = sources.get('text', []) or []
            normalized['webpages'] = sources.get('webpages', []) or []
            normalized['files'] = sources.get('files', []) or []
        
        all_content = []
        source_info = []
        chunk_meta = []  # collect per-source metadata for improved chunks
        # Initialize context_info early so file processing can attach file_chunks
        context_info = {
            'title': title,
            'exam_system': exam_system,
            'subject': subject,
            'topic': topic,
            'custom_topic': custom_topic,
            'mode': mode,
            'expansion': expansion,
            'source_count': 0,
            'sources': []
        }
        
        # Process YouTube sources
        for url in normalized['youtube']:
            if isinstance(url, str) and url.strip():
                try:
                    video_info = youtube_service.get_transcript(url)
                    all_content.append(video_info['transcript'])
                    source_info.append({
                        'type': 'youtube',
                        'title': video_info.get('title', url),
                        'url': url
                    })
                    chunk_meta.append({'doc_id': f'youtube:{video_info.get("video_id", url)}'})
                except Exception as e:
                    print(f"YouTube processing error for {url}: {e}")

        # Process file sources (legacy base64 path)
        for file_info in normalized['files']:
            try:
                # Skip placeholder doc entries without data
                if file_info and file_info.get('data'):
                    name_lower = (file_info.get('name', '') or '').lower()
                    if name_lower.endswith('.pdf'):
                        try:
                            pdf_chunks = pdf_service.extract_chunks_with_metadata(file_info)
                            if pdf_chunks:
                                concatenated = '\n\n'.join([c['text'] for c in pdf_chunks if c.get('kind') == 'text'])
                                if concatenated:
                                    all_content.append(concatenated)
                                source_info.append({
                                    'type': 'file',
                                    'name': file_info.get('name', 'unknown'),
                                    'size': file_info.get('size', 0),
                                    'chunks': len(pdf_chunks)
                                })
                                chunk_meta.append({'doc_id': f'file:{file_info.get("name","unknown")}'})
                                context_info.setdefault('file_chunks', []).extend(pdf_chunks)
                                continue
                        except Exception as e:
                            print(f"PyMuPDF chunking error: {e}")
                    # Fallback to plain text extraction
                file_content = pdf_service.extract_text_from_file(file_info)
                all_content.append(file_content)
                source_info.append({
                    'type': 'file',
                    'name': file_info.get('name', 'unknown'),
                    'size': file_info.get('size', 0)
                })
                chunk_meta.append({'doc_id': f'file:{file_info.get("name","unknown")}'})
            except Exception as e:
                print(f"File processing error: {e}")
        
        # Process text sources
        for text in normalized['text']:
            if isinstance(text, str) and text.strip():
                all_content.append(text)
                source_info.append({
                    'type': 'text',
                    'preview': text[:100] + '...' if len(text) > 100 else text
                })
                chunk_meta.append({'doc_id': 'text:input'})
        
        # Process webpage sources
        for url in normalized['webpages']:
            if isinstance(url, str) and url.strip():
                try:
                    import requests
                    from bs4 import BeautifulSoup
                    
                    response = requests.get(url, timeout=10)
                    soup = BeautifulSoup(response.content, 'html.parser')
                    paragraphs = soup.find_all('p')
                    webpage_text = ' '.join([p.get_text() for p in paragraphs])
                    
                    if webpage_text:
                        all_content.append(webpage_text)
                        source_info.append({
                            'type': 'webpage',
                            'url': url,
                            'title': soup.title.string if soup.title else url
                        })
                        chunk_meta.append({'doc_id': f'web:{url}'})
                except Exception as e:
                    print(f"Webpage processing error for {url}: {e}")
        
        if not all_content:
            return jsonify({"error": "No valid content found from sources"}), 400
        
        combined_content = '\n\n'.join(all_content)
        
        # Build naive chunks with IDs for routing and section writing
        raw_parts = [p.strip() for p in combined_content.split('\n\n') if p.strip()]
        # assign doc_id per block roughly by distributing meta indices
        def meta_for(i: int):
            if not chunk_meta:
                return {}
            return chunk_meta[min(i // max(1, len(raw_parts)//max(1,len(chunk_meta))), len(chunk_meta)-1)]
        chunks = [{'id': f'c{i}', 'kind': 'text', 'text': part, **meta_for(i)} for i, part in enumerate(raw_parts[:80])]  # cap size

        # Initialize context_info early and keep enriching it; do not overwrite later
        # Update counts after sources processed
        context_info['source_count'] = len(source_info)
        context_info['sources'] = source_info

        # Attach blueprint/exam files if available for tunnel path (prompts/ at repo root)
        try:
            base_dir = pathlib.Path(__file__).resolve().parents[1]
            if subject:
                bp_path = base_dir / 'prompts' / 'blueprints' / f"{str(subject).upper()}.yaml"
                if bp_path.exists():
                    context_info['blueprint'] = bp_path.read_text(encoding='utf-8')
            if exam_system:
                ex_path = base_dir / 'prompts' / 'exams' / f"{str(exam_system).upper()}.yaml"
                if ex_path.exists():
                    context_info['exam_patch'] = ex_path.read_text(encoding='utf-8')
        except Exception:
            pass

        # Pipeline wiring: branch by mode (Tunnel)
        # Emit simple events for diagnostics
        try:
            from services.database_service import DatabaseService
            from models import Event
            db_svc = DatabaseService()
            def emit(evt, props=None):
                now = int(time.time()*1000)
                with db_svc.get_session() as s:
                    e = Event(id=str(now)+':'+mode, user_id=g.user['id'], org_id=g.user.get('org_id'), event=evt, target_type='note_gen', target_id=None, ts=now, props=json.dumps(props or {}, ensure_ascii=False))
                    s.add(e); s.commit()
            emit('PIPELINE_START', {'mode': mode, 'source_count': len(source_info)})
        except Exception:
            def emit(evt, props=None):
                return None
        if mode == 'outline':
            # outline_extract → outline_refine → notes_assemble
            try:
                outline = openai_service.run_outline_extract(chunks)
                if outline:
                    outline = openai_service.run_outline_refine(outline)
                emit('OUTLINE_DONE', {'has_outline': bool(outline)})
            except Exception as e:
                print(f"outline pipeline failed: {e}")
                outline = {}

            # Assemble a single document from refined outline headings using original combined content as fallback
            sections_markdown = []
            try:
                secs = (outline or {}).get('sections') or []
                # Create minimal sections from titles; real extraction will map pages later
                for s in secs[:20]:
                    title_line = s.get('title') or 'Section'
                    sections_markdown.append({'name': title_line, 'markdown': f"## {title_line}\n"})
            except Exception:
                pass

            try:
                notes = openai_service.run_notes_assemble({
            'title': title,
            'exam_system': exam_system,
            'subject': subject,
                    'language': language,
                    'sections_markdown': sections_markdown or [{'id': 'all', 'title': context_info.get('title'), 'order': 1, 'markdown': combined_content}],
                    'tags': []
                })
                emit('ASSEMBLE_DONE', {'sections': len(sections_markdown or [])})
            except Exception as e:
                print(f"notes assemble (outline) failed: {e}")
                notes = openai_service.generate_unified_notes(
                    combined_content,
                    detail_level,
                    language,
                    {**context_info, 'pipeline': 'outline-fallback'}
                )
        elif mode == 'blueprint':
            # section_writer → notes_assemble (initial stub: single pass)
            variables = {
                'exam_system': exam_system,
                'subject': subject,
                'language': language,
                'detail_level': {'brief': 'brief', 'medium': 'normal', 'detailed': 'deep'}.get(detail_level, 'normal'),
                'expand_level': expansion,
                'section_name': topic or title,
                'blueprint_json': context_info.get('blueprint', ''),
                'exam_patch': context_info.get('exam_patch', ''),
                'chunks_json': [{'kind': 'text', 'text': combined_content}],
                'style_rules': '',
            }
            try:
                notes = openai_service.run_section_writer(variables)
                # post-process: LaTeX standardize and citation check
                try:
                    notes = openai_service.run_latex_standardize(notes)
                except Exception:
                    pass
                try:
                    qa = openai_service.run_citation_guard(notes)
                    if isinstance(qa, dict) and not qa.get('ok', True):
                        emit('CITATION_ISSUES', {'count': len(qa.get('issues') or [])})
                except Exception:
                    pass
                emit('SECTION_WRITER_DONE', {'sections': 1})
            except Exception as e:
                print(f"section_writer failed, fallback to unified: {e}")
                notes = openai_service.generate_unified_notes(
                    combined_content,
                    detail_level,
                    language,
                    {**context_info, 'pipeline': 'blueprint'}
                )
        else:
            # hybrid (default): outline_extract → section_router → section_writer → notes_assemble
            try:
                outline = openai_service.run_outline_extract(chunks)
                if outline:
                    outline = openai_service.run_outline_refine(outline)
                emit('OUTLINE_DONE', {'has_outline': bool(outline)})
            except Exception as e:
                print(f"outline pipeline failed: {e}")
                outline = {}

            try:
                # Prefer file_chunks when available to enable precise chunk_ids with doc_id/page
                router_input_chunks = context_info.get('file_chunks') or chunks
                mapping = openai_service.run_section_router(
                    context_info.get('blueprint', ''),
                    outline or {},
                    router_input_chunks,
                    language
                )
                emit('ROUTER_DONE', {'mapped': bool(mapping)})
            except Exception as e:
                print(f"section router failed: {e}")
                mapping = {}

            # 2) write sections (select chunks per mapping if provided)
            sections_markdown = []
            collected_tags = set()
            # Build section list from mapping; fallback to one section if empty
            try:
                mappings = mapping.get('mapping') if isinstance(mapping, dict) else None
                if not mappings:
                    mappings = [{
                        'blueprint_section': context_info.get('topic') or context_info.get('title') or 'Section',
                        'source_titles': [],
                        'chunk_ids': []
                    }]

                # Build id->chunk map from both naive chunks and file_chunks (when present)
                id_to_chunk = {c['id']: c for c in chunks if isinstance(c, dict) and 'id' in c}
                if 'file_chunks' in context_info:
                    for c in context_info['file_chunks']:
                        if isinstance(c, dict) and c.get('id'):
                            id_to_chunk[c['id']] = c

                for m in mappings[:10]:  # cap
                    variables = {
                        'exam_system': exam_system,
                        'subject': subject,
                        'language': language,
                        'detail_level': {'brief': 'brief', 'medium': 'normal', 'detailed': 'deep'}.get(detail_level, 'normal'),
                        'expand_level': expansion,
                        'section_name': m.get('blueprint_section') or context_info.get('topic') or context_info.get('title'),
                        'blueprint_json': context_info.get('blueprint', ''),
                        'exam_patch': context_info.get('exam_patch', ''),
                        'chunks_json': [id_to_chunk[cid] for cid in (m.get('chunk_ids') or []) if cid in id_to_chunk] or [],
                        'style_rules': '',
                    }
                    # If router沒有回 chunk_ids，做簡易關鍵詞匹配選塊（根據 section_name/source_titles）
                    if not variables['chunks_json']:
                        try:
                            target_terms = set()
                            sec_name = variables['section_name'] or ''
                            for t in (sec_name.split()):
                                target_terms.add(t.lower())
                            for t in (m.get('source_titles') or []):
                                for w in str(t).split():
                                    target_terms.add(w.lower())
                            # 簡易分數：包含關鍵詞數量
                            scored = []
                            for c in chunks:
                                txt = (c.get('text') or '').lower()
                                if not txt:
                                    continue
                                score = sum(1 for w in target_terms if w and w in txt)
                                if score > 0:
                                    scored.append((score, c))
                            scored.sort(key=lambda x: x[0], reverse=True)
                            picked = [c for _, c in scored[:8]] or chunks[:6]
                            variables['chunks_json'] = picked
                        except Exception:
                            variables['chunks_json'] = chunks
                    try:
                        sec_md = openai_service.run_section_writer(variables)
                        # Post-process: LaTeX standardize
                        try:
                            sec_md = openai_service.run_latex_standardize(sec_md)
                        except Exception:
                            pass
                        # Detect image placeholders and generate captions when we have file_chunks
                        try:
                            if 'file_chunks' in context_info and any(ch.get('kind')=='image' for ch in context_info['file_chunks']):
                                imgs = [
                                    {
                                        'image_id': ch.get('id'),
                                        'doc_id': ch.get('doc_id'),
                                        'page': ch.get('page'),
                                        'url': ch.get('url'),
                                        'width': ch.get('width', 0),
                                        'height': ch.get('height', 0),
                                        'context': ch.get('context', '')
                                    }
                                    for ch in context_info['file_chunks'] if ch.get('kind')=='image'
                                ]
                                try:
                                    caps = openai_service.run_image_captions(imgs)
                                    # Build caption mapping with improved fallback
                                    cap_map = {}
                                    if caps and isinstance(caps, list):
                                        for c in caps:
                                            if isinstance(c, dict) and c.get('image_id'):
                                                cap_map[c.get('image_id')] = c.get('caption', '')
                                except Exception as e:
                                    print(f"Image caption generation failed: {e}")
                                    caps = []
                                    cap_map = {}
                                
                                # Inject images with captions into section
                                try:
                                    section_images = [c for c in (variables.get('chunks_json') or []) if c.get('kind')=='image' and c.get('url')]
                                    if section_images:
                                        img_lines = []
                                        for idx, img in enumerate(section_images, 1):
                                            img_id = img.get('id', '')
                                            page = img.get('page', '?')
                                            
                                            # Use AI-generated caption or create meaningful fallback
                                            caption = cap_map.get(img_id)
                                            if not caption:
                                                # Create a more descriptive fallback caption
                                                doc_name = img.get('doc_id', '').replace('file:', '').split('/')[-1]
                                                caption = f"圖表 P{page}-{idx}"
                                                if doc_name:
                                                    caption += f" ({doc_name})"
                                            
                                            url = img.get('url')
                                            if isinstance(url, str) and url:
                                                img_lines.append(f"![{caption}]({url})")
                                        
                                        if img_lines:
                                            sec_md += "\n\n" + "\n".join(img_lines)
                                except Exception:
                                    pass
                        except Exception:
                            pass
                        # Detect simple table markers and keep as-is for now (future: call table_to_markdown on raw)
                        # Classify tags for frontmatter
                        try:
                            sec_tags = openai_service.run_tags_classify(sec_md)
                            for t in (sec_tags or []):
                                if isinstance(t, str):
                                    collected_tags.add(t)
                        except Exception:
                            pass
                        if isinstance(sec_md, str) and sec_md.strip():
                            sections_markdown.append({'name': variables['section_name'], 'markdown': sec_md})
                    except Exception as e:
                        print(f"section_writer failed for section: {e}")
                emit('SECTION_WRITER_DONE', {'sections': len(sections_markdown)})
            except Exception as e:
                print(f"sections loop failed: {e}")

            # 3) Append appendix for tables if available
            try:
                if 'file_chunks' in context_info:
                    table_raws = [ch.get('text') for ch in context_info['file_chunks'] if ch.get('kind') == 'table' and ch.get('text')]
                    appendix_tables = []
                    for tr in table_raws[:10]:
                        try:
                            appendix_tables.append(openai_service.run_table_to_markdown(tr))
                        except Exception:
                            continue
                    if appendix_tables:
                        sections_markdown.append({'name': '附錄：表格', 'markdown': "\n\n".join(appendix_tables)})
            except Exception:
                pass

            try:
                notes = openai_service.run_notes_assemble({
                    'title': title,
                    'exam_system': exam_system,
                    'subject': subject,
                    'language': language,
                    'sections_markdown': sections_markdown or [{'id': 'all', 'title': context_info.get('title'), 'order': 1, 'markdown': combined_content}],
                    'tags': list(collected_tags)
                })
                emit('ASSEMBLE_DONE', {'sections': len(sections_markdown or [])})
                # Final QA: citation guard
                try:
                    qa = openai_service.run_citation_guard(notes)
                    if isinstance(qa, dict) and not qa.get('ok', True):
                        emit('CITATION_ISSUES', {'count': len(qa.get('issues') or [])})
                except Exception:
                    pass
            except Exception as e:
                print(f"notes assemble failed: {e}")
        notes = openai_service.generate_unified_notes(
            combined_content,
            detail_level,
            language,
                    {**context_info, 'pipeline': 'hybrid-fallback'}
        )
        try:
            emit('PIPELINE_END', {'mode': mode, 'words': len(notes.split())})
        except Exception:
            pass
        
        return jsonify({
            "success": True,
            "notes": notes,
            "title": title,
            "exam_system": exam_system,
            "subject": subject,
            "topic": topic,
            "custom_topic": custom_topic,
            "mode": mode,
            "expansion": expansion,
            "sources": source_info,
            "word_count": len(notes.split()),
            "processing_time": "calculated_on_frontend"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-flashcards-from-notes', methods=['POST'])
def generate_flashcards_from_notes():
    """從筆記內容生成閃卡"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': '沒有提供數據'}), 400
        
        content = data.get('content', '')
        title = data.get('title', '')
        card_count = data.get('cardCount', 10)
        difficulty = data.get('difficulty', 'mixed')
        
        if not content:
            return jsonify({'error': '筆記內容不能為空'}), 400
        
        # 生成閃卡
        flashcards = flashcard_service.generate_flashcards_from_note(
            content=content,
            title=title,
            card_count=card_count,
            difficulty=difficulty
        )
        
        return jsonify({
            'success': True,
            'flashcards': flashcards,
            'total': len(flashcards)
        })
        
    except Exception as e:
        print(f"生成閃卡時發生錯誤: {str(e)}")
        return jsonify({
            'error': f'生成閃卡失敗: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=Config.FLASK_PORT,
        debug=Config.FLASK_DEBUG
    )