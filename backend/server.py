import json
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from datetime import datetime
import bcrypt
import logging, sys
# --- GitHub webhook handler for FastAPI (paste into server.py) ---
import os
import hmac
import hashlib
import json
import re
from datetime import datetime
from fastapi import Request, Header, HTTPException
from dotenv import load_dotenv
load_dotenv()   # will load .env into os.environ


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

# optional safe fallback (not necessary here, but okay to keep)
try:
    logger
except NameError:
    import logging
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
    githubLogin: str | None = None

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
        existing = supabase_auth.table("employee").select("email").eq("email", data.email).execute()
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
            "github_login": data.githubLogin if getattr(data, "githubLogin", None) else None,
        }

        response = supabase_auth.table("employee").insert(payload).execute()
        
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
        result = supabase_auth.table("employee").select("*").eq("email", data.email).execute()

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
                supabase_auth.table("employee").update({"password": new_hash}).eq("email", data.email).execute()
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

def verify_github_signature(raw_body: bytes, signature_header: str, secret: str) -> bool:
    """
    signature_header example: "sha256=abcd..."
    """
    if not signature_header or not signature_header.startswith("sha256="):
        return False
    received = signature_header.split("=", 1)[1]
    mac = hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha256)
    expected = mac.hexdigest()
    return hmac.compare_digest(expected, received)

# parse TaskID and EmployeeGithub
TASKID_RE = re.compile(r"TaskID:\s*([0-9a-fA-F\-\_]+)", re.IGNORECASE)
EMP_GH_RE = re.compile(r"EmployeeGithub:\s*([A-Za-z0-9\-_]+)", re.IGNORECASE)

def parse_prefilled_fields(text: str):
    task = None
    emp = None
    if not text:
        return task, emp
    m = TASKID_RE.search(text)
    if m:
        task = m.group(1).strip()
    m2 = EMP_GH_RE.search(text)
    if m2:
        emp = m2.group(1).strip()
    return task, emp

# small helper to safe .data access
def supabase_result_data(res):
    # supabase-py returns object with .data (list) and .error
    try:
        return getattr(res, "data", None)
    except Exception:
        return None

@app.post("/webhooks/github")
async def github_webhook(
    request: Request,
    x_hub_signature_256: str | None = Header(None),
    x_github_event: str | None = Header(None),
    x_github_delivery: str | None = Header(None),
):
    
    print("Received signature:", x_hub_signature_256)

    # 1) raw body for signature check
    raw = await request.body()

    # 2) ensure secret present
    secret = os.environ.get("GITHUB_WEBHOOK_SECRET")
    if not secret:
        logger.error("GITHUB_WEBHOOK_SECRET not set")
        raise HTTPException(status_code=500, detail="Webhook secret not configured on server")

    if not verify_github_signature(raw, x_hub_signature_256 or "", secret):
        logger.warning("GitHub webhook signature mismatch")
        raise HTTPException(status_code=401, detail="Invalid signature")

    # 3) parse JSON payload
    try:
        payload = json.loads(raw.decode("utf-8"))
    except Exception as e:
        logger.error("Invalid JSON payload: %s", e)
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event = (x_github_event or "").strip()

    # Optional: save raw event for debugging if env var enabled
    try:
        if os.environ.get("ENABLE_SAVE_WEBHOOK_EVENTS", "false").lower() == "true":
            supabase_auth.table("webhook_events").insert({
                "delivery_id": x_github_delivery,
                "event_type": event,
                "payload": payload,
                "created_at": datetime.utcnow().isoformat()
            }).execute()
    except Exception as e:
        logger.warning("Failed saving webhook event: %s", e)

    # helper to resolve employee id by github login or fallback to parsed emp gh
    def resolve_author_id(sender_login: str | None, emp_gh_fallback: str | None):
        try:
            if sender_login:
                res = supabase_auth.table("employee").select("id").eq("github_login", sender_login).execute()
                data = supabase_result_data(res)
                if data:
                    # data is usually a list
                    if isinstance(data, list) and len(data) > 0:
                        return data[0].get("id")
                    if isinstance(data, dict):
                        return data.get("id")
            if emp_gh_fallback:
                res2 = supabase_auth.table("employee").select("id").eq("github_login", emp_gh_fallback).execute()
                d2 = supabase_result_data(res2)
                if d2:
                    if isinstance(d2, list) and len(d2) > 0:
                        return d2[0].get("id")
                    if isinstance(d2, dict):
                        return d2.get("id")
        except Exception as e:
            logger.warning("Error resolving employee: %s", e)
        return None

    # -------------------- PULL_REQUEST event --------------------
    if event == "pull_request":
        pr = payload.get("pull_request") or {}
        sender = payload.get("sender") or {}
        repo = payload.get("repository") or {}

        repo_owner = (repo.get("owner") or {}).get("login") or (repo.get("full_name") or "").split("/")[0]
        repo_name = repo.get("name") or (repo.get("full_name") or "").split("/")[1] if repo.get("full_name") and "/" in repo.get("full_name") else repo.get("name")
        pr_number = pr.get("number")
        head_sha = (pr.get("head") or {}).get("sha") or pr.get("head_sha")
        pr_html_url = pr.get("html_url")
        pr_state = pr.get("state")  # open/closed
        merged = pr.get("merged", False)
        body_text = pr.get("body") or ""
        created_at = pr.get("created_at")
        updated_at = pr.get("updated_at")

        parsed_taskid, parsed_empgh = parse_prefilled_fields(body_text)
        sender_login = (sender.get("login") if sender else None)
        author_id = resolve_author_id(sender_login, parsed_empgh)

        status = "merged" if merged else (pr_state or "open")

        # Upsert PR row (lookup by repo_owner+repo_name+pr_number)
        try:
            existing = supabase_auth.table("PR").select("*")\
                .eq("repo_owner", repo_owner).eq("repo_name", repo_name).eq("pr_number", pr_number).execute()
            existing_data = supabase_result_data(existing)
            if existing_data and isinstance(existing_data, list) and len(existing_data) > 0:
                # update
                row_id = existing_data[0].get("id")
                update_payload = {
                    "url": pr_html_url,
                    "status": status,
                    "taskid_raw": parsed_taskid ,
                    "authorId": author_id,
                    "last_updated_at": updated_at or datetime.utcnow().isoformat(),
                    "head_sha": head_sha,
                    "pr_html_url": pr_html_url,
                    "repo_owner": repo_owner,
                    "repo_name": repo_name,
                    "pr_number": pr_number
                }
                supabase_auth.table("PR").update(update_payload).eq("id", row_id).execute()
                logger.info(f"Updated PR {repo_owner}/{repo_name}#{pr_number}")
            else:
                # insert
                insert_payload = {
                    "url": pr_html_url,
                    "status": status,
                    "taskid_raw": parsed_taskid,
                    "authorId": author_id,
                    "createdAt": created_at or datetime.utcnow().isoformat(),
                    "ci_overall": None,
                    "head_sha": head_sha,
                    "pr_html_url": pr_html_url,
                    "last_updated_at": updated_at or datetime.utcnow().isoformat(),
                    "repo_owner": repo_owner,
                    "repo_name": repo_name,
                    "pr_number": pr_number
                }
                supabase_auth.table("PR").insert(insert_payload).execute()
                logger.info(f"Inserted PR {repo_owner}/{repo_name}#{pr_number}")
        except Exception as e:
            logger.error("DB upsert PR failed: %s", e)

        return {"ok": True, "msg": "pull_request processed"}

    # -------------------- check_run event --------------------
        # -------------------- check_run event (instrumented) --------------------
    if event == "check_run":
        # raw debug log
        logger.info("Received check_run event")

        check = payload.get("check_run") or {}
        repo = payload.get("repository") or {}
        repo_owner = (repo.get("owner") or {}).get("login") or (repo.get("full_name") or "").split("/")[0]
        repo_name = repo.get("name") or (repo.get("full_name") or "").split("/")[1] if repo.get("full_name") and "/" in repo.get("full_name") else repo.get("name")
        commit_sha = check.get("head_sha") or check.get("head_commit", {}).get("id")
        check_name = check.get("name")
        status = check.get("status")
        conclusion = check.get("conclusion")
        details_url = check.get("html_url") or check.get("details_url")
        started_at = check.get("started_at")
        completed_at = check.get("completed_at")

        logger.info(f"check_run: repo_owner={repo_owner}, repo_name={repo_name}, commit_sha={commit_sha}, check_name={check_name}, status={status}, conclusion={conclusion}")

        if not commit_sha:
            logger.warning("check_run received with no commit sha")
            return {"ok": False, "msg": "no commit sha"}

        # Try to find matching PR to attach pr_id / authorid
        pr_id_for_check = None
        authorid_for_check = None
        try:
            pr_lookup = supabase_auth.table("PR") \
                .select("id, \"authorId\", repo_owner, repo_name, head_sha") \
                .eq("head_sha", commit_sha) \
                .execute()
            pr_list = supabase_result_data(pr_lookup) or []
            logger.info(f"PR lookup returned {len(pr_list) if isinstance(pr_list, list) else (1 if pr_list else 0)} rows")
            if isinstance(pr_list, list) and len(pr_list) > 0:
                # prefer exact repo match
                picked = None
                for r in pr_list:
                    if r.get("repo_owner") == repo_owner and r.get("repo_name") == repo_name:
                        picked = r
                        break
                picked = picked or pr_list[0]
                pr_id_for_check = picked.get("id")
                authorid_for_check = picked.get("authorId") or picked.get("authorid")
                logger.info(f"Matched PR id={pr_id_for_check}, authorid={authorid_for_check}")
            elif isinstance(pr_list, dict) and pr_list:
                pr_id_for_check = pr_list.get("id")
                authorid_for_check = pr_list.get("authorId") or pr_list.get("authorid")
                logger.info(f"Matched single PR id={pr_id_for_check}, authorid={authorid_for_check}")
        except Exception as e:
            logger.warning("PR lookup failed for check_run: %s", e)

        # Build payload for ci_checks
        payload_ci = {
            "repo_owner": repo_owner,
            "repo_name": repo_name,
            "commit_sha": commit_sha,
            "check_name": check_name,
            "status": status,
            "conclusion": conclusion,
            "details_url": details_url,
            "started_at": started_at,
            "completed_at": completed_at,
            "authorid": authorid_for_check,
            "pr_id": pr_id_for_check
        }

        # For debugging: add a debug flag column if you want (optional)
        try:
            # Try update if an existing check exists, otherwise insert.
            existing_ck = supabase_auth.table("ci_checks").select("*") \
                .eq("repo_owner", repo_owner).eq("repo_name", repo_name).eq("commit_sha", commit_sha).eq("check_name", check_name).execute()
            existing_ck_data = supabase_result_data(existing_ck)
            if existing_ck_data and isinstance(existing_ck_data, list) and len(existing_ck_data) > 0:
                ck_id = existing_ck_data[0].get("id")
                logger.info(f"Existing ci_checks found id={ck_id}; updating.")
                res_upd = supabase_auth.table("ci_checks").update(payload_ci).eq("id", ck_id).execute()
                logger.info(f"Supabase update result: {getattr(res_upd, 'status_code', 'no-status')} / error={getattr(res_upd, 'error', None)}")
            else:
                logger.info("No existing ci_checks found; inserting new row.")
                res_ins = supabase_auth.table("ci_checks").insert(payload_ci).execute()
                logger.info(f"Supabase insert result: {getattr(res_ins, 'status_code', 'no-status')} / error={getattr(res_ins, 'error', None)}")
        except Exception as e:
            logger.error("ci_checks upsert failed (exception): %s", e)
            # As last resort: log the payload to a debug table (if exists) or to file — here we just return error
            return {"ok": False, "msg": f"ci_checks upsert failed: {e}"}

        # recompute PR.ci_overall (unchanged)
        try:
            prs_res = supabase_auth.table("PR").select("*").eq("head_sha", commit_sha).execute()
            prs_list = supabase_result_data(prs_res) or []
            for pr in prs_list:
                checks_res = supabase_auth.table("ci_checks").select("*") \
                    .eq("repo_owner", pr.get("repo_owner")).eq("repo_name", pr.get("repo_name")).eq("commit_sha", commit_sha).execute()
                checks_list = supabase_result_data(checks_res) or []

                overall = "pending"
                if any((c.get("conclusion") == "failure") for c in checks_list):
                    overall = "failing"
                elif any((c.get("status") in ("queued", "in_progress", None)) for c in checks_list):
                    overall = "pending"
                elif checks_list and all((c.get("conclusion") == "success") for c in checks_list):
                    overall = "passing"
                else:
                    overall = "pending"

                supabase_auth.table("PR").update({
                    "ci_overall": overall,
                    "last_updated_at": datetime.utcnow().isoformat()
                }).eq("id", pr.get("id")).execute()
        except Exception as e:
            logger.error("Failed to recompute ci_overall: %s", e)

        return {"ok": True, "msg": "check_run processed (instrumented)"}

    
    
    
    
    
    
    
    
    
    
    # if event == "check_run":
    #     check = payload.get("check_run") or {}
    #     repo = payload.get("repository") or {}
    #     repo_owner = (repo.get("owner") or {}).get("login") or (repo.get("full_name") or "").split("/")[0]
    #     repo_name = repo.get("name") or (repo.get("full_name") or "").split("/")[1] if repo.get("full_name") and "/" in repo.get("full_name") else repo.get("name")
    #     commit_sha = check.get("head_sha") or check.get("head_commit", {}).get("id")
    #     check_name = check.get("name")
    #     status = check.get("status")  # queued/in_progress/completed
    #     conclusion = check.get("conclusion")  # success/failure/neutral/etc
    #     details_url = check.get("html_url") or check.get("details_url")
    #     started_at = check.get("started_at")
    #     completed_at = check.get("completed_at")

    #     if not commit_sha:
    #         logger.warning("check_run received with no commit sha")
    #         return {"ok": False, "msg": "no commit sha"}

    #     # --- Locate PR(s) that match this commit (prefer exact repo match)
    #     pr_id_for_check = None
    #     authorid_for_check = None
    #     try:
    #         pr_lookup = supabase_auth.table("PR") \
    #             .select("id, \"authorId\", repo_owner, repo_name") \
    #             .eq("head_sha", commit_sha) \
    #             .execute()
    #         pr_list = supabase_result_data(pr_lookup) or []
    #         # prefer matching repo_owner/repo_name if there are multiple matches
    #         if isinstance(pr_list, list) and len(pr_list) > 0:
    #             # try to find exact repo match first
    #             exact = None
    #             for r in pr_list:
    #                 if (not repo_owner or not repo_name) or (r.get("repo_owner") == repo_owner and r.get("repo_name") == repo_name):
    #                     exact = r
    #                     break
    #             picked = exact or pr_list[0]
    #             pr_id_for_check = picked.get("id")
    #             # note: PR column stored authorId with camel-case in PR; we will map to ci_checks.authorid
    #             authorid_for_check = picked.get("authorId") or picked.get("authorid") or None
    #         elif isinstance(pr_list, dict) and pr_list:
    #             pr_id_for_check = pr_list.get("id")
    #             authorid_for_check = pr_list.get("authorId") or pr_list.get("authorid") or None
    #     except Exception as e:
    #         logger.warning("PR lookup failed for check_run: %s", e)

    #     try:
    #         # upsert into ci_checks (unique = repo_owner, repo_name, commit_sha, check_name)
    #         existing_ck = supabase_auth.table("ci_checks").select("*")\
    #             .eq("repo_owner", repo_owner).eq("repo_name", repo_name).eq("commit_sha", commit_sha).eq("check_name", check_name).execute()
    #         existing_ck_data = supabase_result_data(existing_ck)



    #         payload = {
    #             "repo_owner": repo_owner,
    #             "repo_name": repo_name,
    #             "commit_sha": commit_sha,
    #             "check_name": check_name,
    #             "status": status,
    #             "conclusion": conclusion,
    #             "details_url": details_url,
    #             "started_at": started_at,
    #             "completed_at": completed_at,
    #             "authorid": authorid_for_check,   # matches your ci_checks column name
    #             "pr_id": pr_id_for_check
    #         }

    #         if existing_ck_data and isinstance(existing_ck_data, list) and len(existing_ck_data) > 0:
    #             # update existing row
    #             supabase_auth.table("ci_checks").update(payload).eq("id", existing_ck_data[0].get("id")).execute()
    #         else:
    #             supabase_auth.table("ci_checks").insert(payload).execute()


    #     except Exception as e:
    #         logger.error("ci_checks upsert failed: %s", e)

    #     # recompute aggregate CI status for PRs matching this head sha
    #     try:
    #         prs_res = supabase_auth.table("PR").select("*").eq("head_sha", commit_sha).execute()
    #         prs_list = supabase_result_data(prs_res) or []
    #         for pr in prs_list:
    #             checks_res = supabase_auth.table("ci_checks").select("*")\
    #                 .eq("repo_owner", pr.get("repo_owner")).eq("repo_name", pr.get("repo_name")).eq("commit_sha", commit_sha).execute()
    #             checks_list = supabase_result_data(checks_res) or []

    #             overall = "pending"
    #             if any((c.get("conclusion") == "failure") for c in checks_list):
    #                 overall = "failing"
    #             elif any((c.get("status") in ("queued", "in_progress", None)) for c in checks_list):
    #                 overall = "pending"
    #             elif checks_list and all((c.get("conclusion") == "success") for c in checks_list):
    #                 overall = "passing"
    #             else:
    #                 overall = "pending"

    #             supabase_auth.table("PR").update({
    #                 "ci_overall": overall,
    #                 "last_updated_at": datetime.utcnow().isoformat()
    #             }).eq("id", pr.get("id")).execute()
    #     except Exception as e:
    #         logger.error("Failed to recompute ci_overall: %s", e)

    #     return {"ok": True, "msg": "check_run processed"}

    # logger.info(f"Ignored GitHub event: {event}")
    # return {"ok": True, "msg": f"ignored {event}"}       


    
