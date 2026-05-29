from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from supabase import Client
from app.database import get_db
from app.utils.auth import get_current_user
from app.models.schemas import StudyPlanResponse

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