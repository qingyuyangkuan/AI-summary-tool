exports.handler = async function (event, context) {
  // 只允许 POST 请求
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { content } = JSON.parse(event.body || "{}");

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "请提供有效的文章内容" }),
      };
    }

    // 从环境变量读取 API Key（在 Netlify 后台配置）
    const apiKey = process.env.OPENAI_API_KEY;
    const apiBase = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "服务器未配置 API Key" }),
      };
    }

    const response = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content:
              "你是一个专业的文章总结助手。请用简洁、清晰的中文对用户提供的文章进行总结，提取核心观点、关键信息和主要结论。总结应结构清晰，突出重点，适合快速阅读。",
          },
          {
            role: "user",
            content: `请总结以下文章：\n\n${content}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("API Error:", data);
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: data.error?.message || "调用 AI 接口失败",
        }),
      };
    }

    const summary = data.choices?.[0]?.message?.content?.trim() || "未能生成总结";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ summary }),
    };
  } catch (error) {
    console.error("Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "服务器内部错误，请稍后重试" }),
    };
  }
};
