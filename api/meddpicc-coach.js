export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ output: "Method not allowed" });
  }

  const { prompt } = req.body || {};

  // Validate input
  if (!prompt) {
    return res.status(400).json({ output: "Missing prompt" });
  }

  try {
    // Call OpenAI
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You are an expert enterprise sales coach using the MEDDPICC framework. Provide clear, tactical, actionable guidance."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    // Extract output safely
    const output =
      data.output_text ||
      data.output?.map?.(x =>
        x?.content?.map?.(c => c?.text).join(" ")
      ).join("\n") ||
      JSON.stringify(data);

    return res.status(200).json({ output });

  } catch (error) {
    return res.status(500).json({
      output: "AI request failed. Check your API key and deployment."
    });
  }
}
