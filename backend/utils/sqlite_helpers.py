"""SQLite helpers for safe schema migrations."""
import sqlite3
from typing import List, Dict, Any


def ensure_note_columns(database_url: str) -> None:
    """Safely add new columns to notes table if they don't exist."""
    # Extract SQLite path from URL
    db_path = database_url.replace('sqlite:///', '')
    
    required_columns = {
        'org_id': 'TEXT',
        'course_id': 'TEXT', 
        'folder_id': 'TEXT',
        'content_md': 'TEXT',
        'content_json': 'TEXT',
        'tags': 'TEXT',
        'status': 'TEXT DEFAULT "draft"',
        'deleted_at': 'INTEGER'
    }
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Get existing columns
        cursor.execute("PRAGMA table_info(notes)")
        existing_columns = {row[1] for row in cursor.fetchall()}
        
        # Add missing columns
        for col_name, col_type in required_columns.items():
            if col_name not in existing_columns:
                try:
                    cursor.execute(f"ALTER TABLE notes ADD COLUMN {col_name} {col_type}")
                    print(f"Added column {col_name} to notes table")
                except sqlite3.Error as e:
                    print(f"Warning: Could not add column {col_name}: {e}")
        
        # Update created_at and updated_at to INTEGER if they're still DATETIME
        cursor.execute("PRAGMA table_info(notes)")
        columns_info = {row[1]: row[2] for row in cursor.fetchall()}
        
        if columns_info.get('created_at') in ['DATETIME', 'TIMESTAMP']:
            # For existing data, convert datetime to epoch
            cursor.execute("""
                UPDATE notes 
                SET created_at = CAST(strftime('%s', created_at) * 1000 AS INTEGER)
                WHERE created_at IS NOT NULL AND typeof(created_at) = 'text'
            """)
            
        if columns_info.get('updated_at') in ['DATETIME', 'TIMESTAMP']:
            cursor.execute("""
                UPDATE notes 
                SET updated_at = CAST(strftime('%s', updated_at) * 1000 AS INTEGER)
                WHERE updated_at IS NOT NULL AND typeof(updated_at) = 'text'
            """)
        
        conn.commit()
        
    except Exception as e:
        print(f"Error ensuring note columns: {e}")
        conn.rollback()
    finally:
        conn.close()
