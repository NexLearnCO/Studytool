from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter
import re
import requests
import json
import os
import tempfile
import yt_dlp
import openai
import sys
import os
# Add backend directory to path for imports
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
from config import Config

class YouTubeService:
    @staticmethod
    def extract_video_id(url):
        """Extract video ID from YouTube URL"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=)([\w-]+)',
            r'(?:youtu\.be\/)([\w-]+)',
            r'(?:youtube\.com\/embed\/)([\w-]+)',
            r'(?:youtube\.com\/v\/)([\w-]+)',
            r'(?:youtube\.com\/watch.*v=)([\w-]+)',
            r'(?:youtube\.com\/shorts\/)([\w-]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        raise ValueError("Invalid YouTube URL format")
    
    @staticmethod
    def get_transcript_alternative(video_id):
        """Alternative method to get transcript using direct YouTube API approach"""
        try:
            # Try to get transcript from YouTube's internal API (like browser does)
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            # Get video page to extract necessary tokens
            video_url = f"https://www.youtube.com/watch?v={video_id}"
            response = requests.get(video_url, headers=headers)
            
            if response.status_code == 200:
                # Look for transcript data in the page
                content = response.text
                
                # Extract timedtext tracks (simplified approach)
                if '"captionTracks"' in content:
                    # Find caption tracks in the page
                    import re
                    caption_pattern = r'"captionTracks":\s*\[(.*?)\]'
                    caption_match = re.search(caption_pattern, content)
                    
                    if caption_match:
                        try:
                            # Extract the first available caption URL
                            url_pattern = r'"baseUrl":"([^"]+)"'
                            url_match = re.search(url_pattern, caption_match.group(1))
                            
                            if url_match:
                                caption_url = url_match.group(1).replace('\\u0026', '&')
                                
                                # Get the actual transcript
                                transcript_response = requests.get(caption_url, headers=headers)
                                
                                if transcript_response.status_code == 200:
                                    # Parse XML transcript
                                    import xml.etree.ElementTree as ET
                                    root = ET.fromstring(transcript_response.content)
                                    
                                    transcript_text = ""
                                    for text_elem in root.findall('.//text'):
                                        if text_elem.text:
                                            transcript_text += text_elem.text + " "
                                    
                                    return transcript_text.strip()
                        except Exception as e:
                            print(f"Alternative method failed: {e}")
                            pass
            
            return None
            
        except Exception as e:
            print(f"Alternative transcript method error: {e}")
            return None
    
    @staticmethod
    def get_transcript_hybrid(url):
        """Hybrid audio extraction method using yt-dlp + OpenAI Whisper (from yt_to_text_hybrid.py)"""
        try:
            video_id = YouTubeService.extract_video_id(url)
            print(f"🎬 Processing YouTube video: {video_id}")
            
            # Set up OpenAI
            openai.api_key = Config.OPENAI_API_KEY
            if not openai.api_key:
                raise Exception("OpenAI API key not configured")
            
            # Create temporary directory for audio
            with tempfile.TemporaryDirectory() as temp_dir:
                print(f"📁 Using temp directory: {temp_dir}")
                
                # Download audio using yt-dlp
                print("📥 Downloading audio...")
                ydl_opts = {
                    'format': 'bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio',
                    'outtmpl': os.path.join(temp_dir, '%(title)s.%(ext)s'),
                    'quiet': True,
                    'no_warnings': True,
                }
                
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=True)
                    title = info.get('title', 'Unknown Video')
                    duration = info.get('duration', 0)
                
                # Find downloaded audio file
                audio_file = None
                for file in os.listdir(temp_dir):
                    if file.endswith(('.m4a', '.webm', '.mp3', '.wav')):
                        audio_file = os.path.join(temp_dir, file)
                        break
                
                if not audio_file:
                    raise Exception("No audio file found after download")
                
                print(f"🎵 Audio downloaded: {os.path.basename(audio_file)}")
                
                # Transcribe using OpenAI Whisper
                print("🎤 Transcribing with OpenAI Whisper...")
                with open(audio_file, 'rb') as f:
                    response = openai.Audio.transcribe(
                        model="whisper-1",
                        file=f,
                        response_format="text"
                    )
                
                transcript = response.strip()
                
                if not transcript:
                    raise Exception("Empty transcript received")
                
                print(f"✅ Transcription complete: {len(transcript)} characters")
                
                return {
                    'video_id': video_id,
                    'url': url,
                    'title': title,
                    'duration': duration,
                    'transcript': transcript,
                    'method': 'hybrid_audio_whisper'
                }
                
        except Exception as e:
            print(f"❌ Hybrid transcription failed: {str(e)}")
            raise e
    
    @staticmethod
    def get_transcript(url):
        """Get transcript from YouTube video - Hybrid approach with improved audio extraction"""
        try:
            video_id = YouTubeService.extract_video_id(url)
            print(f"Processing YouTube video: {video_id}")
            
            # Method 1: Use improved hybrid audio extraction (yt_to_text_hybrid.py logic)
            print("Method 1: Trying improved audio extraction with OpenAI Whisper...")
            try:
                result = YouTubeService.get_transcript_hybrid(url)
                
                if result and result.get('transcript', '').strip():
                    print(f"Method 1 Success: {len(result['transcript'])} characters")
                    return result
                    
            except Exception as e:
                print(f"Method 1 (Hybrid Audio) failed: {str(e)}")
                # Continue to other methods
            
            # Method 2: Try youtube-transcript-api (fallback)
            print("Method 2: Trying youtube-transcript-api...")
            try:
                language_codes = ['en', 'en-US', 'en-GB', 'zh', 'zh-TW', 'zh-CN']
                
                transcript_data = None
                for lang_set in [['en'], ['en-US'], ['zh'], language_codes]:
                    try:
                        transcript_data = YouTubeTranscriptApi.get_transcript(video_id, languages=lang_set)
                        print(f"Found transcript in language set: {lang_set}")
                        break
                    except Exception as e:
                        print(f"Failed for language set {lang_set}: {str(e)}")
                        continue
                
                # Try without language specification
                if not transcript_data:
                    try:
                        transcript_data = YouTubeTranscriptApi.get_transcript(video_id)
                        print("Found transcript without language specification")
                    except Exception as e:
                        print(f"youtube-transcript-api failed completely: {str(e)}")
                
                if transcript_data:
                    formatter = TextFormatter()
                    transcript_text = formatter.format_transcript(transcript_data)
                    total_duration = sum([item.get('duration', 0) for item in transcript_data])
                    
                    if transcript_text.strip():
                        video_info = {
                            'video_id': video_id,
                            'url': url,
                            'transcript': transcript_text,
                            'duration': total_duration,
                            'method': 'transcript_api'
                        }
                        print(f"Method 2 Success: {len(transcript_text)} characters")
                        return video_info
                        
            except Exception as e:
                print(f"Method 2 failed: {str(e)}")
            
            # Method 3: Try alternative browser-like approach
            print("Method 3: Trying alternative browser approach...")
            alt_transcript = YouTubeService.get_transcript_alternative(video_id)
            
            if alt_transcript and alt_transcript.strip():
                video_info = {
                    'video_id': video_id,
                    'url': url,
                    'transcript': alt_transcript,
                    'duration': 0,
                    'method': 'browser_scraping'
                }
                print(f"Method 3 Success: {len(alt_transcript)} characters")
                return video_info
            
            # Method 4: Ask user to copy transcript manually
            raise Exception("""
Unable to automatically extract transcript. Try these alternatives:

1. Use a video with clear captions/subtitles
2. Or manually copy the transcript:
   - Open the YouTube video in browser
   - Click the "..." button → "Show transcript"
   - Copy the transcript text
   - Use the "Text Input" tab instead of YouTube tab

Recommended test videos with transcripts:
- https://www.youtube.com/watch?v=dQw4w9WgXcQ (Rick Roll - has auto captions)
- Any TED-Ed video
- Educational channels like Crash Course
            """)
                
        except ValueError as e:
            raise Exception(str(e))
        except Exception as e:
            if "Unable to automatically extract transcript" in str(e):
                raise e
            else:
                error_msg = str(e)
                if "Could not retrieve a transcript" in error_msg:
                    raise Exception("This video doesn't have captions/subtitles available. Please try a different video with captions.")
                elif "private" in error_msg.lower():
                    raise Exception("This video is private or restricted")
                elif "unavailable" in error_msg.lower():
                    raise Exception("Video is unavailable or has been removed")
                else:
                    raise Exception(f"Failed to get transcript: {error_msg}")