import PyPDF2
from io import BytesIO

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