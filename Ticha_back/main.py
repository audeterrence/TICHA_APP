from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
import os
from dotenv import load_dotenv

load_dotenv()

# ========== CONFIG ==========
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ========== FASTAPI ==========
app = FastAPI(title="Ticha Smart Learning Assistant API", docs_url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== SCHEMAS ==========
class SubjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None

class QuestionCreate(BaseModel):
    topic_id: Optional[UUID] = None
    question_text: str
    options: dict  # {"A": "...", "B": "...", "C": "...", "D": "..."}
    correct_answer: str  # A, B, C, or D
    explanation: Optional[str] = None
    difficulty: Optional[str] = "Medium"
    marks: int = 1

class ChatSessionCreate(BaseModel):
    user_id: Optional[UUID] = None
    subject_id: Optional[UUID] = None
    title: Optional[str] = None

class ChatMessageCreate(BaseModel):
    session_id: UUID
    role: str  # "user" or "assistant"
    content: str

class ProfileCreate(BaseModel):
    id: UUID
    full_name: Optional[str] = None
    exam_type: Optional[str] = None
    region: Optional[str] = None

class StudyPlanCreate(BaseModel):
    user_id: Optional[UUID] = None
    title: Optional[str] = None
    target_exam_date: Optional[str] = None
    daily_tasks: Optional[list] = None
    week_number: Optional[int] = None

class AnswerCheck(BaseModel):
    question_id: UUID
    selected_answer: str

# ========== ENDPOINTS ==========
@app.get("/")
async def root():
    return {
        "app": "Ticha Smart Learning Assistant",
        "swagger_docs": "/docs",
        "status": "running"
    }

@app.get("/api/test")
async def test_connection():
    """Test Supabase connection"""
    try:
        response = supabase.table("subjects").select("count", "exact").execute()
        return {"success": True, "message": f"Connected! Found {response.count} subjects"}
    except Exception as e:
        return {"success": False, "error": str(e)}

# SUBJECTS
@app.post("/api/subjects")
async def create_subject(subject: SubjectCreate):
    try:
        response = supabase.table("subjects").insert(subject.model_dump()).execute()
        return {"success": True, "data": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/subjects")
async def get_subjects():
    try:
        response = supabase.table("subjects").select("*").execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/subjects/{subject_id}")
async def delete_subject(subject_id: str):
    try:
        supabase.table("subjects").delete().eq("id", subject_id).execute()
        return {"success": True, "message": "Deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# QUESTIONS
@app.post("/api/questions")
async def create_question(question: QuestionCreate):
    try:
        response = supabase.table("questions").insert(question.model_dump()).execute()
        return {"success": True, "data": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/questions")
async def get_questions(topic_id: Optional[str] = None, difficulty: Optional[str] = None, limit: int = 10):
    try:
        query = supabase.table("questions").select("*")
        if topic_id:
            query = query.eq("topic_id", topic_id)
        if difficulty:
            query = query.eq("difficulty", difficulty)
        response = query.limit(limit).execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/questions/check")
async def check_answer(answer: AnswerCheck):
    try:
        response = supabase.table("questions").select("correct_answer,explanation").eq("id", answer.question_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Question not found")
        
        question = response.data[0]
        is_correct = question["correct_answer"] == answer.selected_answer
        
        return {
            "success": True,
            "is_correct": is_correct,
            "correct_answer": question["correct_answer"],
            "explanation": question.get("explanation")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# CHAT
@app.post("/api/chat/sessions")
async def create_chat_session(session: ChatSessionCreate):
    try:
        response = supabase.table("chat_sessions").insert(session.model_dump()).execute()
        return {"success": True, "data": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/chat/sessions/{user_id}")
async def get_user_chats(user_id: str):
    try:
        response = supabase.table("chat_sessions").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/messages")
async def send_message(message: ChatMessageCreate):
    try:
        response = supabase.table("chat_messages").insert(message.model_dump()).execute()
        supabase.table("chat_sessions").update({"updated_at": "now()"}).eq("id", message.session_id).execute()
        return {"success": True, "data": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/chat/messages/{session_id}")
async def get_messages(session_id: str):
    try:
        response = supabase.table("chat_messages").select("*").eq("session_id", session_id).order("created_at").execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# PROFILES
@app.post("/api/profiles")
async def create_profile(profile: ProfileCreate):
    try:
        response = supabase.table("profiles").insert(profile.model_dump()).execute()
        return {"success": True, "data": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/profiles/{user_id}")
async def get_profile(user_id: str):
    try:
        response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        return {"success": True, "data": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# STUDY PLANS
@app.post("/api/study/plans")
async def create_study_plan(plan: StudyPlanCreate):
    try:
        response = supabase.table("study_plans").insert(plan.model_dump()).execute()
        return {"success": True, "data": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/study/plans/{user_id}")
async def get_user_plans(user_id: str):
    try:
        response = supabase.table("study_plans").select("*").eq("user_id", user_id).execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# TOPIC MASTERY
@app.get("/api/mastery/{user_id}")
async def get_mastery(user_id: str):
    try:
        response = supabase.table("topic_mastery").select("*").eq("user_id", user_id).execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/mastery")
async def create_mastery(mastery: dict):
    try:
        response = supabase.table("topic_mastery").insert(mastery).execute()
        return {"success": True, "data": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# STATS
@app.get("/api/stats")
async def get_stats():
    try:
        tables = ["subjects", "questions", "chat_sessions", "profiles", "study_plans", "topic_mastery"]
        stats = {}
        for table in tables:
            response = supabase.table(table).select("count", "exact").execute()
            stats[table] = response.count
        return {"success": True, "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)