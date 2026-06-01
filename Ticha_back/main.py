from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import profiles, study, subjects, questions, chat

app = FastAPI(title="SLA-Ticha API")

# Configure CORS so your Vite React app can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the API endpoints we have completed
app.include_router(profiles.router)
app.include_router(study.router)
app.include_router(subjects.router)
app.include_router(questions.router)
app.include_router(chat.router)

@app.get("/")
def root():
    return {"message": "SLA-Ticha API is running."}