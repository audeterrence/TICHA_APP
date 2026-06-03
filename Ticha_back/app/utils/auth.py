# Ticha_back/app/utils/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client
from app.config import settings

# Use the ANON KEY for token verification (not the service role key)
supabase_auth = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verifies the JWT token sent from the React frontend against Supabase Auth.
    Returns the user's ID if valid, otherwise throws a 401 Unauthorized.
    """
    token = credentials.credentials
    
    try:
        # Use the anon client to verify user tokens
        response = supabase_auth.auth.get_user(token)
        
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        return response.user.id
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )