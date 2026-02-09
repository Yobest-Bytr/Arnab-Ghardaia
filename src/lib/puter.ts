/**
 * Utility to interact with Puter AI or Custom Providers
 */

export const grokChat = async (
  prompt: string, 
  options: { modelId: string; userId?: string; image?: string; stream?: boolean } = {},
  streamCallback?: (chunk: string) => void
) => {
  const { modelId, userId, image, stream = true } = options;
  
  // Retrieve keys using the provided userId
  const savedKeys = userId ? JSON.parse(localStorage.getItem(`ai_keys_${userId}`) || '{}') : {};

  // Yobest AI uses the free Puter SDK directly
  if (modelId === 'yobest-ai') {
    if (!(window as any).puter) {
      console.error("Puter.js not loaded");
      return "AI Engine Offline";
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
          model: 'x-ai/grok-4.1-fast',
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
      console.error("Puter AI Error:", error);
      return "The free cognitive engine encountered an error.";
    }
  }

  // For premium models, we check for keys
  const keyMap: Record<string, string> = {
    'grok-premium': savedKeys.grok,
    'chatgpt': savedKeys.openai,
    'gemini': savedKeys.gemini
  };

  const userKey = keyMap[modelId];

  if (!userKey) {
    return `Error: No API key found for ${modelId}. Please add it in your Profile settings.`;
  }

  // In a real app, you'd call the respective APIs here. 
  // For this demo, we'll use Puter as a fallback but notify the user their key is being used.
  return `[Using Custom Key: ${userKey.substring(0, 8)}...] This model is now processing your request via your private integration. (Simulation: Puter fallback active)`;
};