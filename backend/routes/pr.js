import express from "express";
const router = express.Router();

// Example route
router.get("/", (req, res) => {
  res.send("PR routes working ✅");
});

export default router;
