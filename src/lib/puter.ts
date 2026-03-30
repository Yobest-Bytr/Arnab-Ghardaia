/**
 * Utility to interact with Puter AI or Custom Providers
 */

export const modelMapping: Record<string, string> = {
  'yobest-ai': 'x-ai/grok-3-fast',
  'claude-3-5-sonnet': 'anthropic/claude-3-5-sonnet',
  'gpt-4o': 'openai/gpt-4o',
  'gemini-2.0-flash': 'google/gemini-2.0-flash',
  'deepseek-chat': 'deepseek/deepseek-chat'
};

export const grokChat = async (
  prompt: string, 
  options: { modelId?: string; userId?: string; image?: string; stream?: boolean; systemPrompt?: string } = {},
  streamCallback?: (chunk: string) => void
) => {
  const { modelId = 'yobest-ai', userId, image, stream = true, systemPrompt } = options;
  
  const savedKeys = userId ? JSON.parse(localStorage.getItem(`ai_keys_${userId}`) || '{}') : {};
  const targetModel = modelMapping[modelId] || modelMapping['yobest-ai'];
  
  // Check for custom Gemini key if selected
  const isCustomModel = modelId !== 'yobest-ai';
  const userKey = isCustomModel ? (
    modelId.includes('gpt') ? savedKeys.openai :
    modelId.includes('gemini') ? savedKeys.gemini :
    modelId.includes('claude') ? savedKeys.anthropic :
    savedKeys.grok
  ) : null;

  if (!(window as any).puter) {
    return "AI Engine Offline: Puter.js not loaded";
  }

  try {
    const fullPrompt = systemPrompt 
      ? `${systemPrompt}\n\nUser: ${prompt}`
      : `User: ${prompt}`;

    let content: any = fullPrompt;
    if (image) {
      content = [
        { type: 'text', text: fullPrompt },
        { type: 'image_url', image_url: { url: image } }
      ];
    }

    const chatOptions: any = {
      model: targetModel,
      stream: !!streamCallback && stream,
    };

    // If user provided a key, we could theoretically inject it here if the provider supports it,
    // but Puter handles keys via their own dashboard. We simulate the "Neural Link" here.
    const response = await (window as any).puter.ai.chat(content, chatOptions);

    if (streamCallback && stream) {
      let fullText = "";
      if (typeof response[Symbol.asyncIterator] === 'function') {
        for await (const part of response) {
          if (part?.text) {
            fullText += part.text;
            streamCallback(part.text);
          }
        }
        return "";
      }
    }

    return response?.message?.content || "No response available.";
  } catch (error: any) {
    console.error("AI Error:", error);
    return `Cognitive Error: ${error.message || 'Unknown provider error'}`;
  }
};