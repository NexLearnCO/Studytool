#!/usr/bin/env python3
import sys, os
import yt_dlp, whisper

def download_to_wav(url, outdir="audio"):
    os.makedirs(outdir, exist_ok=True)
    opts = {
        "format": "bestaudio/best",
        "outtmpl": f"{outdir}/%(id)s.%(ext)s",
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "wav",
            "preferredquality": "192",
        }],
        "quiet": True,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
    return f"{outdir}/{info['id']}.wav"

def transcribe_whisper(wav_path, model_name="tiny.en"):
    model = whisper.load_model(model_name)
    return model.transcribe(wav_path)["text"]

if __name__ == "__main__":
    if len(sys.argv)<2:
        print("Usage: python whisper_transcribe.py <YouTube_URL>"); sys.exit(1)
    wav = download_to_wav(sys.argv[1])
    print("Transcribing…")
    text = transcribe_whisper(wav, model_name="tiny.en")
    open("transcript_whisper.txt","w",encoding="utf-8").write(text)
    print("Saved transcript_whisper.txt")
