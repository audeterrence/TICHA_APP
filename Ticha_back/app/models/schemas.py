from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from uuid import UUID

# ==========================================
# DOMAIN 1: PROFILES
# ==========================================
class ProfileBase(BaseModel):
    name: str
    email: str
    level: str
    mode: str
    casual_interest: Optional[str] = None
    access: str = 'limited'
    onboarding_completed: bool = False

class ProfileCreate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: UUID
    streak: int
    points: int
    created_at: datetime
    stream: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ==========================================
# DOMAIN 2: ACADEMIC HIERARCHY
# ==========================================
class TopicBase(BaseModel):
    title: str
    weight: int = 1

class TopicResponse(TopicBase):
    id: UUID
    subject_id: UUID

class SubjectBase(BaseModel):
    name: str
    code: str
    mastery: int = 0
    topic_count: int = 0
    stream: Optional[str] = None
    user_id: UUID

class SubjectResponse(SubjectBase):
    id: UUID
    created_at: datetime
    topics: Optional[List[TopicResponse]] = []

    class Config:
        from_attributes = True

# ==========================================
# DOMAIN 3: STUDY PLANS
# ==========================================
class DailyTaskBase(BaseModel):
    title: str
    task_type: str
    status: str = "pending"
    scheduled_date: date

class DailyTaskResponse(DailyTaskBase):
    id: UUID
    plan_id: UUID

class StudyPlanResponse(BaseModel):
    id: UUID
    profile_id: UUID
    target_date: date
    tasks: Optional[List[DailyTaskResponse]] = []


# Add this after the existing StudyPlanResponse class
class StudyPlanCreate(BaseModel):
    target_date: Optional[date] = None      # keep optional for backward compatibility
    subjects: List[str]                     # list of subject names
    hours_per_day: int = Field(..., ge=1, le=12)  # 1-12 hours

# ==========================================
# DOMAIN 4: ADAPTIVE EVALUATION
# ==========================================
class QuestionBase(BaseModel):
    content: str
    difficulty_level: int
    options: Dict[str, Any] # Expecting JSON like {"A": "...", "B": "...", "correct": "A"}

class QuestionResponse(QuestionBase):
    id: UUID
    topic_id: UUID

class UserTopicMasteryResponse(BaseModel):
    profile_id: UUID
    topic_id: UUID
    questions_attempted: int
    questions_correct: int
    mastery_percentage: float

# ==========================================
# DOMAIN 5: AI CHAT ORCHESTRATION
# ==========================================
class ChatMessageBase(BaseModel):
    role: str
    content: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    id: UUID
    session_id: UUID
    created_at: datetime

class ChatSessionResponse(BaseModel):
    id: UUID
    profile_id: UUID
    subject_id: UUID
    status: str
    messages: Optional[List[ChatMessageResponse]] = []