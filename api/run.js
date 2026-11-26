const BASE = "https://api.sandbase.ai/v1";

// Models verified to work on a free SandBase key (tested live):
const MODELS = {
  image: (b) => ({ model: "z-image/turbo", prompt: b.prompt }),
  video: (b) => ({ model: "minimax/h3-max-turbo/text-to-video", prompt: b.prompt }),
  tts:   (b) => ({ model: "alibaba/qwen-3-tts/0.6b", prompt: "Convert text to speech", text: b.text || b.prompt, voice: b.voice || "Ryan", language: b.language || "Auto" }),
  // Speech-to-text: pass the stored media URL from /api/upload
  stt:   (b) => ({ model: "openai/wizper", task: "transcribe", audio: b.audio, language: b.language || "ar", version: "3", chunk_level: "segment", merge_chunks: true, max_segment_len: 29 })
};

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();

  const key = process.env.SANDBASE_API_KEY;
  if (!key) return res.status(500).json({ error: "SANDBASE_API_KEY is not set in Vercel environment variables" });

  try {
    if (req.method === "GET") {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: "id required" });
      const r = await fetch(BASE + "/run/" + encodeURIComponent(id), {
        headers: { Authorization: "Bearer " + key }
      });
      const data = await r.json().catch(() => ({}));
      return res.status(r.ok ? 200 : r.status).json(data);
    }

    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const build = MODELS[body.type];
    if (!build) return res.status(400).json({ error: "type must be image, video, tts or stt" });
    if (body.type === "stt") {
      if (!body.audio) return res.status(400).json({ error: "audio url required" });
    } else if (!(body.prompt || body.text)) {
      return res.status(400).json({ error: "prompt required" });
    }

    const r = await fetch(BASE + "/run", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify(build(body))
    });
    const data = await r.json().catch(() => ({}));
    return res.status(r.ok ? 200 : r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
};
