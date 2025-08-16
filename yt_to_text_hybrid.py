#!/usr/bin/env python3
import sys
import os
import tempfile
import yt_dlp
import openai

def download_and_transcribe(video_id):
    """Download audio and transcribe using OpenAI Whisper"""
    try:
        # Set OpenAI API key
        openai.api_key = os.getenv('OPENAI_API_KEY')
        if not openai.api_key:
            print("❌ OpenAI API key not found!")
            return None
        
        print(f"🎬 Processing YouTube video: {video_id}")
        
        # Create temp directory
        temp_dir = tempfile.mkdtemp()
        print(f"📁 Using temp directory: {temp_dir}")
        
        # YouTube URL
        url = f"https://www.youtube.com/watch?v={video_id}"
        
        print("📥 Downloading audio...")
        
        # yt-dlp options optimized for our use case
        ydl_opts = {
            'format': 'bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio/best[filesize<25M]',
            'outtmpl': f'{temp_dir}/%(title)s.%(ext)s',
            'quiet': True,
            'no_warnings': True,
            'extractaudio': True,
            'audioformat': 'm4a',
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'cookiefile': None,  # You can add cookie file path if needed
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            title = info.get('title', 'Unknown Video')
            duration = info.get('duration', 0)
            
            # Find downloaded file
            downloaded_files = [f for f in os.listdir(temp_dir) if os.path.isfile(os.path.join(temp_dir, f))]
            
            if not downloaded_files:
                print("❌ No audio file downloaded")
                return None
                
            audio_file = os.path.join(temp_dir, downloaded_files[0])
            print(f"🎵 Audio downloaded: {downloaded_files[0]}")
            
            # Check file size
            file_size_mb = os.path.getsize(audio_file) / (1024 * 1024)
            if file_size_mb > 25:
                print(f"⚠️ File too large for Whisper API: {file_size_mb:.1f} MB (max 25MB)")
                # Clean up
                os.remove(audio_file)
                os.rmdir(temp_dir)
                return None
            
            print("🎤 Transcribing with OpenAI Whisper...")
            
            # Transcribe with OpenAI Whisper
            with open(audio_file, 'rb') as audio:
                transcript = openai.Audio.transcribe(
                    model="whisper-1",
                    file=audio,
                    response_format="text"
                )
            
            # Clean up temp files
            os.remove(audio_file)
            os.rmdir(temp_dir)
            
            if transcript and len(transcript.strip()) > 10:
                print(f"✅ Transcription complete: {len(transcript)} characters")
                return transcript.strip()
            else:
                print("❌ Transcription failed or too short")
                return None
                
    except Exception as e:
        print(f"❌ Error in download_and_transcribe: {str(e)}")
        # Clean up on error
        try:
            if 'audio_file' in locals() and os.path.exists(audio_file):
                os.remove(audio_file)
            if 'temp_dir' in locals() and os.path.exists(temp_dir):
                os.rmdir(temp_dir)
        except:
            pass
        return None

def main():
    """Main function for command line usage"""
    if len(sys.argv) != 2:
        print("Usage: python yt_to_text_hybrid.py <video_id>")
        sys.exit(1)
    
    video_id = sys.argv[1]
    transcript = download_and_transcribe(video_id)
    
    if transcript:
        print(transcript)
    else:
        print("Failed to transcribe video")
        sys.exit(1)

if __name__ == "__main__":
    main()