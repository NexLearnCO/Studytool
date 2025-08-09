import os
import tempfile
import openai
import yt_dlp
import re
import json
from datetime import datetime
from config import Config

class YouTubeAudioService:
    def __init__(self):
        openai.api_key = Config.OPENAI_API_KEY
        self.cache_dir = "cache"
        os.makedirs(self.cache_dir, exist_ok=True)
        
    def extract_video_id(self, url):
        """Extract video ID from YouTube URL"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=)([\w-]+)',
            r'(?:youtu\.be\/)([\w-]+)',
            r'(?:youtube\.com\/embed\/)([\w-]+)',
            r'(?:youtube\.com\/shorts\/)([\w-]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        # If no pattern matches, assume the URL might be just the video ID
        if len(url) == 11:
            return url
            
        raise ValueError("Could not extract video ID from URL")
    
    def get_cached_transcript(self, video_id):
        """Check if transcript is already cached"""
        cache_file = os.path.join(self.cache_dir, f"{video_id}.json")
        
        if os.path.exists(cache_file):
            try:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    print(f"Using cached transcript for {video_id}")
                    return data
            except:
                # If cache file is corrupted, delete it
                os.remove(cache_file)
        
        return None
    
    def save_to_cache(self, video_id, data):
        """Save transcript to cache"""
        try:
            cache_file = os.path.join(self.cache_dir, f"{video_id}.json")
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Failed to save cache: {e}")
    
    def get_video_info(self, url):
        """Get video metadata without downloading"""
        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False,
                'skip_download': True
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                return {
                    'title': info.get('title', 'Unknown Video'),
                    'duration': info.get('duration', 0),
                    'uploader': info.get('uploader', 'Unknown')
                }
        except Exception as e:
            print(f"Failed to get video info: {e}")
            return {
                'title': 'Unknown Video',
                'duration': 0,
                'uploader': 'Unknown'
            }
    
    def download_audio(self, youtube_url, temp_dir):
        """Download audio from YouTube video"""
        try:
            video_id = self.extract_video_id(youtube_url)
            output_path = os.path.join(temp_dir, f"{video_id}")
            
            # Configure yt-dlp options for fast, small audio download
            ydl_opts = {
                'format': 'bestaudio[filesize<25M]/bestaudio/best',  # Prefer files under 25MB for Whisper API
                'outtmpl': f"{output_path}.%(ext)s",
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False,
                'no_check_certificate': True,
                'socket_timeout': 60,
                'retries': 3,
            }
            
            # Try to add FFmpeg post-processor if available
            try:
                ydl_opts['postprocessors'] = [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '96',  # Lower quality = smaller file = faster processing
                }]
            except:
                # If FFmpeg is not available, just download best audio format
                print("FFmpeg not available, downloading best audio format directly")
            
            print(f"Downloading audio from: {youtube_url}")
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(youtube_url, download=True)
                
                video_title = info.get('title', 'Unknown')
                duration = info.get('duration', 0)
            
            # Find the downloaded file - check all possible extensions
            final_path = None
            possible_extensions = ['.mp3', '.m4a', '.webm', '.opus', '.mp4', '.aac', '.ogg']
            
            for ext in possible_extensions:
                check_path = f"{output_path}{ext}"
                if os.path.exists(check_path):
                    final_path = check_path
                    break
            
            # If no specific file found, list all files in temp_dir to debug
            if not final_path:
                print(f"Looking for downloaded files in: {temp_dir}")
                files_in_dir = os.listdir(temp_dir)
                print(f"Files found: {files_in_dir}")
                
                # Try to find any audio file
                for file in files_in_dir:
                    if any(file.endswith(ext) for ext in possible_extensions):
                        final_path = os.path.join(temp_dir, file)
                        print(f"Found audio file: {final_path}")
                        break
            
            if not final_path or not os.path.exists(final_path):
                available_files = os.listdir(temp_dir) if os.path.exists(temp_dir) else []
                raise Exception(f"Audio file not found after download. Available files: {available_files}")
            
            file_size = os.path.getsize(final_path) / (1024 * 1024)  # Size in MB
            print(f"Audio downloaded: {video_title} ({file_size:.1f}MB, {duration}s)")
            
            return {
                'audio_path': final_path,
                'title': video_title,
                'duration': duration,
                'file_size_mb': file_size
            }
            
        except Exception as e:
            raise Exception(f"Failed to download audio: {str(e)}")
    
    def transcribe_audio(self, audio_path, video_title="Video"):
        """Transcribe audio using OpenAI Whisper API"""
        try:
            file_size_mb = os.path.getsize(audio_path) / (1024 * 1024)
            
            print(f"Transcribing audio ({file_size_mb:.1f}MB) using Whisper...")
            
            # Whisper API has a 25MB limit
            if file_size_mb > 25:
                return self.transcribe_large_audio(audio_path, video_title)
            
            with open(audio_path, "rb") as audio_file:
                transcript = openai.Audio.transcribe(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text",
                    # language="en"  # Remove this to let Whisper auto-detect language
                )
            
            print(f"Transcription complete: {len(transcript)} characters")
            return transcript.strip()
            
        except Exception as e:
            # If Whisper fails, try to provide useful feedback
            if "file size" in str(e).lower():
                raise Exception("Audio file too large for Whisper API (max 25MB). Try a shorter video.")
            elif "quota" in str(e).lower() or "rate limit" in str(e).lower():
                raise Exception("OpenAI API quota exceeded. Please check your usage limits.")
            else:
                raise Exception(f"Failed to transcribe audio: {str(e)}")
    
    def transcribe_large_audio(self, audio_path, video_title="Video"):
        """Handle large audio files by splitting them"""
        try:
            from pydub import AudioSegment
            
            print("Audio file is large, splitting into chunks...")
            
            # Load audio
            audio = AudioSegment.from_file(audio_path)
            
            # Split into 8-minute chunks (8 * 60 * 1000 ms) to stay well under 25MB
            chunk_length = 8 * 60 * 1000
            chunks = []
            temp_dir = os.path.dirname(audio_path)
            
            for i in range(0, len(audio), chunk_length):
                chunk = audio[i:i + chunk_length]
                chunk_path = os.path.join(temp_dir, f"chunk_{i//1000}.mp3")
                chunk.export(chunk_path, format="mp3", bitrate="96k")
                chunks.append(chunk_path)
            
            # Transcribe each chunk
            full_transcript = ""
            for i, chunk_path in enumerate(chunks):
                print(f"Transcribing chunk {i+1}/{len(chunks)}...")
                
                with open(chunk_path, "rb") as audio_file:
                    chunk_transcript = openai.Audio.transcribe(
                        model="whisper-1",
                        file=audio_file,
                        response_format="text"
                    )
                
                full_transcript += chunk_transcript + " "
                
                # Clean up chunk file
                try:
                    os.remove(chunk_path)
                except:
                    pass
            
            return full_transcript.strip()
            
        except ImportError:
            raise Exception("pydub is required for large audio files. Please install it: pip install pydub")
        except Exception as e:
            raise Exception(f"Failed to process large audio file: {str(e)}")
    
    def get_transcript(self, youtube_url):
        """Main method: YouTube URL → Audio → Transcript with caching"""
        try:
            # Extract video ID
            video_id = self.extract_video_id(youtube_url)
            
            # Check cache first
            cached = self.get_cached_transcript(video_id)
            if cached:
                return cached
            
            # Check video duration first to warn about long videos
            video_info = self.get_video_info(youtube_url)
            duration_minutes = video_info['duration'] / 60 if video_info['duration'] else 0
            
            if duration_minutes > 20:
                print(f"Warning: Video is {duration_minutes:.1f} minutes long. This may take a while and cost more.")
            
            # Use temporary directory for audio processing
            with tempfile.TemporaryDirectory() as temp_dir:
                # Step 1: Download audio
                audio_info = self.download_audio(youtube_url, temp_dir)
                
                # Step 2: Transcribe audio
                transcript = self.transcribe_audio(
                    audio_info['audio_path'],
                    audio_info['title']
                )
                
                # Step 3: Prepare result
                result = {
                    'video_id': video_id,
                    'title': audio_info['title'],
                    'transcript': transcript,
                    'duration': audio_info['duration'],
                    'url': youtube_url,
                    'method': 'audio_whisper',
                    'processed_at': datetime.now().isoformat()
                }
                
                # Step 4: Save to cache for future use
                self.save_to_cache(video_id, result)
                
                print(f"✅ Successfully processed: {audio_info['title']}")
                return result
                
        except Exception as e:
            raise Exception(f"YouTube audio processing failed: {str(e)}")
    
    def cleanup_cache(self, days_old=7):
        """Clean up old cache files"""
        try:
            import time
            cutoff_time = time.time() - (days_old * 24 * 60 * 60)
            
            for filename in os.listdir(self.cache_dir):
                if filename.endswith('.json'):
                    file_path = os.path.join(self.cache_dir, filename)
                    if os.path.getmtime(file_path) < cutoff_time:
                        os.remove(file_path)
                        print(f"Cleaned up old cache: {filename}")
        except Exception as e:
            print(f"Cache cleanup failed: {e}")