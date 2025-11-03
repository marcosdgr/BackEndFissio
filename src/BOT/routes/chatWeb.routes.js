import { Router } from "express";
import { responderChatWeb } from "../controllers/chat-web.controller.js";

const router = Router();

router.post("/chat", responderChatWeb);

export default router;