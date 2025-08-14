from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from models import Base, Note, Source, Flashcard, Quiz, QuizResult, Deck, DeckCard, Review
import json
from datetime import datetime
from typing import List, Dict, Optional


class DatabaseService:
    def __init__(self, database_url: str = "sqlite:///nexlearn.db"):
        self.engine = create_engine(database_url)
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
    
    def get_session(self) -> Session:
        return self.SessionLocal()
    
    # =====================================================
    # NOTES MANAGEMENT
    # =====================================================
    
    def save_note(self, title: str, content: str, metadata: Dict = None) -> int:
        """Save a note and return its ID"""
        with self.get_session() as session:
            note = Note(
                title=title,
                content=content,
                language=metadata.get('language', 'zh-tw') if metadata else 'zh-tw',
                exam_system=metadata.get('exam_system') if metadata else None,
                subject=metadata.get('subject') if metadata else None,
                topic=metadata.get('topic') if metadata else None
            )
            session.add(note)
            session.commit()
            session.refresh(note)
            
            # Save sources if provided
            if metadata and 'sources' in metadata:
                for source_info in metadata['sources']:
                    source = Source(
                        note_id=note.id,
                        type=source_info.get('type', 'unknown'),
                        url=source_info.get('url'),
                        meta=source_info
                    )
                    session.add(source)
                session.commit()
            
            return note.id
    
    def get_note(self, note_id: int) -> Optional[Dict]:
        """Get a note by ID"""
        with self.get_session() as session:
            note = session.query(Note).filter(Note.id == note_id).first()
            if not note:
                return None
            
            # Get sources
            sources = session.query(Source).filter(Source.note_id == note_id).all()
            
            return {
                'id': note.id,
                'title': note.title,
                'content': note.content,
                'language': note.language,
                'exam_system': note.exam_system,
                'subject': note.subject,
                'topic': note.topic,
                'created_at': note.created_at.isoformat(),
                'updated_at': note.updated_at.isoformat(),
                'sources': [{'type': s.type, 'url': s.url, 'meta': s.meta} for s in sources]
            }
    
    def get_notes_list(self, limit: int = 20, offset: int = 0) -> List[Dict]:
        """Get a list of notes with basic info"""
        with self.get_session() as session:
            notes = session.query(Note).order_by(Note.created_at.desc()).offset(offset).limit(limit).all()
            
            return [{
                'id': note.id,
                'title': note.title,
                'subject': note.subject,
                'topic': note.topic,
                'created_at': note.created_at.isoformat(),
                'content_preview': note.content[:200] + '...' if len(note.content) > 200 else note.content
            } for note in notes]
    
    def update_note(self, note_id: int, title: str = None, content: str = None) -> bool:
        """Update a note"""
        with self.get_session() as session:
            note = session.query(Note).filter(Note.id == note_id).first()
            if not note:
                return False
            
            if title:
                note.title = title
            if content:
                note.content = content
            note.updated_at = datetime.utcnow()
            
            session.commit()
            return True
    
    def delete_note(self, note_id: int) -> bool:
        """Delete a note and its related data"""
        with self.get_session() as session:
            note = session.query(Note).filter(Note.id == note_id).first()
            if not note:
                return False
            
            # Delete related sources
            session.query(Source).filter(Source.note_id == note_id).delete()
            
            # Delete related flashcards
            session.query(Flashcard).filter(Flashcard.note_id == note_id).delete()
            
            # Delete the note
            session.delete(note)
            session.commit()
            return True
    
    # =====================================================
    # FLASHCARDS MANAGEMENT
    # =====================================================
    
    def save_flashcard(self, note_id: int, front: str, back: str, 
                      ai_generated: bool = False, user_approved: bool = False) -> int:
        """Save a flashcard"""
        with self.get_session() as session:
            flashcard = Flashcard(
                note_id=note_id,
                front=front,
                back=back,
                ai_generated=ai_generated,
                user_approved=user_approved
            )
            session.add(flashcard)
            session.commit()
            session.refresh(flashcard)
            return flashcard.id
    
    def get_flashcards_by_note(self, note_id: int) -> List[Dict]:
        """Get all flashcards for a note"""
        with self.get_session() as session:
            flashcards = session.query(Flashcard).filter(Flashcard.note_id == note_id).all()
            
            return [{
                'id': card.id,
                'front': card.front,
                'back': card.back,
                'ai_generated': card.ai_generated,
                'user_approved': card.user_approved,
                'quality_score': card.quality_score,
                'created_at': card.created_at.isoformat()
            } for card in flashcards]
    
    def update_flashcard(self, card_id: int, front: str = None, back: str = None, 
                        user_approved: bool = None, quality_score: float = None) -> bool:
        """Update a flashcard"""
        with self.get_session() as session:
            card = session.query(Flashcard).filter(Flashcard.id == card_id).first()
            if not card:
                return False
            
            if front:
                card.front = front
            if back:
                card.back = back
            if user_approved is not None:
                card.user_approved = user_approved
            if quality_score is not None:
                card.quality_score = quality_score
            card.updated_at = datetime.utcnow()
            
            session.commit()
            return True
    
    def delete_flashcard(self, card_id: int) -> bool:
        """Delete a flashcard"""
        with self.get_session() as session:
            card = session.query(Flashcard).filter(Flashcard.id == card_id).first()
            if not card:
                return False
            
            session.delete(card)
            session.commit()
            return True
    
    # =====================================================
    # QUIZ MANAGEMENT
    # =====================================================
    
    def save_quiz(self, note_id: int, quiz_data: List[Dict]) -> int:
        """Save a quiz"""
        with self.get_session() as session:
            quiz = Quiz(
                note_id=note_id,
                payload_json=quiz_data
            )
            session.add(quiz)
            session.commit()
            session.refresh(quiz)
            return quiz.id
    
    def get_quiz(self, quiz_id: int) -> Optional[Dict]:
        """Get a quiz by ID"""
        with self.get_session() as session:
            quiz = session.query(Quiz).filter(Quiz.id == quiz_id).first()
            if not quiz:
                return None
            
            return {
                'id': quiz.id,
                'note_id': quiz.note_id,
                'questions': quiz.payload_json,
                'created_at': quiz.created_at.isoformat()
            }
    
    def save_quiz_result(self, quiz_id: int, score: float, answers: List[Dict]) -> int:
        """Save quiz results"""
        with self.get_session() as session:
            result = QuizResult(
                quiz_id=quiz_id,
                score=score,
                answers_json=answers
            )
            session.add(result)
            session.commit()
            session.refresh(result)
            return result.id
    
    # =====================================================
    # DECK MANAGEMENT (for organized flashcard collections)
    # =====================================================
    
    def create_deck(self, name: str, description: str = None) -> int:
        """Create a new deck"""
        with self.get_session() as session:
            deck = Deck(
                name=name,
                description=description
            )
            session.add(deck)
            session.commit()
            session.refresh(deck)
            return deck.id
    
    def add_card_to_deck(self, deck_id: int, card_id: int) -> bool:
        """Add a flashcard to a deck"""
        with self.get_session() as session:
            # Check if already exists
            existing = session.query(DeckCard).filter(
                DeckCard.deck_id == deck_id, 
                DeckCard.card_id == card_id
            ).first()
            
            if existing:
                return True  # Already in deck
            
            deck_card = DeckCard(deck_id=deck_id, card_id=card_id)
            session.add(deck_card)
            session.commit()
            return True
    
    def get_decks(self) -> List[Dict]:
        """Get all decks"""
        with self.get_session() as session:
            decks = session.query(Deck).order_by(Deck.created_at.desc()).all()
            
            result = []
            for deck in decks:
                card_count = session.query(DeckCard).filter(DeckCard.deck_id == deck.id).count()
                result.append({
                    'id': deck.id,
                    'name': deck.name,
                    'description': deck.description,
                    'card_count': card_count,
                    'created_at': deck.created_at.isoformat()
                })
            
            return result
