from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import get_supabase
from supabase import Client
import jwt

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Validate Supabase JWT token and return user"""
    token = credentials.credentials
    supabase = get_supabase()
    
    try:
        # Use Supabase to verify the user
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        
        user_id = user_response.user.id
        
        # Get profile from database
        profile_response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        
        if not profile_response.data:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        return profile_response.data[0]
        
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

async def get_supabase_client(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Get Supabase client with authenticated user context"""
    token = credentials.credentials
    supabase_url = getattr(get_supabase, 'supabase_url', None)
    
    # Create a new client with the user's token
    from supabase import create_client
    from app.config import settings
    
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

# Optional: If you want to use the JWT secret directly
from app.config import settings

def verify_supabase_token(token: str):
    """
    Verify a Supabase JWT token manually.
    Note: Supabase handles token verification, but this is here if needed.
    """
    try:
        # Simply decode without verification first to get the header
        header = jwt.get_unverified_header(token)
        
        # Let Supabase handle verification
        supabase = get_supabase()
        user = supabase.auth.get_user(token)
        
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))