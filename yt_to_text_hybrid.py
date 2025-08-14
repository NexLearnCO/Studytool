#!/usr/bin/env python3
import sys, os
import yt_dlp
import openai

# Set your OpenAI API key from environment variable
openai.api_key = os.getenv('OPENAI_API_KEY')

def download_audio_simple(url, outdir="audio"):
    """Download audio without FFmpeg conversion"""
    os.makedirs(outdir, exist_ok=True)
    opts = {
        "format": "bestaudio[filesize<25M]/bestaudio/best[filesize<25M]",
        "outtmpl": f"{outdir}/%(id)s.%(ext)s",
        "quiet": False,
        "no_warnings": False,
        "extract_flat": False,
        "cookiefile": None,
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    }
    
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
        video_id = info['id']
        title = info.get('title', 'Unknown')
        duration = info.get('duration', 0)
        
        # Find the downloaded file
        possible_extensions = ['.m4a', '.webm', '.mp3', '.opus', '.mp4']
        downloaded_file = None
        
        for ext in possible_extensions:
            potential_file = f"{outdir}/{video_id}{ext}"
            if os.path.exists(potential_file):
                downloaded_file = potential_file
                break
        
        if not downloaded_file:
            # Check if any file was downloaded
            files_in_dir = [f for f in os.listdir(outdir) if f.startswith(video_id)]
            if files_in_dir:
                downloaded_file = os.path.join(outdir, files_in_dir[0])
        
        return downloaded_file, title, duration, video_id

def transcribe_openai_whisper(audio_path, video_title="Video"):
    """Transcribe using OpenAI's Whisper API"""
    try:
        file_size_mb = os.path.getsize(audio_path) / (1024 * 1024)
        print(f"📊 Audio file size: {file_size_mb:.1f} MB")
        
        if file_size_mb > 25:
            print("⚠️  File too large for Whisper API (max 25MB)")
            return None
        
        print("🤖 Transcribing with OpenAI Whisper API...")
        
        with open(audio_path, "rb") as audio_file:
            transcript = openai.Audio.transcribe(
                model="whisper-1",
                file=audio_file,
                response_format="text",
                # language="en"  # Auto-detect language
            )
        
        return transcript.strip()
        
    except Exception as e:
        print(f"❌ Transcription failed: {str(e)}")
        return None

def main():
    if len(sys.argv) < 2:
        print("🎯 Usage: python yt_to_text_hybrid.py <YouTube_URL>")
        print("📋 This script downloads audio and transcribes using OpenAI Whisper API")
        print("⚠️  Requires OPENAI_API_KEY environment variable")
        sys.exit(1)
    
    url = sys.argv[1]
    
    if not openai.api_key:
        print("❌ OpenAI API key not found!")
        print("💡 Set environment variable: OPENAI_API_KEY=your_key_here")
        sys.exit(1)
    
    try:
        print(f"📺 Processing: {url}")
        
        # Step 1: Download audio
        print("📥 Downloading audio...")
        audio_file, title, duration, video_id = download_audio_simple(url)
        
        if not audio_file:
            print("❌ Failed to download audio")
            return
        
        print(f"✅ Downloaded: {title}")
        print(f"📁 File: {audio_file}")
        print(f"⏱️  Duration: {duration} seconds ({duration/60:.1f} minutes)")
        
        # Step 2: Transcribe with OpenAI
        transcript = transcribe_openai_whisper(audio_file, title)
        
        if transcript:
            # Step 3: Save transcript
            output_file = f"transcript_{video_id}.txt"
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(f"Title: {title}\n")
                f.write(f"URL: {url}\n")
                f.write(f"Duration: {duration} seconds ({duration/60:.1f} minutes)\n")
                f.write(f"Transcribed: OpenAI Whisper API\n")
                f.write("-" * 60 + "\n\n")
                f.write(transcript)
            
            print(f"✅ Transcript saved: {output_file}")
            print(f"📝 Length: {len(transcript)} characters")
            
            # Show preview
            preview = transcript[:300] + "..." if len(transcript) > 300 else transcript
            print(f"\n📖 Preview:\n{preview}")
            
            # Optional: Clean up audio file
            keep_audio = input("\n🗑️  Delete audio file? (y/N): ").lower().startswith('y')
            if keep_audio and os.path.exists(audio_file):
                os.remove(audio_file)
                print("🗑️  Audio file deleted")
        else:
            print("❌ Transcription failed")
    
    except KeyboardInterrupt:
        print("\n⏹️  Interrupted by user")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
