import requests
import re
import json
from urllib.parse import parse_qs, urlparse

class SimpleYouTubeService:
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
    def get_transcript_simple(video_id):
        """
        Simple method using yt-dlp approach (without installing yt-dlp)
        This tries to extract subtitle URLs directly from the video page
        """
        try:
            print(f"SimpleYouTubeService: Extracting transcript for {video_id}")
            
            # Get video page
            video_url = f"https://www.youtube.com/watch?v={video_id}"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            }
            
            response = requests.get(video_url, headers=headers, timeout=15)
            
            if response.status_code != 200:
                return None
                
            page_content = response.text
            
            # Method 1: Look for automatic captions in page data
            captions_pattern = r'"captions":.*?"captionTracks":\[(.*?)\]'
            captions_match = re.search(captions_pattern, page_content, re.DOTALL)
            
            if captions_match:
                try:
                    captions_data = captions_match.group(1)
                    
                    # Extract baseUrl from the first caption track
                    url_pattern = r'"baseUrl":"([^"]+)"'
                    url_match = re.search(url_pattern, captions_data)
                    
                    if url_match:
                        caption_url = url_match.group(1)
                        # Clean up the URL
                        caption_url = caption_url.replace('\\u0026', '&').replace('\\/', '/')
                        
                        print(f"Found caption URL: {caption_url}")
                        
                        # Get the actual transcript
                        transcript_response = requests.get(caption_url, headers=headers, timeout=10)
                        
                        if transcript_response.status_code == 200:
                            transcript_text = SimpleYouTubeService._parse_transcript_xml(transcript_response.text)
                            if transcript_text and len(transcript_text.strip()) > 20:
                                return transcript_text
                                
                except Exception as e:
                    print(f"Caption URL extraction failed: {e}")
            
            # Method 2: Try manual transcript endpoints
            manual_endpoints = [
                f"https://www.youtube.com/api/timedtext?v={video_id}&lang=en&fmt=srv3",
                f"https://www.youtube.com/api/timedtext?v={video_id}&lang=en-US&fmt=srv3", 
                f"https://www.youtube.com/api/timedtext?v={video_id}&lang=en&fmt=json3",
                f"https://www.youtube.com/api/timedtext?v={video_id}&lang=en-US&fmt=json3",
            ]
            
            for endpoint in manual_endpoints:
                try:
                    print(f"Trying manual endpoint: {endpoint}")
                    resp = requests.get(endpoint, headers=headers, timeout=8)
                    if resp.status_code == 200 and resp.text.strip():
                        transcript_text = SimpleYouTubeService._parse_transcript_xml(resp.text)
                        if transcript_text and len(transcript_text.strip()) > 20:
                            return transcript_text
                except Exception as e:
                    print(f"Manual endpoint failed: {e}")
                    continue
            
            return None
            
        except Exception as e:
            print(f"SimpleYouTubeService error: {e}")
            return None
    
    @staticmethod
    def _parse_transcript_xml(content):
        """Parse transcript from XML or JSON format"""
        try:
            # Try XML parsing first
            if '<text' in content:
                import xml.etree.ElementTree as ET
                
                # Handle malformed XML
                content = re.sub(r'&(?!amp;|lt;|gt;|quot;|apos;)', '&amp;', content)
                
                root = ET.fromstring(content)
                text_parts = []
                
                for text_elem in root.findall('.//text'):
                    if text_elem.text:
                        # Clean up the text
                        text = text_elem.text.strip()
                        text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
                        if text:
                            text_parts.append(text)
                
                if text_parts:
                    return ' '.join(text_parts)
            
            # Try JSON parsing
            elif content.strip().startswith('{') or content.strip().startswith('['):
                try:
                    data = json.loads(content)
                    text_parts = []
                    
                    if isinstance(data, dict) and 'events' in data:
                        for event in data['events']:
                            if 'segs' in event:
                                for seg in event['segs']:
                                    if 'utf8' in seg:
                                        text_parts.append(seg['utf8'])
                    
                    if text_parts:
                        return ' '.join(text_parts)
                        
                except json.JSONDecodeError:
                    pass
            
            # Try regex extraction as fallback
            text_patterns = [
                r'<text[^>]*>([^<]+)</text>',
                r'"text":"([^"]+)"',
                r'"utf8":"([^"]+)"',
            ]
            
            all_text = []
            for pattern in text_patterns:
                matches = re.findall(pattern, content)
                for match in matches:
                    # Decode HTML entities and clean up
                    text = match.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
                    text = re.sub(r'\s+', ' ', text).strip()
                    if text and len(text) > 2:
                        all_text.append(text)
            
            if all_text:
                return ' '.join(all_text)
                
            return None
            
        except Exception as e:
            print(f"Transcript parsing error: {e}")
            return None
    
    @staticmethod
    def get_transcript(url):
        """Main method to get transcript with fallback to manual instructions"""
        try:
            video_id = SimpleYouTubeService.extract_video_id(url)
            print(f"SimpleYouTubeService: Processing video {video_id}")
            
            # Try simple extraction
            transcript = SimpleYouTubeService.get_transcript_simple(video_id)
            
            if transcript and transcript.strip():
                return {
                    'video_id': video_id,
                    'url': url,
                    'transcript': transcript.strip(),
                    'duration': 0
                }
            
            # If extraction fails, provide helpful guidance
            raise Exception(f"""
無法自動提取YouTube字幕。請嘗試以下方法：

🎯 **推薦解決方案**：
1. 在瀏覽器中打開這個影片：{url}
2. 點擊影片下方的「⋯」按鈕
3. 選擇「顯示文字記錄」或「Show transcript」
4. 複製所有文字記錄內容
5. 返回我們的系統，點擊「文字輸入」標籤
6. 貼上複製的文字記錄，然後點擊「生成筆記」

📺 **或者試試這些有字幕的測試影片**：
- https://www.youtube.com/watch?v=dQw4w9WgXcQ (有自動字幕)
- 任何TED演講或教育頻道的影片

💡 **提示**：手動複製的方法通常比自動提取更可靠！
            """)
            
        except ValueError as e:
            raise Exception(str(e))
        except Exception as e:
            if "無法自動提取YouTube字幕" in str(e):
                raise e
            else:
                raise Exception(f"YouTube處理失敗：{str(e)}")