import express from 'express';
import { buildIceServers } from './webrtc/iceServers.js';
import { createLiveKitParticipantToken, isLiveKitConfigured } from './livekit/token.js';


import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const PORT = Number(process.env.PORT ?? 3001);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    ai: Boolean(GEMINI_API_KEY),
    turn: Boolean(process.env.TURN_URLS),
    livekit: isLiveKitConfigured(),
  });
});

app.post('/api/ai/chat', async (req, res) => {
  if (!GEMINI_API_KEY) {
    res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    return;
  }
  const { message, context } = req.body as { message?: string; context?: string };
  if (!message?.trim()) {
    res.status(400).json({ error: 'message required' });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const prompt = context
      ? `Context: ${context}\n\nUser: ${message}`
      : message;
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const text = result.text ?? 'No response';
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

app.post('/api/ai/codenames-hint', async (req, res) => {
  if (!GEMINI_API_KEY) {
    res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    return;
  }
  const { words, team, count } = req.body as {
    words?: string[];
    team?: 'red' | 'blue';
    count?: number;
  };

  if (!words?.length || !team) {
    res.status(400).json({ error: 'words and team required' });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const prompt = `You are a Codenames spymaster for the ${team} team.
Given these unrevealed words on your team board: ${words.join(', ')}.
Reply ONLY with JSON: {"clue":"ONE_WORD","count":NUMBER}
The clue must be one word, uppercase, not matching any board word. Count is how many words link to the clue (1-3).`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const raw = result.text ?? '{}';
    const match = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match?.[0] ?? '{}') as { clue?: string; count?: number };
    res.json({
      clue: (parsed.clue ?? 'LINK').toUpperCase().slice(0, 24),
      count: Math.min(3, Math.max(1, Number(parsed.count ?? count ?? 2))),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Hint generation failed' });
  }
});



app.get('/api/webrtc/ice-servers', (_req, res) => {
  res.json({ iceServers: buildIceServers() });
});

app.get('/api/livekit/status', (_req, res) => {
  res.json({ configured: isLiveKitConfigured(), url: process.env.VITE_LIVEKIT_URL ?? null });
});

app.post('/api/livekit/token', async (req, res) => {
  if (!isLiveKitConfigured()) {
    res.status(503).json({ error: 'LiveKit API keys not configured on server' });
    return;
  }
  const { room, identity, name } = req.body as {
    room?: string;
    identity?: string;
    name?: string;
  };
  if (!room?.trim() || !identity?.trim()) {
    res.status(400).json({ error: 'room and identity required' });
    return;
  }
  try {
    const token = await createLiveKitParticipantToken({
      roomName: room.trim(),
      identity: identity.trim(),
      name: name?.trim(),
    });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'LiveKit token generation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`TableForge API listening on http://localhost:${PORT}`);
});
