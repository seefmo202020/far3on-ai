const BASE = "https://api.sandbase.ai/v1";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.SANDBASE_API_KEY;
  if (!key) return res.status(500).json({ error: "SANDBASE_API_KEY is not set in Vercel environment variables" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
    if (!messages.length) return res.status(400).json({ error: "messages required" });

    const r = await fetch(BASE + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4.1-flash:free",
        messages: messages,
        max_tokens: 2048
      })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json({ error: data.error?.message || data.error || "Upstream error" });
    const msg = data.choices?.[0]?.message || {};
    return res.status(200).json({ content: msg.content || msg.reasoning_content || "" });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
};
