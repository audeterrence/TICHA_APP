from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.database import get_supabase
from app.models.schemas import (
    QuestionCreate, QuestionResponse,
    AnswerCheck, AnswerResult,
    MessageResponse
)

router = APIRouter(prefix="/api/questions", tags=["Questions"])

@router.post("/", response_model=QuestionResponse, status_code=201)
async def create_question(question: QuestionCreate):
    """Create a new question"""
    supabase = get_supabase()
    
    try:
        # Convert options to dict for JSON storage
        question_data = question.model_dump()
        question_data["options"] = question.options.model_dump()
        
        response = supabase.table("questions").insert(question_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[QuestionResponse])
async def get_questions(
    topic_id: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = 10
):
    """Get questions with optional filters"""
    supabase = get_supabase()
    query = supabase.table("questions").select("*")
    
    if topic_id:
        query = query.eq("topic_id", topic_id)
    if difficulty:
        query = query.eq("difficulty", difficulty)
    
    response = query.limit(limit).execute()
    return response.data

@router.get("/{question_id}", response_model=QuestionResponse)
async def get_question(question_id: str):
    """Get a specific question"""
    supabase = get_supabase()
    response = supabase.table("questions").select("*").eq("id", question_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return response.data[0]

@router.post("/check-answer", response_model=AnswerResult)
async def check_answer(answer: AnswerCheck):
    """Check if an answer is correct"""
    supabase = get_supabase()
    response = supabase.table("questions").select("correct_answer,explanation").eq("id", answer.question_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Question not found")
    
    question = response.data[0]
    is_correct = question["correct_answer"] == answer.selected_answer
    
    return AnswerResult(
        question_id=answer.question_id,
        is_correct=is_correct,
        correct_answer=question["correct_answer"],
        explanation=question.get("explanation")
    )

@router.delete("/{question_id}", response_model=MessageResponse)
async def delete_question(question_id: str):
    """Delete a question"""
    supabase = get_supabase()
    supabase.table("questions").delete().eq("id", question_id).execute()
    return {"message": "Question deleted successfully"}