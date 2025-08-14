from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON, Float, UniqueConstraint
from datetime import datetime

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Note(Base):
    __tablename__ = 'notes'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    language = Column(String(16), default='zh-tw')
    exam_system = Column(String(64), nullable=True)
    subject = Column(String(64), nullable=True)
    topic = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class Source(Base):
    __tablename__ = 'sources'
    id = Column(Integer, primary_key=True)
    note_id = Column(Integer, ForeignKey('notes.id'), nullable=False)
    type = Column(String(32), nullable=False)  # youtube/pdf/text/webpage
    url = Column(String(1024), nullable=True)
    meta = Column(JSON, nullable=True)


class Deck(Base):
    __tablename__ = 'decks'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Flashcard(Base):
    __tablename__ = 'flashcards'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    note_id = Column(Integer, ForeignKey('notes.id'), nullable=True)
    front = Column(Text, nullable=False)
    back = Column(Text, nullable=False)
    ai_generated = Column(Boolean, default=False)
    quality_score = Column(Float, nullable=True)
    user_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class DeckCard(Base):
    __tablename__ = 'deck_cards'
    id = Column(Integer, primary_key=True)
    deck_id = Column(Integer, ForeignKey('decks.id'), nullable=False)
    card_id = Column(Integer, ForeignKey('flashcards.id'), nullable=False)
    __table_args__ = (
        UniqueConstraint('deck_id', 'card_id', name='uq_deck_card'),
    )


class Review(Base):
    __tablename__ = 'reviews'
    id = Column(Integer, primary_key=True)
    card_id = Column(Integer, ForeignKey('flashcards.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    rating = Column(Integer, nullable=False)  # 1..4
    review_time_ms = Column(Integer, default=0)
    scheduled_days = Column(Float, nullable=True)
    state = Column(Integer, nullable=True)
    due_at = Column(DateTime, nullable=True)
    reviewed_at = Column(DateTime, default=datetime.utcnow)


class Quiz(Base):
    __tablename__ = 'quizzes'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    note_id = Column(Integer, ForeignKey('notes.id'), nullable=True)
    payload_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class QuizResult(Base):
    __tablename__ = 'quiz_results'
    id = Column(Integer, primary_key=True)
    quiz_id = Column(Integer, ForeignKey('quizzes.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    score = Column(Float, nullable=True)
    answers_json = Column(JSON, nullable=True)
    taken_at = Column(DateTime, default=datetime.utcnow)


class KnowledgeNode(Base):
    __tablename__ = 'knowledge_nodes'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    label = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class KnowledgeEdge(Base):
    __tablename__ = 'knowledge_edges'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    source_node_id = Column(Integer, ForeignKey('knowledge_nodes.id'), nullable=False)
    target_node_id = Column(Integer, ForeignKey('knowledge_nodes.id'), nullable=False)
    relation = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
