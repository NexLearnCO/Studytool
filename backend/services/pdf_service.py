import PyPDF2
from io import BytesIO
import base64

class PDFService:
    @staticmethod
    def extract_text(file):
        """Extract text from PDF file"""
        try:
            # Read PDF file
            pdf_reader = PyPDF2.PdfReader(BytesIO(file.read()))
            
            # Extract text from all pages
            text = ""
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n\n"
            
            # Clean up text
            text = text.strip()
            
            if not text:
                raise ValueError("No text found in PDF")
            
            return text
            
        except Exception as e:
            raise Exception(f"Failed to extract PDF text: {str(e)}")
    
    @staticmethod
    def extract_text_from_file(file_info):
        """Extract text from file info (base64 encoded data)"""
        try:
            # Get file data from base64
            file_data = file_info.get('data', '')
            if file_data.startswith('data:'):
                # Remove data URL prefix
                file_data = file_data.split(',')[1]
            
            # Decode base64 data
            file_bytes = base64.b64decode(file_data)
            
            # Read PDF file
            pdf_reader = PyPDF2.PdfReader(BytesIO(file_bytes))
            
            # Extract text from all pages
            text = ""
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n\n"
            
            # Clean up text
            text = text.strip()
            
            if not text:
                raise ValueError("No text found in PDF")
            
            return text
            
        except Exception as e:
            raise Exception(f"Failed to extract PDF text from file info: {str(e)}")