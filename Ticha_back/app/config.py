import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY")
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    # For Supabase JWT verification, we use Supabase's own verification method

settings = Settings()