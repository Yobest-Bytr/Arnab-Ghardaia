/**
 * Utility to interact with Puter AI or Custom Providers
 */

export const grokChat = async (
  prompt: string, 
  options: { modelId: string; userId?: string; image?: string; stream?: boolean } = {},
  streamCallback?: (chunk: string) => void
) => {
  const { modelId, userId, image, stream = true } = options;
  
  const savedKeys = userId ? JSON.parse(localStorage.getItem(`ai_keys_${userId}`) || '{}') : {};

  // Updated Model Mapping based on valid Puter registry
  const modelMapping: Record<string, string> = {
    'yobest-ai': 'x-ai/grok-3-fast',
    'grok-premium': 'x-ai/grok-3-fast',
    'chatgpt': 'openai/gpt-4o',
    'gemini': 'google/gemini-2.0-flash'
  };

  const targetModel = modelMapping[modelId] || modelMapping['yobest-ai'];
  const userKey = modelId !== 'yobest-ai' ? (
    modelId === 'chatgpt' ? savedKeys.openai :
    modelId === 'gemini' ? savedKeys.gemini :
    savedKeys.grok
  ) : null;

  if (modelId !== 'yobest-ai' && !userKey) {
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
    console.error("AI Error:", error);
    
    // Handle specific Puter errors
    if (error.status === 402 || error.code === 'insufficient_funds') {
      return "Neural Link Error: Insufficient credits in the Puter AI account. Please check your balance or use a custom API key.";
    }
    
    return "The cognitive engine encountered an error processing your request. Please verify your API keys.";
  }
};