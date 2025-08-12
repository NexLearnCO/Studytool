from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from services.youtube_service import YouTubeService
from services.openai_service import OpenAIService
from services.pdf_service import PDFService
import json

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize services
youtube_service = YouTubeService()
openai_service = OpenAIService()
pdf_service = PDFService()

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
            "/api/generate-quiz"
        ]
    })

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

@app.route('/api/generate-flashcards', methods=['POST'])
def generate_flashcards():
    """Generate flashcards from notes"""
    try:
        data = request.json
        notes = data.get('notes')
        language = data.get('language', 'zh-tw')
        
        if not notes:
            return jsonify({"error": "Notes are required"}), 400
        
        flashcards_json = openai_service.generate_flashcards(notes, language)
        
        # Try to parse JSON, with fallback for malformed responses
        try:
            flashcards = json.loads(flashcards_json)
        except json.JSONDecodeError:
            # Extract JSON from response if it's wrapped in text
            import re
            json_match = re.search(r'\[.*\]', flashcards_json, re.DOTALL)
            if json_match:
                flashcards = json.loads(json_match.group())
            else:
                # Fallback: create simple flashcards from the response
                flashcards = [
                    {"question": "What are the main points from the notes?", "answer": flashcards_json[:200] + "..."},
                    {"question": "Summarize the key concepts", "answer": "Based on the generated content"}
                ]
        
        return jsonify({
            "success": True,
            "flashcards": flashcards
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-quiz', methods=['POST'])
def generate_quiz():
    """Generate quiz from notes"""
    try:
        data = request.json
        notes = data.get('notes')
        language = data.get('language', 'zh-tw')
        
        if not notes:
            return jsonify({"error": "Notes are required"}), 400
        
        quiz_json = openai_service.generate_quiz(notes, language)
        
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
            "success": True,
            "quiz": quiz
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-flashcards', methods=['POST'])
def generate_flashcards():
    """Generate flashcards from note content"""
    try:
        data = request.json
        note_content = data.get('note_content')
        count = data.get('count', 15)
        difficulty = data.get('difficulty', 'medium')
        types = data.get('types', ['definition', 'example'])
        language = data.get('language', 'zh-tw')

        if not note_content:
            return jsonify({"error": "Note content is required"}), 400

        # Generate flashcards using OpenAI
        flashcards = openai_service.generate_flashcards(
            note_content, count, difficulty, types, language
        )

        return jsonify({
            "success": True,
            "flashcards": flashcards,
            "count": len(flashcards)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/unified-notes', methods=['POST'])
def unified_notes():
    """Generate notes from multiple sources (YouTube, PDF, text, webpages)"""
    try:
        data = request.json
        sources = data.get('sources', {})
        title = data.get('title', '未命名筆記')
        exam_system = data.get('examSystem', '')
        subject = data.get('subject', '')
        topic = data.get('topic', '')
        custom_topic = data.get('customTopic', '')
        detail_level = data.get('detailLevel', 'medium')
        language = data.get('language', 'zh-tw')
        
        all_content = []
        source_info = []
        
        # Process YouTube sources
        youtube_urls = sources.get('youtube', [])
        for url in youtube_urls:
            if url.strip():
                try:
                    video_info = youtube_service.get_transcript(url)
                    all_content.append(video_info['transcript'])
                    source_info.append({
                        'type': 'youtube',
                        'title': video_info.get('title', url),
                        'url': url
                    })
                except Exception as e:
                    print(f"YouTube processing error for {url}: {e}")
                    continue
        
        # Process file sources
        files = sources.get('files', [])
        for file_info in files:
            try:
                file_content = pdf_service.extract_text_from_file(file_info)
                all_content.append(file_content)
                source_info.append({
                    'type': 'file',
                    'name': file_info.get('name', 'unknown'),
                    'size': file_info.get('size', 0)
                })
            except Exception as e:
                print(f"File processing error: {e}")
                continue
        
        # Process text sources
        text_contents = sources.get('text', [])
        for text in text_contents:
            if text.strip():
                all_content.append(text)
                source_info.append({
                    'type': 'text',
                    'preview': text[:100] + '...' if len(text) > 100 else text
                })
        
        # Process webpage sources
        webpage_urls = sources.get('webpages', [])
        for url in webpage_urls:
            if url.strip():
                try:
                    # Simple webpage content extraction (basic implementation)
                    import requests
                    from bs4 import BeautifulSoup
                    
                    response = requests.get(url, timeout=10)
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Extract text from paragraphs
                    paragraphs = soup.find_all('p')
                    webpage_text = ' '.join([p.get_text() for p in paragraphs])
                    
                    if webpage_text:
                        all_content.append(webpage_text)
                        source_info.append({
                            'type': 'webpage',
                            'url': url,
                            'title': soup.title.string if soup.title else url
                        })
                except Exception as e:
                    print(f"Webpage processing error for {url}: {e}")
                    continue
        
        if not all_content:
            return jsonify({"error": "No valid content found from sources"}), 400
        
        # Combine all content
        combined_content = '\n\n'.join(all_content)
        
        # Generate unified notes with enhanced context
        context_info = {
            'title': title,
            'exam_system': exam_system,
            'subject': subject,
            'topic': topic,
            'custom_topic': custom_topic,
            'source_count': len(source_info),
            'sources': source_info
        }
        
        notes = openai_service.generate_unified_notes(
            combined_content,
            detail_level,
            language,
            context_info
        )
        
        return jsonify({
            "success": True,
            "notes": notes,
            "title": title,
            "exam_system": exam_system,
            "subject": subject,
            "topic": topic,
            "custom_topic": custom_topic,
            "sources": source_info,
            "word_count": len(notes.split()),
            "processing_time": "calculated_on_frontend"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=Config.FLASK_PORT,
        debug=Config.FLASK_DEBUG
    )