const axios = require("axios");
const { env } = require("../../config/env");

const SARVAM_API_KEY = env.SARVAM_API_KEY || process.env.SARVAM_API_KEY;

exports.textToSpeech = async (req, res, next) => {
  try {
    const { text, language = "hi-IN" } = req.body;

    const response = await axios.post(
      "https://api.sarvam.ai/text-to-speech",
      {
        inputs: [text],
        target_language_code: language,
        speaker: "meera", // Sarvam's Hindi/English speaker
        speech_sample_rate: 8000,
      },
      {
        headers: {
          "api-subscription-key": SARVAM_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({
      success: true,
      audioBase64: response.data.audios[0],
    });
  } catch (error) {
    console.error("Sarvam TTS Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Text to speech failed" });
  }
};