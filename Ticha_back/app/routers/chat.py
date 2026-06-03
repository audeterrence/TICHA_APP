from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from supabase import Client
from app.database import get_db
from app.utils.auth import get_current_user
from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime, date, timedelta
import os
from google import genai
import json

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# Initialize Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

class SessionCreate(BaseModel):
    subject_id: str
    title: str = None

class MessageCreate(BaseModel):
    session_id: str
    content: str

def get_subject_name(subject_id: str, db: Client) -> str:
    """Helper to query subject name from subject_id."""
    if not subject_id or subject_id == "General":
        return "General Study"
    try:
        res = db.table("subjects").select("name").eq("id", subject_id).execute()
        if res.data:
            return res.data[0]["name"]
    except Exception:
        pass
    return "General Study"

def get_user_context(user_id: str, db: Client) -> Dict[str, Any]:
    """Get user's academic context for personalized AI responses."""
    context = {
        "level": "GCE A-Level",
        "stream": "science",
        "subjects": [],
        "mode": "exam"
    }
    try:
        profile = db.table("profiles").select("*").eq("id", user_id).single().execute()
        if profile.data:
            context["level"] = profile.data.get("level", "GCE A-Level")
            context["stream"] = profile.data.get("stream", "science")
            context["mode"] = profile.data.get("mode", "exam")
        
        subjects = db.table("user_subjects").select("*, subjects!inner(name, code)").eq("user_id", user_id).execute()
        if subjects.data:
            context["subjects"] = [s.get("subjects", {}).get("name", "") for s in subjects.data]
    except:
        pass
    return context

def build_system_prompt(context: Dict[str, Any], subject_name: str) -> str:
    """Build the Cameroonian education system prompt."""
    level = context.get("level", "GCE A-Level")
    stream = context.get("stream", "science")
    subjects = context.get("subjects", [])
    mode = context.get("mode", "exam")
    
    if mode == "casual":
        return f"""You are "Ticha", a friendly and knowledgeable learning companion. 
Your student is a casual learner interested in exploring various topics.
Be warm, engaging, and make learning fun. Use simple analogies and real-world examples.
Keep responses conversational but informative. Encourage curiosity.
Never make the student feel pressured — this is exploration, not exam prep."""
    
    prompt = f"""You are "Ticha AI", an expert virtual teacher specializing in the Cameroon Educational System (MINESEC / Cameroon GCE Board).

Your student is in {level} ({stream} stream), studying: {', '.join(subjects) if subjects else 'various subjects'}.
Current subject focus: {subject_name}
Learning mode: {mode}

IMPORTANT RULES:
1. Always adopt an encouraging, pedagogic tone. Be patient and supportive.
2. Break down solutions into clear, step-by-step explanations.
3. For math/science: show all working, use LaTeX notation (e.g., $$E = mc^2$$).
4. For Francophone system (BEPC/Probatoire/BAC): structure responses using the local methodology (Situation Problème, Évaluation des ressources, Évaluation des compétences).
5. For GCE O-Level and A-Level: focus on past paper style, common exam questions, and mark schemes.
6. Never just give the final answer — explain the "why" behind formulas and concepts.
7. Use local Cameroon examples when relevant to make concepts relatable.
8. If the student seems confused, ask clarifying questions before answering.
9. Keep responses concise but complete. Aim for 2-4 paragraphs unless showing detailed working.
10. If asked about exam strategy, provide specific tips for that exam format.

CRITICAL MARKER RULE:
- If you create a weekly/daily study plan, schedule, or revision timetable, append exactly this at the very end of your response (on its own line):
<!--PLAN-->
- This marker is invisible to the student but tells the app to show a "Save Plan" button.
- ONLY add this marker when you've actually created a structured plan, not for general advice.

You are helping students prepare for national exams. Your goal is to make them UNDERSTAND, not just memorize."""
    
    return prompt

@router.get("/sessions")
def get_user_chat_sessions(
    user_id: str = Depends(get_current_user), 
    db: Client = Depends(get_db)
):
    """Fetches all active chat tutor sessions for the user."""
    response = db.table("chat_sessions").select("*").eq("profile_id", user_id).order("created_at", desc=True).execute()
    if not response.data:
        return []
        
    sessions = []
    for s in response.data:
        subj_name = get_subject_name(s.get("subject_id"), db)
        sessions.append({
            "id": str(s["id"]),
            "subject_id": str(s["subject_id"]) if s.get("subject_id") else "",
            "subject": subj_name,
            "title": s.get("title") or "New conversation",
            "date": "Today",
            "status": s.get("status") or "active",
            "created_at": s.get("created_at")
        })
    return sessions

@router.post("/sessions", status_code=status.HTTP_201_CREATED)
def create_chat_session(
    payload: SessionCreate,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Creates a new AI chat tutor session."""
    session_id = str(uuid4())
    
    clean_subject_id = payload.subject_id if payload.subject_id and payload.subject_id != "General" else None
    title = payload.title or "New conversation"
    
    session_row = {
        "id": session_id,
        "profile_id": user_id,
        "subject_id": clean_subject_id,
        "title": title,
        "status": "active"
    }
    
    response = db.table("chat_sessions").insert(session_row).execute()
    if not response.data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create chat session.")

    return {
        "id": session_id,
        "subject_id": payload.subject_id,
        "subject": get_subject_name(payload.subject_id, db),
        "title": title,
        "date": "Today",
        "status": "active"
    }

@router.delete("/sessions/{session_id}")
def delete_chat_session(
    session_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Deletes a chat session and all its messages."""
    db.table("chat_messages").delete().eq("session_id", session_id).execute()
    db.table("chat_sessions").delete().eq("id", session_id).eq("profile_id", user_id).execute()
    return {"message": "Session deleted"}

@router.get("/messages")
def get_session_messages(
    session_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Fetches the conversation log."""
    response = (
        db.table("chat_messages")
        .select("*")
        .eq("session_id", session_id)
        .order("created_at", desc=False)
        .execute()
    )
    return response.data or []

@router.post("/messages", status_code=status.HTTP_201_CREATED)
def send_chat_message(
    payload: MessageCreate,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Saves user message, gets REAL AI response from Gemini, saves it, returns it."""
    
    user_msg_id = str(uuid4())
    user_msg = {
        "id": user_msg_id,
        "session_id": payload.session_id,
        "role": "user",
        "content": payload.content,
        "created_at": datetime.utcnow().isoformat()
    }
    db.table("chat_messages").insert(user_msg).execute()
    
    messages_count = db.table("chat_messages").select("id").eq("session_id", payload.session_id).execute()
    if messages_count.data and len(messages_count.data) == 1:
        title_text = payload.content[:60]
        db.table("chat_sessions").update({"title": title_text}).eq("id", payload.session_id).execute()
    
    sess_res = db.table("chat_sessions").select("subject_id").eq("id", payload.session_id).execute()
    subj_name = "General Study"
    if sess_res.data and sess_res.data[0].get("subject_id"):
        subj_name = get_subject_name(sess_res.data[0]["subject_id"], db)
    
    context = get_user_context(user_id, db)
    system_prompt = build_system_prompt(context, subj_name)
    
    history_res = db.table("chat_messages").select("*").eq("session_id", payload.session_id).order("created_at", desc=False).execute()
    
    contents = []
    contents.append({"role": "user", "parts": [{"text": f"[System Instruction]\n{system_prompt}\n\nNow respond to the student's message below."}]})
    contents.append({"role": "model", "parts": [{"text": "Understood. I will follow these instructions and respond as Ticha."}]})
    
    if history_res.data:
        history = history_res.data[:-1]
        recent_history = history[-12:]
        for msg in recent_history:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg["content"]}]})
    
    contents.append({"role": "user", "parts": [{"text": payload.content}]})
    
    try:
        ai_response = gemini_client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=contents,
            config={
                'temperature': 0.3,
                'max_output_tokens': 1500,
                'top_p': 0.95,
            }
        )
        ai_text = ai_response.text
    except Exception as e:
        print(f"Gemini API error: {e}")
        ai_text = f"I apologize, but I'm having trouble processing that right now. Could you rephrase your question about {subj_name}?"
    
    ai_msg_id = str(uuid4())
    ai_msg = {
        "id": ai_msg_id,
        "session_id": payload.session_id,
        "role": "assistant",
        "content": ai_text,
        "created_at": datetime.utcnow().isoformat()
    }
    
    res = db.table("chat_messages").insert(ai_msg).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save AI response.")
        
    return res.data[0]

@router.post("/sessions/{session_id}/extract-plan")
def extract_study_plan(
    session_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Extracts a study plan from the conversation and creates it in the database."""
    
    messages = db.table("chat_messages").select("*").eq("session_id", session_id).eq("role", "assistant").order("created_at", desc=True).limit(1).execute()
    
    if not messages.data:
        raise HTTPException(status_code=400, detail="No AI response found")
    
    plan_text = messages.data[0]["content"]
    context = get_user_context(user_id, db)
    
    extract_prompt = f"""Extract a study plan from this tutoring response. Return ONLY valid JSON:

{plan_text}

JSON format:
{{"subjects": ["subject name"], "hours_per_day": number, "target_date": "YYYY-MM-DD"}}

If no clear plan found, return: {{"subjects": []}}"""
    
    try:
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=extract_prompt,
            config={'temperature': 0.1, 'max_output_tokens': 300}
        )
        
        raw = response.text.strip()
        if raw.startswith('```'):
            raw = raw.split('\n', 1)[1]
            if raw.endswith('```'):
                raw = raw[:-3]
        
        plan_data = json.loads(raw)
        
        if not plan_data.get("subjects"):
            raise HTTPException(status_code=400, detail="No study plan found")
        
        target_date = plan_data.get("target_date", str(date.today() + timedelta(days=42)))
        plan_id = str(uuid4())
        
        db.table("study_plans").insert({
            "id": plan_id,
            "profile_id": user_id,
            "target_date": target_date,
            "title": f"Plan: {', '.join(plan_data['subjects'][:2])}..."
        }).execute()
        
        subjects = plan_data["subjects"]
        hours = plan_data.get("hours_per_day", 2)
        days = min((date.fromisoformat(target_date) - date.today()).days, 42)
        tasks_created = 0
        
        for day_offset in range(days):
            scheduled = date.today() + timedelta(days=day_offset)
            for i in range(hours):
                subject = subjects[i % len(subjects)]
                task_type = "reading" if i % 2 == 0 else "quiz"
                db.table("daily_tasks").insert({
                    "id": str(uuid4()),
                    "plan_id": plan_id,
                    "title": f"{task_type.capitalize()}: {subject} - Day {day_offset+1}",
                    "task_type": task_type,
                    "status": "pending",
                    "scheduled_date": scheduled.isoformat()
                }).execute()
                tasks_created += 1
        
        return {
            "success": True,
            "plan_id": plan_id,
            "tasks_created": tasks_created,
            "subjects": subjects,
            "message": f"Plan created with {tasks_created} tasks over {days} days"
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Could not parse plan. Try asking Ticha to summarize the plan first.")