from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from supabase import Client
from app.database import get_db
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/questions", tags=["Questions"])

def map_db_question_to_frontend(db_q: Dict[str, Any]) -> Dict[str, Any]:
    """
    Helper to transform the database questions structure to what the frontend expects.
    """
    options_db = db_q.get("options") or {}
    
    # Extract multiple choice options (filtering out meta properties)
    mapped_options = []
    for key, value in options_db.items():
        if key not in ["correct", "explanation", "solution"]:
            mapped_options.append({"key": key, "text": str(value)})
            
    # Sort options by key (A, B, C...)
    mapped_options.sort(key=lambda x: x["key"])

    return {
        "id": str(db_q["id"]),
        "topic_id": str(db_q["topic_id"]) if db_q.get("topic_id") else "",
        "question": db_q["content"],
        "options": mapped_options,
        "correctAnswer": options_db.get("correct", "A"),
        "explanation": options_db.get("explanation") or options_db.get("solution") or "Correct answer selected. Great job!"
    }

@router.get("")
def get_topic_questions(
    topic_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Fetches all questions matching a specific topic ID.
    """
    response = db.table("questions").select("*").eq("topic_id", topic_id).execute()
    if not response.data:
        return []
        
    return [map_db_question_to_frontend(q) for q in response.data]

@router.get("/random")
def get_random_questions(
    limit: int = 5,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Fetches a list of random practice questions.
    """
    # Quick simple random selection (can be optimized based on DB load)
    response = db.table("questions").select("*").limit(limit).execute()
    if not response.data:
        return []
        
    return [map_db_question_to_frontend(q) for q in response.data]
