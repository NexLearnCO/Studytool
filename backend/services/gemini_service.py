import google.generativeai as genai
import requests
import re
from config import Config

class GeminiService:
    def __init__(self):
        # For now, we'll use a simple approach that doesn't require Gemini API key
        # We'll create a more robust YouTube transcript extractor
        pass
    
    @staticmethod
    def extract_youtube_transcript_smart(video_id):
        """
        Smart YouTube transcript extraction using multiple methods
        """
        try:
            print(f"GeminiService: Trying smart extraction for video {video_id}")
            
            # Method 1: Try different YouTube transcript endpoints
            transcript_endpoints = [
                f"https://www.youtube.com/api/timedtext?v={video_id}&lang=en&fmt=json3",
                f"https://www.youtube.com/api/timedtext?v={video_id}&lang=en&fmt=srv3",
                f"https://www.youtube.com/api/timedtext?v={video_id}&lang=en&fmt=ttml",
                f"https://www.youtube.com/api/timedtext?v={video_id}&lang=en-US&fmt=json3",
                f"https://www.youtube.com/api/timedtext?v={video_id}&lang=zh&fmt=json3",
                f"https://www.youtube.com/api/timedtext?v={video_id}&lang=zh-TW&fmt=json3",
            ]
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            }
            
            for endpoint in transcript_endpoints:
                try:
                    print(f"Trying endpoint: {endpoint}")
                    response = requests.get(endpoint, headers=headers, timeout=10)
                    
                    if response.status_code == 200 and response.content:
                        content = response.text
                        
                        # Try to extract text from different formats
                        transcript_text = GeminiService._extract_text_from_response(content)
                        
                        if transcript_text and len(transcript_text.strip()) > 50:
                            print(f"Success with endpoint: {endpoint}")
                            return transcript_text.strip()
                            
                except Exception as e:
                    print(f"Endpoint failed: {endpoint}, error: {e}")
                    continue
            
            # Method 2: Try to get transcript URLs from video page
            video_url = f"https://www.youtube.com/watch?v={video_id}"
            try:
                print(f"Trying video page: {video_url}")
                response = requests.get(video_url, headers=headers, timeout=15)
                
                if response.status_code == 200:
                    content = response.text
                    
                    # Look for transcript URLs in the page
                    transcript_urls = GeminiService._extract_transcript_urls(content)
                    
                    for url in transcript_urls:
                        try:
                            transcript_response = requests.get(url, headers=headers, timeout=10)
                            if transcript_response.status_code == 200:
                                transcript_text = GeminiService._extract_text_from_response(transcript_response.text)
                                if transcript_text and len(transcript_text.strip()) > 50:
                                    return transcript_text.strip()
                        except:
                            continue
                            
            except Exception as e:
                print(f"Video page method failed: {e}")
            
            return None
            
        except Exception as e:
            print(f"GeminiService smart extraction failed: {e}")
            return None
    
    @staticmethod
    def _extract_text_from_response(content):
        """Extract text from various transcript formats"""
        try:
            import json
            import xml.etree.ElementTree as ET
            
            # Try JSON format first
            try:
                if content.startswith('{') or content.startswith('['):
                    data = json.loads(content)
                    
                    # Handle different JSON structures
                    text_parts = []
                    
                    if isinstance(data, dict):
                        # Look for events or actions
                        if 'events' in data:
                            for event in data['events']:
                                if 'segs' in event:
                                    for seg in event['segs']:
                                        if 'utf8' in seg:
                                            text_parts.append(seg['utf8'])
                        elif 'actions' in data:
                            for action in data['actions']:
                                if 'updateEngagementPanelAction' in action:
                                    # Extract from engagement panel
                                    pass
                    elif isinstance(data, list):
                        for item in data:
                            if isinstance(item, dict) and 'text' in item:
                                text_parts.append(item['text'])
                    
                    if text_parts:
                        return ' '.join(text_parts)
                        
            except json.JSONDecodeError:
                pass
            
            # Try XML format
            try:
                if '<' in content and '>' in content:
                    root = ET.fromstring(content)
                    text_parts = []
                    
                    # Look for text elements
                    for elem in root.iter():
                        if elem.text and elem.text.strip():
                            text_parts.append(elem.text.strip())
                    
                    if text_parts:
                        return ' '.join(text_parts)
                        
            except ET.ParseError:
                pass
            
            # Try plain text extraction with regex
            text_patterns = [
                r'"text":"([^"]+)"',
                r'<text[^>]*>([^<]+)</text>',
                r'"utf8":"([^"]+)"',
                r'"content":"([^"]+)"'
            ]
            
            all_text = []
            for pattern in text_patterns:
                matches = re.findall(pattern, content)
                all_text.extend(matches)
            
            if all_text:
                # Clean up text
                cleaned_text = []
                for text in all_text:
                    # Decode unicode escapes
                    text = text.replace('\\n', ' ').replace('\\t', ' ')
                    text = re.sub(r'\\u[0-9a-fA-F]{4}', '', text)
                    text = text.strip()
                    if text and len(text) > 2:
                        cleaned_text.append(text)
                
                return ' '.join(cleaned_text)
            
            return None
            
        except Exception as e:
            print(f"Text extraction error: {e}")
            return None
    
    @staticmethod
    def _extract_transcript_urls(page_content):
        """Extract potential transcript URLs from video page"""
        urls = []
        
        try:
            # Look for timedtext URLs
            patterns = [
                r'"baseUrl":"([^"]*timedtext[^"]*)"',
                r'https://www\.youtube\.com/api/timedtext[^"\']*',
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, page_content)
                for match in matches:
                    # Clean up the URL
                    url = match.replace('\\u0026', '&').replace('\\/', '/')
                    if 'timedtext' in url:
                        urls.append(url)
            
        except Exception as e:
            print(f"URL extraction error: {e}")
        
        return urls