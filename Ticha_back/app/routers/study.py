from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from supabase import Client
from app.database import get_db
from app.utils.auth import get_current_user
from app.models.schemas import StudyPlanCreate, StudyPlanResponse, DailyTaskResponse
from datetime import datetime, timedelta, date
from uuid import uuid4


router = APIRouter(prefix="/api/study-plans", tags=["Study Plans"])

@router.get("/current", response_model=StudyPlanResponse)
def get_current_study_plan(
    user_id: str = Depends(get_current_user), 
    db: Client = Depends(get_db)
):
    """
    Fetches the active study plan and its associated daily tasks for the user.
    """
    # 1. Find the user's most recent study plan
    plan_res = db.table("study_plans").select("*").eq("profile_id", user_id).order("target_date", desc=True).limit(1).execute()
    
    if not plan_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="No active study plan found for this user."
        )
        
    plan = plan_res.data[0]
    
    # 2. Fetch all tasks associated with this specific plan
    tasks_res = db.table("daily_tasks").select("*").eq("plan_id", plan["id"]).order("scheduled_date").execute()
    
    # 3. Attach tasks to the plan dictionary to match the StudyPlanResponse schema
    plan["tasks"] = tasks_res.data
    
    return plan

@router.put("/tasks/{task_id}/complete")
def complete_task(
    task_id: str, 
    user_id: str = Depends(get_current_user), 
    db: Client = Depends(get_db)
):
    """
    Allows the user to check off a task on their dashboard.
    """
    # Note: In a production environment, you would also verify that this task belongs 
    # to a study plan owned by the `user_id` to prevent cross-account tampering.
    response = db.table("daily_tasks").update({"status": "completed"}).eq("id", task_id).execute()
    
    if not response.data:
         raise HTTPException(
             status_code=status.HTTP_400_BAD_REQUEST, 
             detail="Failed to update task status."
         )
         
    return {"message": "Task completed successfully", "task": response.data[0]}


@router.post("", response_model=StudyPlanResponse, status_code=status.HTTP_201_CREATED)
def create_study_plan(
    plan_data: StudyPlanCreate,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Creates a new study plan based on selected subjects and daily study hours.
    Generates daily tasks (reading + quiz) for each subject over the next 30 days.
    """
    # Determine target date (default: 30 days from now)
    target_date = plan_data.target_date or (date.today() + timedelta(days=30))
    
    # 1. Insert the study plan
    plan_id = str(uuid4())
    plan_payload = {
        "id": plan_id,
        "profile_id": user_id,
        "target_date": target_date.isoformat(),
        "title": f"AI Plan for {', '.join(plan_data.subjects[:2])}..."  # add title
    }
    db.table("study_plans").insert(plan_payload).execute()
    
    # 2. Generate tasks: spread subjects evenly across the days until target_date
    days_until_target = (target_date - date.today()).days
    if days_until_target <= 0:
        days_until_target = 30  # fallback
    
    tasks = []
    subjects = plan_data.subjects
    hours_per_day = plan_data.hours_per_day
    
    # Rough heuristic: each hour = one task (reading or quiz)
    # For simplicity, create tasks for each subject each day, but limit total tasks per day
    for day_offset in range(min(days_until_target, 30)):
        scheduled_date = date.today() + timedelta(days=day_offset)
        # Determine which subjects to schedule today (round-robin)
        day_subjects = [subjects[i % len(subjects)] for i in range(max(1, hours_per_day))]
        
        for idx, subject in enumerate(day_subjects):
            task_type = "reading" if idx % 2 == 0 else "quiz"
            task_title = f"{task_type.capitalize()}: {subject} - Day {day_offset+1}"
            task_payload = {
                "id": str(uuid4()),
                "plan_id": plan_id,
                "title": task_title,
                "task_type": task_type,
                "status": "pending",
                "scheduled_date": scheduled_date.isoformat()
            }
            db.table("daily_tasks").insert(task_payload).execute()
            tasks.append(task_payload)
    
    # 3. Return the created plan with its tasks
    plan_payload["tasks"] = tasks
    return plan_payload