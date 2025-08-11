#!/usr/bin/env python3
import sys, os
import yt_dlp
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    print("⚠️  Whisper not installed. Install with: pip install openai-whisper")

def download_audio_no_ffmpeg(url, outdir="audio"):
    """Download audio without requiring FFmpeg"""
    os.makedirs(outdir, exist_ok=True)
    opts = {
        "format": "bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio/best",
        "outtmpl": f"{outdir}/%(id)s.%(ext)s",
        "quiet": True,
        "no_warnings": False,
    }
    
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
        video_id = info['id']
        title = info.get('title', 'Unknown')
        
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
        
        return downloaded_file, title, info

def transcribe_whisper_local(audio_path, model_name="tiny.en"):
    """Transcribe using local Whisper model"""
    if not WHISPER_AVAILABLE:
        raise ImportError("Whisper not available. Install with: pip install openai-whisper")
    
    print(f"Loading Whisper model: {model_name}")
    model = whisper.load_model(model_name)
    
    print("Transcribing audio...")
    result = model.transcribe(audio_path)
    return result["text"]

def main():
    if len(sys.argv) < 2:
        print("Usage: python yt_to_text_improved.py <YouTube_URL> [whisper_model]")
        print("Whisper models: tiny.en, base.en, small.en, medium.en, large")
        sys.exit(1)
    
    url = sys.argv[1]
    model_name = sys.argv[2] if len(sys.argv) > 2 else "tiny.en"
    
    try:
        print(f"📺 Downloading audio from: {url}")
        audio_file, title, info = download_audio_no_ffmpeg(url)
        
        if not audio_file:
            print("❌ Failed to download audio file")
            return
        
        print(f"✅ Downloaded: {title}")
        print(f"📁 Audio file: {audio_file}")
        
        # Get file size
        file_size_mb = os.path.getsize(audio_file) / (1024 * 1024)
        print(f"📊 File size: {file_size_mb:.1f} MB")
        
        if WHISPER_AVAILABLE:
            print(f"🤖 Starting transcription with model: {model_name}")
            transcript = transcribe_whisper_local(audio_file, model_name)
            
            # Save transcript
            output_file = f"transcript_{info['id']}.txt"
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(f"Title: {title}\n")
                f.write(f"URL: {url}\n")
                f.write(f"Duration: {info.get('duration', 'Unknown')} seconds\n")
                f.write("-" * 50 + "\n")
                f.write(transcript)
            
            print(f"✅ Transcript saved to: {output_file}")
            print(f"📝 Transcript length: {len(transcript)} characters")
            
            # Show first 200 characters
            preview = transcript[:200] + "..." if len(transcript) > 200 else transcript
            print(f"\n📖 Preview:\n{preview}")
        else:
            print("⚠️  Whisper not available. Audio downloaded but not transcribed.")
            print("💡 Install Whisper with: pip install openai-whisper")
            print("💡 Or use the web version with OpenAI API")
        
        # Clean up audio file option
        keep_audio = input("\n🗑️  Keep audio file? (y/N): ").lower().startswith('y')
        if not keep_audio and os.path.exists(audio_file):
            os.remove(audio_file)
            print("🗑️  Audio file deleted")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()