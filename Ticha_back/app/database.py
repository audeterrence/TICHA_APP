from supabase import create_client, Client
from app.config import settings
import httpx

def get_supabase() -> Client:
    """Create Supabase client with service role key (admin operations)"""
    return create_client(
        settings.SUPABASE_URL, 
        settings.SUPABASE_KEY,
        options={
            'schema': 'public',
            'auto_refresh_token': False,
            'persist_session': False,
        }
    )

def get_supabase_anon() -> Client:
    """Create Supabase client with anon key (public operations)"""
    return create_client(
        settings.SUPABASE_URL, 
        settings.SUPABASE_ANON_KEY,
        options={
            'schema': 'public',
        }
    )

# Alternative: Direct database connection using connection string
def get_database_connection():
    """Get direct PostgreSQL connection if needed"""
    import psycopg2
    try:
        conn = psycopg2.connect(settings.DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None