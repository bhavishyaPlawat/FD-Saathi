const express = require("express");
const voiceController = require("./voice.controller");

const router = express.Router();

// Only keeping the TTS route, STT is handled directly in the browser now
router.post("/tts", voiceController.textToSpeech);

module.exports = router;