# Ticha_back/app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # Service Role Key
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

settings = Settings()