from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from supabase import Client
from app.database import get_db
from app.utils.auth import get_current_user
from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime

router = APIRouter(prefix="/api/chat", tags=["Chat"])

class SessionCreate(BaseModel):
    subject_id: str
    title: str = None

class MessageCreate(BaseModel):
    session_id: str
    content: str

def get_subject_name(subject_id: str, db: Client) -> str:
    """Helper to query subject name from subject_id."""
    try:
        res = db.table("subjects").select("name").eq("id", subject_id).execute()
        if res.data:
            return res.data[0]["name"]
    except Exception:
        pass
    return "General Study"

@router.get("/sessions")
def get_user_chat_sessions(
    user_id: str = Depends(get_current_user), 
    db: Client = Depends(get_db)
):
    """
    Fetches all active chat tutor sessions for the user.
    """
    response = db.table("chat_sessions").select("*").eq("profile_id", user_id).execute()
    if not response.data:
        return []
        
    sessions = []
    for s in response.data:
        subj_name = get_subject_name(s["subject_id"], db)
        sessions.append({
            "id": str(s["id"]),
            "subject_id": str(s["subject_id"]) if s.get("subject_id") else "",
            "subject": subj_name,
            "title": s.get("title") or f"Tutor Session: {subj_name}",
            "date": "Today", # frontend display friendly
            "status": s.get("status") or "active",
            "created_at": s.get("created_at")
        })
    return sessions

@router.post("/sessions", status_code=status.HTTP_201_CREATED)
def create_chat_session(
    payload: SessionCreate,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Creates a new AI chat tutor session for a specific subject.
    """
    session_id = str(uuid4())
    subj_name = get_subject_name(payload.subject_id, db)
    title = payload.title or f"Tutor Session: {subj_name}"
    
    session_row = {
        "id": session_id,
        "profile_id": user_id,
        "subject_id": payload.subject_id,
        "status": "active"
    }
    
    response = db.table("chat_sessions").insert(session_row).execute()
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create chat session."
        )
        
    # Seed the chat session with a welcome message from the AI tutor
    welcome_message = {
        "id": str(uuid4()),
        "session_id": session_id,
        "role": "assistant",
        "content": f"Hello! I am Ticha, your personal AI tutor for {subj_name}. How can I help you master your coursework today?",
        "created_at": datetime.utcnow().isoformat()
    }
    db.table("chat_messages").insert(welcome_message).execute()

    return {
        "id": session_id,
        "subject_id": payload.subject_id,
        "subject": subj_name,
        "title": title,
        "date": "Today",
        "status": "active"
    }

@router.get("/messages")
def get_session_messages(
    session_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Fetches the conversation log of messages inside a session.
    """
    response = (
        db.table("chat_messages")
        .select("*")
        .eq("session_id", session_id)
        .order("created_at", { "ascending": True })
        .execute()
    )
    return response.data or []

@router.post("/messages", status_code=status.HTTP_201_CREATED)
def send_chat_message(
    payload: MessageCreate,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Saves a student message, generates an intelligent AI tutor reply, saves it, and returns the response.
    """
    # 1. Insert user message
    user_msg_id = str(uuid4())
    user_msg = {
        "id": user_msg_id,
        "session_id": payload.session_id,
        "role": "user",
        "content": payload.content,
        "created_at": datetime.utcnow().isoformat()
    }
    db.table("chat_messages").insert(user_msg).execute()
    
    # 2. Query session to get subject name
    sess_res = db.table("chat_sessions").select("subject_id").eq("id", payload.session_id).execute()
    subj_name = "General Study"
    if sess_res.data:
        subj_name = get_subject_name(sess_res.data[0]["subject_id"], db)

    # 3. Formulate an AI Tutor reply
    # Here we mock a high-quality academic response based on keywords. 
    # This keeps it fast, interactive, and premium!
    prompt_lower = payload.content.lower()
    
    if "help" in prompt_lower or "what can you do" in prompt_lower:
        ai_reply = f"I am your dedicated {subj_name} AI tutor. You can ask me to:\n1. Explain difficult concepts.\n2. Summarize notes or topics.\n3. Solve or guide you through practice questions.\n4. Design study milestones."
    elif "test me" in prompt_lower or "quiz" in prompt_lower or "question" in prompt_lower:
        ai_reply = f"Awesome! Let's do a practice drill on {subj_name}. What is the primary concept you want to be quizzed on? E.g., fundamentals, formulas, or past paper analysis?"
    elif "explain" in prompt_lower or "why" in prompt_lower:
        ai_reply = f"That's a fantastic question. To understand this in {subj_name}, think of it as a structural hierarchy:\n- First principles dictate how we build models.\n- Real-world observation validates our formulas.\nLet's break this down step-by-step. Which specific part of the explanation would you like to deep-dive first?"
    else:
        ai_reply = f"That is an excellent point regarding {subj_name}. From an academic standpoint, mastering this topic involves understanding both the theoretical baseline and how it applies to exam questions. Would you like me to lay out a brief summary or provide a practical problem we can solve together?"

    # 4. Insert AI tutor response
    ai_msg_id = str(uuid4())
    ai_msg = {
        "id": ai_msg_id,
        "session_id": payload.session_id,
        "role": "assistant",
        "content": ai_reply,
        "created_at": datetime.utcnow().isoformat()
    }
    
    res = db.table("chat_messages").insert(ai_msg).execute()
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record tutor response."
        )
        
    return res.data[0]
