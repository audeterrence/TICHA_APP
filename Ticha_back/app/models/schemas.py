from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime, date
from enum import Enum

# ============ ENUMS ============
class ExamType(str, Enum):
    BAC = "BAC"
    BEPC = "BEPC"
    CAP = "CAP"
    BTS = "BTS"

class Difficulty(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"

class Role(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

class AnswerOption(str, Enum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"

# ============ PROFILES ============
class ProfileCreate(BaseModel):
    id: UUID
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    exam_type: Optional[ExamType] = None
    region: Optional[str] = None

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    exam_type: Optional[ExamType] = None
    region: Optional[str] = None

class ProfileResponse(BaseModel):
    id: UUID
    full_name: Optional[str]
    avatar_url: Optional[str]
    exam_type: Optional[ExamType]
    region: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# ============ SUBJECTS ============
class SubjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None

class SubjectResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    icon: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

# ============ QUESTIONS ============
class OptionSchema(BaseModel):
    A: str
    B: str
    C: str
    D: str

class QuestionCreate(BaseModel):
    topic_id: Optional[UUID] = None
    question_text: str
    options: OptionSchema
    correct_answer: AnswerOption
    explanation: Optional[str] = None
    difficulty: Optional[Difficulty] = None
    marks: int = 1

class QuestionResponse(BaseModel):
    id: UUID
    topic_id: Optional[UUID]
    question_text: str
    options: dict
    correct_answer: str
    explanation: Optional[str]
    difficulty: Optional[str]
    marks: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

class AnswerCheck(BaseModel):
    question_id: UUID
    selected_answer: AnswerOption

class AnswerResult(BaseModel):
    question_id: UUID
    is_correct: bool
    correct_answer: str
    explanation: Optional[str]

# ============ CHAT ============
class ChatSessionCreate(BaseModel):
    user_id: Optional[UUID] = None
    subject_id: Optional[UUID] = None
    title: Optional[str] = None

class ChatSessionResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    subject_id: Optional[UUID]
    title: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class ChatMessageCreate(BaseModel):
    session_id: UUID
    role: Role
    content: str

class ChatMessageResponse(BaseModel):
    id: UUID
    session_id: Optional[UUID]
    role: Optional[str]
    content: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

# ============ STUDY PLANS ============
class DailyTask(BaseModel):
    topic_id: UUID
    task_type: str
    estimated_minutes: int
    description: str

class StudyPlanCreate(BaseModel):
    user_id: Optional[UUID] = None
    title: Optional[str] = None
    target_exam_date: Optional[date] = None
    daily_tasks: Optional[List[DailyTask]] = None
    week_number: Optional[int] = None

class StudyPlanResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    title: Optional[str]
    target_exam_date: Optional[date]
    daily_tasks: Optional[dict]
    week_number: Optional[int]
    is_active: Optional[bool]
    generated_at: Optional[datetime]

    class Config:
        from_attributes = True

# ============ STUDY TASKS ============
class StudyTaskCreate(BaseModel):
    plan_id: Optional[UUID] = None
    topic_id: Optional[UUID] = None
    scheduled_date: Optional[date] = None

class StudyTaskUpdate(BaseModel):
    completed: Optional[bool] = None
    notes: Optional[str] = None

class StudyTaskResponse(BaseModel):
    id: UUID
    plan_id: Optional[UUID]
    topic_id: Optional[UUID]
    scheduled_date: Optional[date]
    completed: Optional[bool]
    notes: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

# ============ STUDY SESSIONS ============
class StudySessionCreate(BaseModel):
    user_id: UUID
    topic_id: Optional[UUID] = None
    duration_minutes: Optional[int] = None

class StudySessionEnd(BaseModel):
    duration_minutes: int

class StudySessionResponse(BaseModel):
    id: UUID
    user_id: UUID
    topic_id: Optional[UUID]
    duration_minutes: Optional[int]
    started_at: datetime
    ended_at: Optional[datetime]

    class Config:
        from_attributes = True

# ============ TOPIC MASTERY ============
class TopicMasteryCreate(BaseModel):
    user_id: Optional[UUID] = None
    topic_id: Optional[UUID] = None

class TopicMasteryUpdate(BaseModel):
    mastery_percentage: Optional[float] = None
    questions_attempted: Optional[int] = None
    correct_count: Optional[int] = None

class TopicMasteryResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    topic_id: Optional[UUID]
    mastery_percentage: Optional[float]
    questions_attempted: Optional[int]
    correct_count: Optional[int]
    last_practiced: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# ============ USER SETTINGS ============
class UserSettingsCreate(BaseModel):
    user_id: UUID
    daily_goal_minutes: int = 120
    preferred_difficulty: str = "Intermediate"
    email_notifications: bool = True
    push_notifications: bool = True
    whatsapp_notifications: bool = False

class UserSettingsUpdate(BaseModel):
    daily_goal_minutes: Optional[int] = None
    preferred_difficulty: Optional[str] = None
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    whatsapp_notifications: Optional[bool] = None

class UserSettingsResponse(BaseModel):
    id: UUID
    user_id: UUID
    daily_goal_minutes: int
    preferred_difficulty: str
    email_notifications: bool
    push_notifications: bool
    whatsapp_notifications: bool
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# ============ EXAM PAPERS ============
class ExamPaperCreate(BaseModel):
    user_id: Optional[UUID] = None
    file_url: Optional[str] = None
    subject: Optional[str] = None
    exam_board: Optional[str] = None
    year: Optional[int] = None
    total_questions: Optional[int] = None
    total_marks: Optional[int] = None

class ExamPaperResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    file_url: Optional[str]
    subject: Optional[str]
    exam_board: Optional[str]
    year: Optional[int]
    total_questions: Optional[int]
    total_marks: Optional[int]
    processed_content: Optional[str]
    topics_extracted: Optional[list]
    analyzed: Optional[bool]
    uploaded_at: Optional[datetime]

    class Config:
        from_attributes = True

# ============ GENERIC RESPONSES ============
class MessageResponse(BaseModel):
    message: str

class ErrorResponse(BaseModel):
    detail: str