# send_test_webhook.py
import hmac, hashlib, json, requests, os
from datetime import datetime

NGROK = "https://uncloven-jeanelle-nonderogatorily.ngrok-free.dev"   # your ngrok URL
SECRET = os.environ.get("GITHUB_WEBHOOK_SECRET") or "a28b404698509f0945dc99155ca7d4abf1e8e787e0d07895ab89d46a35dcae74"
URL = NGROK + "/webhooks/github"

payload = {
  "action": "opened",
  "pull_request": {
    "number": 123,
    "title": "Test PR — webhook test",
    "body": "TaskID: 42\nEmployeeGithub: testuser\n\nThis is a test PR body.",
    "head": {"sha": "deadbeefcafebabe1234"},
    "html_url": "https://github.com/fake/repo/pull/123",
    "state": "open",
    "created_at": datetime.utcnow().isoformat() + "Z",
    "updated_at": datetime.utcnow().isoformat() + "Z",
  },
  "repository": {
    "name": "repo",
    "full_name": "org-or-user/repo",
    "owner": {"login": "org-or-user"},
  },
  "sender": {"login": "testuser"}
}

# compute signature header (sha256)
raw = json.dumps(payload).encode("utf-8")
mac = hmac.new(SECRET.encode("utf-8"), raw, hashlib.sha256).hexdigest()
sig = f"sha256={mac}"

headers = {
  "X-Hub-Signature-256": sig,
  "X-GitHub-Event": "pull_request",
  "Content-Type": "application/json",
  "User-Agent": "Webhook-Test"
}

print("Sending signed payload to:", URL)
r = requests.post(URL, headers=headers, data=raw, timeout=10)
print("Status:", r.status_code)
print("Body:", r.text)
