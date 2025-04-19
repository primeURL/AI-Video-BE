import express from "express";

import { generateVideo, getAllGeneratedVideos, getGeneratedVideo, webhookVideoGeneration } from "../controller";

const router = express.Router();


router.post('/generate-video', generateVideo)


router.post('/did-webhook', webhookVideoGeneration)

router.get('/get-all-videos',getAllGeneratedVideos)

router.get('/get-video/:videoId',getGeneratedVideo)

export default router;