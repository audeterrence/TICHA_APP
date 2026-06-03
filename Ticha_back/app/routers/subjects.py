from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from supabase import Client
from app.database import get_db
from app.utils.auth import get_current_user
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/api/subjects", tags=["Subjects"])

# ── Models ──────────────────────────────────────────────────────────────────

class SubjectResponse(BaseModel):
    id: UUID
    name: str
    code: str
    level: str
    stream: str
    topic_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserSubjectResponse(BaseModel):
    id: UUID
    user_id: UUID
    subject_id: UUID
    mastery: int
    created_at: datetime
    # Joined subject data
    name: str = ""
    code: str = ""
    level: str = ""
    stream: str = ""
    topic_count: int = 0

    class Config:
        from_attributes = True

class EnrollSubjectsRequest(BaseModel):
    subject_ids: List[str]  # List of subject UUIDs to enroll in


# ── Routes ──────────────────────────────────────────────────────────────────

@router.get("/catalog", response_model=List[SubjectResponse])
def get_subject_catalog(
    level: str = None,
    stream: str = None,
    db: Client = Depends(get_db)
):
    """
    Returns the master catalog of all available subjects.
    Optional filters: ?level=GCE A-Level&stream=science
    """
    query = db.table("subjects").select("*")
    
    if level:
        query = query.eq("level", level)
    if stream:
        query = query.eq("stream", stream)
        
    response = query.execute()
    return response.data or []


@router.get("", response_model=List[UserSubjectResponse])
def get_user_subjects(
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Returns the subjects the current user is enrolled in,
    with mastery and subject details joined.
    """
    # Fetch user_subjects for this user
    response = db.table("user_subjects") \
        .select("*, subjects!inner(name, code, level, stream, topic_count)") \
        .eq("user_id", user_id) \
        .execute()
    
    if not response.data:
        return []
    
    # Flatten the joined data
    result = []
    for item in response.data:
        subject = item.get("subjects", {})
        result.append({
            "id": item["id"],
            "user_id": item["user_id"],
            "subject_id": item["subject_id"],
            "mastery": item.get("mastery", 0),
            "created_at": item["created_at"],
            "name": subject.get("name", ""),
            "code": subject.get("code", ""),
            "level": subject.get("level", ""),
            "stream": subject.get("stream", ""),
            "topic_count": subject.get("topic_count", 0),
        })
    
    return result


@router.post("/enroll", status_code=status.HTTP_201_CREATED)
def enroll_in_subjects(
    payload: EnrollSubjectsRequest,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Enrolls the user in the given subjects.
    Creates entries in user_subjects table.
    """
    if not payload.subject_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No subject IDs provided."
        )
    
    inserted = []
    for subject_id in payload.subject_ids:
        # Check if already enrolled
        existing = db.table("user_subjects") \
            .select("id") \
            .eq("user_id", user_id) \
            .eq("subject_id", subject_id) \
            .execute()
        
        if existing.data:
            continue  # Skip already enrolled subjects
        
        # Insert new enrollment
        enrollment = {
            "user_id": user_id,
            "subject_id": subject_id,
            "mastery": 0
        }
        res = db.table("user_subjects").insert(enrollment).execute()
        if res.data:
            inserted.append(res.data[0])
    
    return {"message": f"Enrolled in {len(inserted)} subjects", "enrolled": inserted}


@router.delete("/{subject_id}")
def unenroll_subject(
    subject_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Removes a user's enrollment in a subject.
    """
    # Verify ownership
    check = db.table("user_subjects") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("subject_id", subject_id) \
        .execute()
    
    if not check.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found."
        )
    
    db.table("user_subjects") \
        .delete() \
        .eq("user_id", user_id) \
        .eq("subject_id", subject_id) \
        .execute()
    
    return {"message": "Subject removed successfully"}