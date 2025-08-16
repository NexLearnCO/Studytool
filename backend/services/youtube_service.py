import re
import os
import tempfile
import subprocess
import openai
import sys

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
    def get_transcript(url):
        """Get transcript from YouTube video using hybrid approach (audio + Whisper)"""
        try:
            video_id = YouTubeService.extract_video_id(url)
            print(f"Processing YouTube video: {video_id}")
            
            # Use hybrid approach (yt-dlp + OpenAI Whisper)
            try:
                print("Method 1: Trying improved audio extraction with OpenAI Whisper...")
                
                # Call the hybrid script
                script_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'yt_to_text_hybrid.py')
                
                result = subprocess.run([
                    'python', script_path, video_id
                ], capture_output=True, text=True, timeout=300)
                
                if result.returncode == 0:
                    transcript = result.stdout.strip()
                    if transcript and len(transcript) > 50:
                        print(f"Method 1 Success: {len(transcript)} characters")
                        return {
                            'transcript': transcript,
                            'title': f"YouTube Video: {video_id}",
                            'video_id': video_id
                        }
                else:
                    print(f"❌ Hybrid transcription failed: {result.stderr}")
                    
            except subprocess.TimeoutExpired:
                print("❌ Hybrid method timed out")
            except Exception as e:
                print(f"❌ Hybrid method error: {str(e)}")
            
            # If all methods fail, provide helpful error message
            error_msg = f"""Unable to automatically extract transcript. Try these alternatives:
1. Use a video with clear captions/subtitles
2. Or manually copy the transcript:
   - Open the YouTube video in browser
   - Click the "..." button → "Show transcript"
   - Copy the transcript text
   - Use the "Text Input" tab instead of YouTube tab

Recommended test videos with transcripts:
- https://www.youtube.com/watch?v=dQw4w9WgXcQ (Rick Roll - has auto captions)
- Any TED-Ed video
- Educational channels like Crash Course"""

            raise Exception(error_msg)
            
        except Exception as e:
            print(f"YouTube processing error for {url}: {e}")
            raise Exception(str(e))