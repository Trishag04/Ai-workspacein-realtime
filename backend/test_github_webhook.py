# test_github_webhook.py
import hmac
import hashlib
import json
import requests
import os
from datetime import datetime

 # === EDIT THESE ===
NGROK_URL = "https://uncloven-jeanelle-nonderogatorily.ngrok-free.dev"  # <- replace with your ngrok URL (no trailing slash)
GITHUB_WEBHOOK_SECRET = "a28b404698509f0945dc99155ca7d4abf1e8e787e0d07895ab89d46a35dcae74"                     # <- replace with your webhook secret
# ==================

endpoint = f"{NGROK_URL}/webhooks/github"  # matches your FastAPI path

# Build a synthetic pull_request payload
payload = {
  "action": "opened",
  "number": 123,
  "pull_request": {
    "number": 123,
    "title": "Test PR — feature/abc",
    "body": "TaskID: 5f8d9b3e-1234-4a2b-9f0d-abcdef123456\nEmployeeGithub: test-gh-user\n\nThis is a test PR body.",
    "html_url": "https://github.com/test-owner/test-repo/pull/123",
    "state": "open",
    "merged": False,
    "head": {"sha": "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef"},
    "created_at": datetime.utcnow().isoformat() + "Z",
    "updated_at": datetime.utcnow().isoformat() + "Z"
  },
  "repository": {
    "id": 111111,
    "name": "test-repo",
    "full_name": "test-owner/test-repo",
    "owner": {"login": "test-owner"}
  },
  "sender": {"login": "test-gh-user"}
}

raw = json.dumps(payload).encode("utf-8")

# Compute signature (sha256 hex)
mac = hmac.new(GITHUB_WEBHOOK_SECRET.encode("utf-8"), msg=raw, digestmod=hashlib.sha256)
signature = "sha256=" + mac.hexdigest()

headers = {
    "X-GitHub-Event": "pull_request",
    "X-Hub-Signature-256": signature,
    "Content-Type": "application/json",
    "User-Agent": "LocalWebhookTest/1.0",
}

print("Sending signed payload to:", endpoint)
r = requests.post(endpoint, data=raw, headers=headers, timeout=10)
print("HTTP", r.status_code)
try:
    print("Response JSON:", r.json())
except Exception:
    print("Response text:", r.text)


# // import express from "express";
# // import crypto from "crypto";
# // import { PrismaClient } from "@prisma/client";

# // const prisma = new PrismaClient();
# // const router = express.Router();

# // const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

# // // Helper to verify GitHub signature
# // function verifyGitHubSignature(req, res, buf) {
# //   const signature = req.headers["x-hub-signature-256"];
# //   if (!signature) {
# //     throw new Error("No signature found");
# //   }

# //   const hmac = crypto.createHmac("sha256", GITHUB_WEBHOOK_SECRET);
# //   hmac.update(buf);
# //   const digest = "sha256=" + hmac.digest("hex");

# //   if (signature !== digest) {
# //     throw new Error("Invalid signature");
# //   }
# // }

# // // Use raw body parser for webhook verification
# // router.post(
# //   "/github",
# //   express.raw({ type: "application/json" }),
# //   async (req, res) => {
# //     try {
# //       verifyGitHubSignature(req, res, req.body);

# //       const event = req.headers["x-github-event"];
# //       const payload = JSON.parse(req.body.toString());

# //       if (event === "pull_request") {
# //         const pr = payload.pull_request;
# //         const taskId = parseInt(pr.title.match(/\[TaskID:(\d+)\]/)?.[1]); // Example: include TaskID in PR title

# //         if (taskId) {
# //           // Update task status based on PR state
# //           let status = "In Progress";
# //           if (pr.merged) status = "Completed";
# //           else if (pr.state === "closed") status = "Closed";

# //           await prisma.task.update({
# //             where: { id: taskId },
# //             data: { status },
# //           });
# //         }
# //       }

# //       res.status(200).send("Webhook received");
# //     } catch (err) {
# //       console.error(err);
# //       res.status(400).send("Webhook error");
# //     }
# //   }
# // );

# // export default router;
