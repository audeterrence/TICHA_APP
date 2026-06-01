from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from supabase import Client
from app.database import get_db
from app.utils.auth import get_current_user
from app.models.schemas import SubjectResponse, SubjectBase

router = APIRouter(prefix="/api/subjects", tags=["Subjects"])

@router.get("", response_model=List[SubjectResponse])
def get_user_subjects(
    user_id: str = Depends(get_current_user), 
    db: Client = Depends(get_db)
):
    """
    Fetches the subjects enrolled by the currently authenticated user.
    """
    response = db.table("subjects").select("*").eq("user_id", user_id).execute()
    return response.data or []

@router.post("", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
def add_user_subject(
    subject_data: SubjectBase,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Enrolls the user in a new subject.
    """
    payload = subject_data.dict()
    # Force user_id to match the authenticated user
    payload["user_id"] = user_id
    
    response = db.table("subjects").insert(payload).execute()
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create subject."
        )
    return response.data[0]

@router.delete("/{subject_id}")
def remove_user_subject(
    subject_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Removes a subject enrollment.
    """
    # Verify owner before deleting to prevent cross-account deletion
    check = db.table("subjects").select("*").eq("id", subject_id).execute()
    if not check.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found."
        )
    
    if str(check.data[0]["user_id"]) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this subject."
        )
        
    response = db.table("subjects").delete().eq("id", subject_id).execute()
    return {"message": "Subject deleted successfully"}
