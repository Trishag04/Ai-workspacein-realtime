from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from datetime import datetime
import bcrypt
import logging, sys

# ============================
# 🧠 Logging Setup
# ============================
# Configure logging to output to stdout
logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ============================
# 🔗 Supabase Connections (2 Projects)
# ============================

# --- 1️⃣ AUTH DATABASE ---
SUPABASE_AUTH_URL = "https://lqfxbenyazhbxgnikmvu.supabase.co"
SUPABASE_AUTH_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZnhiZW55YXpoYnhnbmlrbXZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM4NTYzMCwiZXhwIjoyMDc2OTYxNjMwfQ.SV2XmwMKU4nWiYObEUnJtxgLyD89aXiHpfD8n-zOreU"
# --- 2️⃣ TRANSCRIPTS DATABASE ---
SUPABASE_TRANSCRIPT_URL = "https://phoelhjhfpvawdwywtxx.supabase.co"
# Make sure to paste your valid service_role key here
SUPABASE_TRANSCRIPT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBob2VsaGpoZnB2YXdkd3l3dHh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTk5NTk3OCwiZXhwIjoyMDc3NTcxOTc4fQ.xN3Y6PaghIrP3ely9bgeryXvyvj8_cvFmSQDI8IFStU"

# ============================
# 🚀 FastAPI App
# ============================
app = FastAPI(title="AI Workspace Backend", version="2.0")

# ============================
# 🌐 CORS Setup
# ============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # For local development; restrict in production
        "http://localhost:3000",
        "https://your-frontend.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================
# 🧠 Supabase Clients
# ============================
try:
    supabase_auth: Client = create_client(SUPABASE_AUTH_URL, SUPABASE_AUTH_KEY)
    supabase_transcript: Client = create_client(SUPABASE_TRANSCRIPT_URL, SUPABASE_TRANSCRIPT_KEY)
    logger.info("Supabase clients initialized successfully.")
except Exception as e:
    logger.error(f"💥 Failed to initialize Supabase clients: {e}")
    sys.exit(1)


# ============================
# 📦 Pydantic Models
# ============================
class SignupData(BaseModel):
    name: str
    email: str
    password: str
    role: str | None = "EMPLOYEE"

class LoginData(BaseModel):
    email: str
    password: str

class TranscriptData(BaseModel):
    meeting_name: str
    transcript: str
    summary: str | None = None
    tasks: str | None = None
    pending_tasks: str | None = None

# ============================
# ❤️ Health Check
# ============================
@app.get("/")
def root():
    logger.info("✅ Backend health check successful")
    return {
        "status": "running",
        "message": "Backend connected successfully!",
        "auth_db_url": SUPABASE_AUTH_URL,
        "transcript_db_url": SUPABASE_TRANSCRIPT_URL,
    }

# ============================
# 🧩 SIGNUP Route
# ============================
@app.post("/signup")
def signup_user(data: SignupData):
    try:
        logger.info(f"🟢 Signup attempt: {data.email}")

        # Check if user exists
        existing = supabase_auth.table("Employee").select("email").eq("email", data.email).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="User already exists")

        # Hash password
        hashed_pw = bcrypt.hashpw(data.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        # Insert new record
        payload = {
            "name": data.name,
            "email": data.email,
            "password": hashed_pw,
            "role": data.role or "EMPLOYEE",
            "createdAt": datetime.utcnow().isoformat(),
        }

        response = supabase_auth.table("Employee").insert(payload).execute()
        
        # if response.error:  <-- REMOVED THIS BLOCK
        #     logger.error(f"Supabase signup error: {response.error}")
        #     raise HTTPException(status_code=500, detail=str(response.error))

        logger.info(f"✅ Signup successful for {data.email}")
        return {"success": True, "message": "Signup successful", "data": response.data}

    except HTTPException as e:
        logger.warning(f"⚠️ Signup validation error: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"💥 Signup Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================
# 🔐 LOGIN Route
# ============================
@app.post("/login")
def login_user(data: LoginData):
    try:
        logger.info(f"🟢 Login attempt: {data.email}")
        result = supabase_auth.table("Employee").select("*").eq("email", data.email).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")

        user = result.data[0]
        stored_password = user.get("password")

        if not stored_password:
            raise HTTPException(status_code=500, detail="Password missing in DB")

        # Auto-hash old plain-text passwords (optional but good)
        if not stored_password.startswith("$2b$"):
            if stored_password == data.password:
                logger.info(f"Hashing legacy password for {data.email}")
                new_hash = bcrypt.hashpw(data.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
                supabase_auth.table("Employee").update({"password": new_hash}).eq("email", data.email).execute()
                stored_password = new_hash
            else:
                raise HTTPException(status_code=401, detail="Invalid credentials")

        # Validate bcrypt hash
        if not bcrypt.checkpw(data.password.encode("utf-8"), stored_password.encode("utf-8")):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        logger.info(f"✅ Login successful for: {user['email']}")
        # Don't send the password hash back to the client
        user.pop("password", None) 
        return {"success": True, "message": "Login successful", "user": user}

    except HTTPException as e:
        logger.warning(f"⚠️ Login error: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"💥 Login Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================
# 🧾 MEETING TRANSCRIPTS (From 2nd Supabase)
# ============================
@app.post("/meeting-transcript")
def upload_transcript(data: TranscriptData):
    try:
        logger.info(f"📝 Uploading meeting transcript: {data.meeting_name}")

        payload = {
            "meeting_name": data.meeting_name,
            "transcript": data.transcript,
            "summary": data.summary or "",
            "tasks": data.tasks or "",
            "pending_tasks": data.pending_tasks or "",
            "created_at": datetime.utcnow().isoformat(),
        }

        response = supabase_transcript.table("transcripts").insert(payload).execute()
        
        # if response.error:  <-- REMOVED THIS BLOCK
        #     logger.error(f"Supabase transcript insert error: {response.error}")
        #     raise HTTPException(status_code=500, detail=str(response.error))

        logger.info(f"✅ Transcript inserted successfully: {data.meeting_name}")
        return {"success": True, "message": "Transcript saved successfully!", "data": response.data}

    except Exception as e:
        logger.error(f"💥 Upload Transcript Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/meeting-transcript")
def get_all_transcripts():
    try:
        logger.info("Fetching all transcripts")
        response = (
            supabase_transcript.table("transcripts")
            .select("id, meeting_name, transcript, summary, tasks, pending_tasks, created_at")
            .order("created_at", desc=True)
            .execute()
        )

        # if response.error:  <-- REMOVED THIS BLOCK
        #     logger.error(f"Supabase transcript fetch error: {response.error}")
        #     raise HTTPException(status_code=500, detail=str(response.error))
        
        logger.info(f"Found {len(response.data)} transcripts.")
        return {"success": True, "data": response.data or []}

    except Exception as e:
        logger.error(f"💥 Fetch Transcript Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/meeting-summary")
def get_meeting_summary():
    try:
        logger.info("Fetching meeting summaries")
        response = (
            supabase_transcript.table("transcripts")
            .select("id, meeting_name, summary, tasks, pending_tasks, created_at")
            .order("created_at", desc=True)
            .limit(5)
            .execute()
        )

        # if response.error:  <-- REMOVED THIS BLOCK
        #     logger.error(f"Supabase summary fetch error: {response.error}")
        #     raise HTTPException(status_code=500, detail=str(response.error))
        
        logger.info(f"Found {len(response.data)} summaries.")
        return {"success": True, "data": response.data or []}

    except Exception as e:
        logger.error(f"💥 Meeting Summary Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    # ============================
# ✅ TASK MANAGEMENT (Two-way sync with Supabase)
# ============================

class TaskData(BaseModel):
    title: str
    description: str
    status: str | None = "Pending"
    assigned_to: str | None = None
    due_date: str | None = None


@app.post("/tasks")
def create_task(data: TaskData):
    """Add a new task"""
    try:
        logger.info(f"🟢 Creating task: {data.title}")

        payload = {
            "title": data.title,
            "description": data.description,
            "status": data.status or "Pending",
            "assigned_to": data.assigned_to or "",
            "due_date": data.due_date,
            "created_at": datetime.utcnow().isoformat(),
        }

        response = supabase_transcript.table("tasks").insert(payload).execute()

        logger.info(f"✅ Task created successfully: {data.title}")
        return {"success": True, "message": "Task created successfully", "data": response.data}

    except Exception as e:
        logger.error(f"💥 Create Task Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/tasks")
def get_all_tasks():
    """Fetch all tasks"""
    try:
        logger.info("📋 Fetching all tasks...")
        response = (
            supabase_transcript.table("tasks")
            .select("id, title, description, status, assigned_to, due_date, created_at")
            .order("created_at", desc=True)
            .execute()
        )

        logger.info(f"✅ Retrieved {len(response.data)} tasks.")
        return {"success": True, "data": response.data or []}

    except Exception as e:
        logger.error(f"💥 Fetch Tasks Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/tasks/{task_id}")
def update_task(task_id: str, data: TaskData):
    """Update task (status, description, or due date)"""
    try:
        logger.info(f"✏️ Updating task ID: {task_id}")

        updates = {k: v for k, v in data.dict().items() if v is not None}
        response = supabase_transcript.table("tasks").update(updates).eq("id", task_id).execute()

        logger.info(f"✅ Task {task_id} updated successfully.")
        return {"success": True, "message": "Task updated", "data": response.data}

    except Exception as e:
        logger.error(f"💥 Update Task Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
