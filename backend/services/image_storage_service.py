"""
Unified Image Storage Service
Supports both local storage and S3, with easy migration path
"""

import os
import hashlib
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from config import Config


class ImageStorageInterface(ABC):
    """Abstract interface for image storage backends"""
    
    @abstractmethod
    def save_image(self, image_bytes: bytes, doc_folder: str, filename: str) -> str:
        """Save image and return public URL"""
        pass
    
    @abstractmethod
    def get_public_url(self, doc_folder: str, filename: str) -> str:
        """Get public URL for accessing the image"""
        pass
    
    @abstractmethod
    def exists(self, doc_folder: str, filename: str) -> bool:
        """Check if image exists"""
        pass


class LocalImageStorage(ImageStorageInterface):
    """Local filesystem storage implementation"""
    
    def __init__(self, static_root: str, url_prefix: str = "/static"):
        self.static_root = static_root
        self.url_prefix = url_prefix
    
    def save_image(self, image_bytes: bytes, doc_folder: str, filename: str) -> str:
        """Save image to local filesystem"""
        assets_dir = os.path.join(self.static_root, "assets", doc_folder)
        os.makedirs(assets_dir, exist_ok=True)
        
        file_path = os.path.join(assets_dir, filename)
        
        # Only save if doesn't exist (deduplication)
        if not os.path.exists(file_path):
            with open(file_path, 'wb') as f:
                f.write(image_bytes)
        
        return self.get_public_url(doc_folder, filename)
    
    def get_public_url(self, doc_folder: str, filename: str) -> str:
        """Get public URL for local static files"""
        return f"{self.url_prefix}/assets/{doc_folder}/{filename}"
    
    def exists(self, doc_folder: str, filename: str) -> bool:
        """Check if file exists locally"""
        file_path = os.path.join(self.static_root, "assets", doc_folder, filename)
        return os.path.exists(file_path)


class S3ImageStorage(ImageStorageInterface):
    """AWS S3 storage implementation (for future use)"""
    
    def __init__(self, bucket_name: str, region: str = "us-east-1", cdn_domain: Optional[str] = None):
        self.bucket_name = bucket_name
        self.region = region
        self.cdn_domain = cdn_domain
        # boto3 client would be initialized here
        
    def save_image(self, image_bytes: bytes, doc_folder: str, filename: str) -> str:
        """Save image to S3"""
        # TODO: Implement S3 upload
        key = f"assets/{doc_folder}/{filename}"
        
        # Upload to S3 with boto3
        # s3_client.put_object(Bucket=self.bucket_name, Key=key, Body=image_bytes)
        
        return self.get_public_url(doc_folder, filename)
    
    def get_public_url(self, doc_folder: str, filename: str) -> str:
        """Get public URL for S3 objects"""
        if self.cdn_domain:
            return f"https://{self.cdn_domain}/assets/{doc_folder}/{filename}"
        return f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/assets/{doc_folder}/{filename}"
    
    def exists(self, doc_folder: str, filename: str) -> bool:
        """Check if object exists in S3"""
        # TODO: Implement S3 head_object check
        return False


class ImageStorageService:
    """Unified service that manages image storage with configurable backends"""
    
    def __init__(self):
        self.storage_backend = self._create_storage_backend()
    
    def _create_storage_backend(self) -> ImageStorageInterface:
        """Create appropriate storage backend based on configuration"""
        storage_type = getattr(Config, 'IMAGE_STORAGE_TYPE', 'local')
        
        if storage_type == 's3':
            # Future S3 configuration
            bucket_name = getattr(Config, 'S3_BUCKET_NAME', '')
            region = getattr(Config, 'S3_REGION', 'us-east-1')
            cdn_domain = getattr(Config, 'CDN_DOMAIN', None)
            return S3ImageStorage(bucket_name, region, cdn_domain)
        else:
            # Default to local storage
            static_root = os.path.join(os.path.dirname(__file__), "..", "static")
            return LocalImageStorage(static_root)
    
    def save_image_from_pdf(self, image_bytes: bytes, doc_id: str, page_index: int, xref: int) -> Dict[str, Any]:
        """
        Save image extracted from PDF and return metadata
        """
        # Generate stable filename using content hash
        asset_hash = hashlib.sha256(image_bytes).hexdigest()
        asset_id = asset_hash[:32]
        filename = f"{asset_id}.png"
        
        # Create safe document folder name
        safe_doc_folder = doc_id.replace('file:', '').split('/')[-1].replace('.pdf', '')
        
        # Save using configured backend
        public_url = self.storage_backend.save_image(image_bytes, safe_doc_folder, filename)
        
        # Return metadata for database storage
        return {
            'id': f'{doc_id}-p{page_index}-img{xref}',
            'kind': 'image',
            'doc_id': doc_id,
            'page': page_index,
            'asset_id': asset_id,
            'url': public_url,
            'local_path': self._get_local_path(safe_doc_folder, filename) if isinstance(self.storage_backend, LocalImageStorage) else None
        }
    
    def _get_local_path(self, doc_folder: str, filename: str) -> Optional[str]:
        """Get local file path for Vision AI analysis"""
        if isinstance(self.storage_backend, LocalImageStorage):
            return os.path.join(self.storage_backend.static_root, "assets", doc_folder, filename)
        return None
    
    def get_public_url(self, doc_folder: str, filename: str) -> str:
        """Get public URL for any image"""
        return self.storage_backend.get_public_url(doc_folder, filename)
    
    def migrate_to_s3(self):
        """Future method to migrate existing local images to S3"""
        # TODO: Implement migration logic
        pass
