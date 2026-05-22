from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.database import get_supabase
from app.models.schemas import ProfileCreate, ProfileUpdate, ProfileResponse, MessageResponse
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/profiles", tags=["Profiles"])

@router.post("/", response_model=ProfileResponse, status_code=201)
async def create_profile(profile: ProfileCreate):
    """Create a new user profile"""
    supabase = get_supabase()
    
    try:
        response = supabase.table("profiles").insert(profile.model_dump()).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's profile"""
    return current_user

@router.get("/{user_id}", response_model=ProfileResponse)
async def get_profile(user_id: str):
    """Get profile by ID"""
    supabase = get_supabase()
    response = supabase.table("profiles").select("*").eq("id", user_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return response.data[0]

@router.patch("/{user_id}", response_model=ProfileResponse)
async def update_profile(user_id: str, profile: ProfileUpdate):
    """Update user profile"""
    supabase = get_supabase()
    
    # Remove None values
    update_data = {k: v for k, v in profile.model_dump().items() if v is not None}
    update_data["updated_at"] = "now()"
    
    response = supabase.table("profiles").update(update_data).eq("id", user_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return response.data[0]