# Ticha_back/app/database.py
from supabase import create_client, Client
from app.config import settings

# This client uses the Service Role Key. 
# It has full admin access to the database.
supabase: Client = create_client(
    settings.SUPABASE_URL, 
    settings.SUPABASE_KEY
)

def get_db():
    """Dependency to inject the database client into routers."""
    return supabase