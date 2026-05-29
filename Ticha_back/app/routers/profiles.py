from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from app.database import get_db
from app.utils.auth import get_current_user
from app.models.schemas import ProfileResponse

# Prefix all routes in this file with /api/profiles
router = APIRouter(prefix="/api/profiles", tags=["Profiles"])

@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    user_id: str = Depends(get_current_user), 
    db: Client = Depends(get_db)
):
    """
    Fetches the profile of the currently authenticated user.
    """
    # 1. Query the 'profiles' table where id == user_id
    response = db.table("profiles").select("*").eq("id", user_id).single().execute()
    
    # 2. Handle missing profiles
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Profile not found. Ensure the Auth trigger fired properly."
        )
        
    return response.data