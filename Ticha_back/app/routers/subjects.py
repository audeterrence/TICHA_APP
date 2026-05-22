from fastapi import APIRouter, HTTPException
from typing import List
from app.database import get_supabase
from app.models.schemas import SubjectCreate, SubjectResponse, MessageResponse

router = APIRouter(prefix="/api/subjects", tags=["Subjects"])

@router.post("/", response_model=SubjectResponse, status_code=201)
async def create_subject(subject: SubjectCreate):
    """Create a new subject"""
    supabase = get_supabase()
    
    try:
        response = supabase.table("subjects").insert(subject.model_dump()).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[SubjectResponse])
async def get_all_subjects():
    """Get all subjects"""
    supabase = get_supabase()
    response = supabase.table("subjects").select("*").order("name").execute()
    return response.data

@router.get("/{subject_id}", response_model=SubjectResponse)
async def get_subject(subject_id: str):
    """Get a specific subject"""
    supabase = get_supabase()
    response = supabase.table("subjects").select("*").eq("id", subject_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    return response.data[0]

@router.delete("/{subject_id}", response_model=MessageResponse)
async def delete_subject(subject_id: str):
    """Delete a subject"""
    supabase = get_supabase()
    supabase.table("subjects").delete().eq("id", subject_id).execute()
    return {"message": "Subject deleted successfully"}