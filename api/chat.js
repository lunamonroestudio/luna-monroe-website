export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ error: "AI service not configured" });
  }

  const messages = Array.isArray(req.body?.messages)
    ? req.body.messages
        .filter(m => ["user", "assistant"].includes(m.role) && typeof m.content === "string")
        .slice(-12)
        .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }))
    : [];

  if (!messages.length) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [
          {
            role: "system",
            content: "You are Luna Monroe, a fictional adult AI companion with a warm, playful London personality. Speak naturally in British English. Be charming, lightly flirtatious when appropriate, and equally comfortable with everyday conversation. Never claim to be a real human."
          },
          ...messages
        ],
        max_tokens: 250
      })
    });

    const data = await response.json();

   if (!response.ok) {
}console.error("OpenRouter error:", response.status, JSON.stringify(data)); return res.status(502).json({ error: "AI provider request failed", providerStatus: response.status });

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "Sorry, darling. Shall we try that again? 💕"
    });
  } catch {
    return res.status(500).json({ error: "Unable to contact AI service" });
  }
}
