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
  
  const targetModel = modelMapping[modelId] || modelMapping['yobest-ai'];
  
  if (!(window as any).puter) {
    return "AI Engine Offline: Puter.js not loaded. Please refresh the page.";
  }

  try {
    const fullPrompt = systemPrompt 
      ? `${systemPrompt}\n\nUser: ${prompt}`
      : `User: ${prompt}`;

    let content: any = fullPrompt;
    
    // Handle Multi-modal (Images)
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

    const response = await (window as any).puter.ai.chat(content, chatOptions);

    if (streamCallback && stream) {
      if (typeof response[Symbol.asyncIterator] === 'function') {
        for await (const part of response) {
          if (part?.text) {
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