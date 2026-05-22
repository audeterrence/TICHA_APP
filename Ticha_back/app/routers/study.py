from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.database import get_supabase
from app.models.schemas import (
    StudyPlanCreate, StudyPlanResponse,
    StudyTaskCreate, StudyTaskUpdate, StudyTaskResponse,
    StudySessionCreate, StudySessionResponse,
    TopicMasteryCreate, TopicMasteryUpdate, TopicMasteryResponse,
    MessageResponse
)

router = APIRouter(prefix="/api/study", tags=["Study"])

# ============ STUDY PLANS ============
@router.post("/plans", response_model=StudyPlanResponse, status_code=201)
async def create_study_plan(plan: StudyPlanCreate):
    """Create a new study plan"""
    supabase = get_supabase()
    
    try:
        response = supabase.table("study_plans").insert(plan.model_dump()).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/plans/{user_id}", response_model=List[StudyPlanResponse])
async def get_user_plans(user_id: str):
    """Get all study plans for a user"""
    supabase = get_supabase()
    response = supabase.table("study_plans").select("*").eq("user_id", user_id).order("generated_at", desc=True).execute()
    return response.data

@router.get("/plans/{plan_id}/detail", response_model=StudyPlanResponse)
async def get_plan(plan_id: str):
    """Get specific study plan"""
    supabase = get_supabase()
    response = supabase.table("study_plans").select("*").eq("id", plan_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Study plan not found")
    
    return response.data[0]

# ============ STUDY TASKS ============
@router.post("/tasks", response_model=StudyTaskResponse, status_code=201)
async def create_task(task: StudyTaskCreate):
    """Create a new study task"""
    supabase = get_supabase()
    
    try:
        response = supabase.table("study_tasks").insert(task.model_dump()).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/tasks/{task_id}", response_model=StudyTaskResponse)
async def update_task(task_id: str, task_update: StudyTaskUpdate):
    """Update a study task (mark complete, add notes)"""
    supabase = get_supabase()
    update_data = {k: v for k, v in task_update.model_dump().items() if v is not None}
    
    response = supabase.table("study_tasks").update(update_data).eq("id", task_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return response.data[0]

@router.get("/tasks/{plan_id}", response_model=List[StudyTaskResponse])
async def get_plan_tasks(plan_id: str):
    """Get all tasks for a study plan"""
    supabase = get_supabase()
    response = supabase.table("study_tasks").select("*").eq("plan_id", plan_id).execute()
    return response.data

# ============ STUDY SESSIONS ============
@router.post("/sessions/start", response_model=StudySessionResponse, status_code=201)
async def start_study_session(session: StudySessionCreate):
    """Start a new study session"""
    supabase = get_supabase()
    
    try:
        response = supabase.table("study_sessions").insert(session.model_dump()).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/sessions/{session_id}/end", response_model=StudySessionResponse)
async def end_study_session(session_id: str, duration: int = None):
    """End a study session"""
    supabase = get_supabase()
    
    from datetime import datetime
    update_data = {
        "ended_at": datetime.utcnow().isoformat()
    }
    if duration:
        update_data["duration_minutes"] = duration
    
    response = supabase.table("study_sessions").update(update_data).eq("id", session_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return response.data[0]

@router.get("/sessions/{user_id}", response_model=List[StudySessionResponse])
async def get_user_sessions(user_id: str, limit: int = 10):
    """Get recent study sessions for a user"""
    supabase = get_supabase()
    response = supabase.table("study_sessions").select("*").eq("user_id", user_id).order("started_at", desc=True).limit(limit).execute()
    return response.data

# ============ TOPIC MASTERY ============
@router.post("/mastery", response_model=TopicMasteryResponse, status_code=201)
async def create_topic_mastery(mastery: TopicMasteryCreate):
    """Initialize topic mastery tracking"""
    supabase = get_supabase()
    
    # Check if already exists
    existing = supabase.table("topic_mastery").select("*").eq("user_id", mastery.user_id).eq("topic_id", mastery.topic_id).execute()
    if existing.data:
        return existing.data[0]
    
    try:
        response = supabase.table("topic_mastery").insert(mastery.model_dump()).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/mastery/{mastery_id}", response_model=TopicMasteryResponse)
async def update_topic_mastery(mastery_id: str, mastery_update: TopicMasteryUpdate):
    """Update topic mastery progress"""
    supabase = get_supabase()
    update_data = {k: v for k, v in mastery_update.model_dump().items() if v is not None}
    update_data["last_practiced"] = "now()"
    update_data["updated_at"] = "now()"
    
    response = supabase.table("topic_mastery").update(update_data).eq("id", mastery_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Topic mastery not found")
    
    return response.data[0]

@router.get("/mastery/{user_id}", response_model=List[TopicMasteryResponse])
async def get_user_mastery(user_id: str):
    """Get all topic mastery records for a user"""
    supabase = get_supabase()
    response = supabase.table("topic_mastery").select("*").eq("user_id", user_id).execute()
    return response.data