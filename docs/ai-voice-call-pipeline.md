# AI Voice Call Pipeline

This module implements a starter **STT → LLM → TTS** pipeline.

## Flow

1. Receive audio or text
2. Transcribe audio with OpenAI Audio Transcriptions
3. Generate a sales-aware reply
4. Optionally synthesize reply audio to `public/audio/`
5. Return text + business action + audio URL

## API

### `POST /api/pipeline/run-turn`

Request body using direct text:

```json
{
  "transcript": "สนใจเซรั่มตัวไหนดีสำหรับผิวแห้ง",
  "callContext": {
    "callId": "demo-call-1",
    "from": "0811111111"
  }
}
```

Request body using audio:

```json
{
  "audioBase64": "BASE64_AUDIO_HERE",
  "mimeType": "audio/webm",
  "callContext": {
    "callId": "demo-call-2",
    "from": "0811111111"
  }
}
```

## Why this shape?

OpenAI supports speech-to-text transcription models through the Audio API and text-to-speech through the speech endpoint, which is a good fit for a pipeline that converts caller audio into text, reasons over it, then returns generated speech. 
