import express from "express";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

// Helper to verify GitHub signature
function verifyGitHubSignature(req, res, buf) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) {
    throw new Error("No signature found");
  }

  const hmac = crypto.createHmac("sha256", GITHUB_WEBHOOK_SECRET);
  hmac.update(buf);
  const digest = "sha256=" + hmac.digest("hex");

  if (signature !== digest) {
    throw new Error("Invalid signature");
  }
}

// Use raw body parser for webhook verification
router.post(
  "/github",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      verifyGitHubSignature(req, res, req.body);

      const event = req.headers["x-github-event"];
      const payload = JSON.parse(req.body.toString());

      if (event === "pull_request") {
        const pr = payload.pull_request;
        const taskId = parseInt(pr.title.match(/\[TaskID:(\d+)\]/)?.[1]); // Example: include TaskID in PR title

        if (taskId) {
          // Update task status based on PR state
          let status = "In Progress";
          if (pr.merged) status = "Completed";
          else if (pr.state === "closed") status = "Closed";

          await prisma.task.update({
            where: { id: taskId },
            data: { status },
          });
        }
      }

      res.status(200).send("Webhook received");
    } catch (err) {
      console.error(err);
      res.status(400).send("Webhook error");
    }
  }
);

export default router;
