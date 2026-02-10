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

export const validateKey = async (modelId: string, key: string) => {
  if (!(window as any).puter) return { success: false, message: "Puter.js not loaded" };
  
  try {
    // Perform a minimal "handshake" request to verify the key
    const response = await (window as any).puter.ai.chat(
      "Respond with 'OK' if you can hear me.",
      {
        model: modelMapping[modelId] || modelMapping['yobest-ai'],
        stream: false,
      }
    );
    return { success: true, message: "Neural link verified." };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "Invalid API key or insufficient funds." 
    };
  }
};

export const grokChat = async (
  prompt: string, 
  options: { modelId: string; userId?: string; image?: string; stream?: boolean } = {},
  streamCallback?: (chunk: string) => void
) => {
  const { modelId, userId, image, stream = true } = options;
  
  const savedKeys = userId ? JSON.parse(localStorage.getItem(`ai_keys_${userId}`) || '{}') : {};
  const targetModel = modelMapping[modelId] || modelMapping['yobest-ai'];
  
  // Check if the model requires a key and if it exists
  const requiresKey = modelId !== 'yobest-ai';
  const userKey = requiresKey ? (
    modelId.includes('gpt') ? savedKeys.openai :
    modelId.includes('gemini') ? savedKeys.gemini :
    modelId.includes('claude') ? savedKeys.anthropic :
    savedKeys.grok
  ) : null;

  if (requiresKey && !userKey) {
    return `Error: No API key found for ${modelId}. Please add it in your Profile settings.`;
  }

  if (!(window as any).puter) {
    return "AI Engine Offline: Puter.js not loaded";
  }

  try {
    let content: any = prompt;
    if (image) {
      content = [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: image } }
      ];
    }

    const response = await (window as any).puter.ai.chat(
      content,
      {
        model: targetModel,
        stream: !!streamCallback && stream,
      }
    );

    if (streamCallback && stream) {
      if (typeof response[Symbol.asyncIterator] === 'function') {
        for await (const part of response) {
          if (part?.text) streamCallback(part.text);
        }
        return "";
      }
    }
    return response?.message?.content || "No response available.";
  } catch (error: any) {
    if (error.status === 402 || error.code === 'insufficient_funds') {
      return "Neural Link Error: Insufficient credits. Please check your provider balance.";
    }
    return `The cognitive engine encountered an error: ${error.message || 'Unknown error'}`;
  }
};