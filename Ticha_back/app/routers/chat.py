from fastapi import APIRouter, HTTPException
from typing import List
from app.database import get_supabase
from app.models.schemas import (
    ChatSessionCreate, ChatSessionResponse,
    ChatMessageCreate, ChatMessageResponse,
    MessageResponse
)

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# ============ CHAT SESSIONS ============
@router.post("/sessions", response_model=ChatSessionResponse, status_code=201)
async def create_chat_session(session: ChatSessionCreate):
    """Create a new chat session"""
    supabase = get_supabase()
    
    try:
        response = supabase.table("chat_sessions").insert(session.model_dump()).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sessions/{user_id}", response_model=List[ChatSessionResponse])
async def get_user_sessions(user_id: str):
    """Get all chat sessions for a user"""
    supabase = get_supabase()
    response = supabase.table("chat_sessions").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return response.data

@router.get("/sessions/{session_id}/detail", response_model=ChatSessionResponse)
async def get_session(session_id: str):
    """Get a specific chat session"""
    supabase = get_supabase()
    response = supabase.table("chat_sessions").select("*").eq("id", session_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return response.data[0]

@router.delete("/sessions/{session_id}", response_model=MessageResponse)
async def delete_session(session_id: str):
    """Delete a chat session and its messages"""
    supabase = get_supabase()
    
    # Delete messages first
    supabase.table("chat_messages").delete().eq("session_id", session_id).execute()
    # Delete session
    supabase.table("chat_sessions").delete().eq("id", session_id).execute()
    
    return {"message": "Session deleted successfully"}

# ============ CHAT MESSAGES ============
@router.post("/messages", response_model=ChatMessageResponse, status_code=201)
async def create_message(message: ChatMessageCreate):
    """Add a message to a chat session"""
    supabase = get_supabase()
    
    # Check if session exists
    session = supabase.table("chat_sessions").select("id").eq("id", message.session_id).execute()
    if not session.data:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    try:
        response = supabase.table("chat_messages").insert(message.model_dump()).execute()
        
        # Update session timestamp
        supabase.table("chat_sessions").update({"updated_at": "now()"}).eq("id", message.session_id).execute()
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/messages/{session_id}", response_model=List[ChatMessageResponse])
async def get_session_messages(session_id: str):
    """Get all messages in a chat session"""
    supabase = get_supabase()
    response = supabase.table("chat_messages").select("*").eq("session_id", session_id).order("created_at").execute()
    return response.data