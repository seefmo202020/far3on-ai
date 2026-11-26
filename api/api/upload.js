const BASE = "https://api.sandbase.ai/v1";

// Proxies a browser-recorded/uploaded media file to SandBase /v1/upload
// and returns the stored URL that Run API inputs accept.
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.SANDBASE_API_KEY;
  if (!key) return res.status(500).json({ error: "SANDBASE_API_KEY is not set in Vercel environment variables" });

  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = Buffer.concat(chunks);
    if (!body.length) return res.status(400).json({ error: "file body required" });
    if (body.length > 50 * 1024 * 1024) return res.status(413).json({ error: "file too large (max 50MB)" });

    const filename = (req.query.filename || "upload.bin").replace(/[^\w.\-]/g, "_");
    const contentType = req.headers["content-type"] || "application/octet-stream";

    const boundary = "----far3on" + Math.random().toString(16).slice(2);
    const head = Buffer.from(
      "--" + boundary + "\r\n" +
      'Content-Disposition: form-data; name="file"; filename="' + filename + '"\r\n' +
      "Content-Type: " + contentType + "\r\n\r\n"
    );
    const tail = Buffer.from("\r\n--" + boundary + "--\r\n");
    const payload = Buffer.concat([head, body, tail]);

    const r = await fetch(BASE + "/upload", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "multipart/form-data; boundary=" + boundary
      },
      body: payload
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json({ error: data.error?.message || data.error || "Upstream upload error" });
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
};

module.exports.config = { api: { bodyParser: false } };
