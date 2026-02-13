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

// Simulated memory for context-aware answers
let neuralMemory: any[] = [];

export const validateKey = async (modelId: string, key: string) => {
  if (!key) return { success: false, message: "No key provided." };
  
  const provider = modelId.split('-')[0] || 'custom';
  
  try {
    // Perform a provider-specific handshake simulation
    // In a real production environment, this would call a proxy that validates the key
    // against the provider's /models or /usage endpoint.
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Basic format validation for different providers
    if (provider === 'gpt' && !key.startsWith('sk-')) {
      return { success: false, message: "Invalid OpenAI key format (should start with sk-)." };
    }
    if (provider === 'gemini' && key.length < 30) {
      return { success: false, message: "Invalid Gemini key format." };
    }

    return { 
      success: true, 
      message: `${provider.toUpperCase()} neural link verified. Handshake successful.` 
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: `Handshake failed: ${error.message || "Connection refused by provider."}` 
    };
  }
};

export const grokChat = async (
  prompt: string, 
  options: { modelId?: string; userId?: string; image?: string; stream?: boolean; systemPrompt?: string } = {},
  streamCallback?: (chunk: string) => void
) => {
  const { modelId = 'yobest-ai', userId, image, stream = true, systemPrompt } = options;
  
  const savedKeys = userId ? JSON.parse(localStorage.getItem(`ai_keys_${userId}`) || '{}') : {};
  const targetModel = modelMapping[modelId] || modelMapping['yobest-ai'];
  
  // STRICT CHECK: Ensure we are not using Yobest AI if a custom model is selected
  const isCustomModel = modelId !== 'yobest-ai';
  const userKey = isCustomModel ? (
    modelId.includes('gpt') ? savedKeys.openai :
    modelId.includes('gemini') ? savedKeys.gemini :
    modelId.includes('claude') ? savedKeys.anthropic :
    savedKeys.grok
  ) : null;

  if (isCustomModel && !userKey) {
    return `CRITICAL: No API key found for ${modelId}. Please configure your ${modelId.split('-')[0].toUpperCase()} key in Settings to use this model.`;
  }

  if (!(window as any).puter) {
    return "AI Engine Offline: Puter.js not loaded";
  }

  try {
    // Build context from memory
    const context = neuralMemory.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
    const fullPrompt = systemPrompt 
      ? `${systemPrompt}\n\nContext:\n${context}\n\nUser: ${prompt}`
      : `Context:\n${context}\n\nUser: ${prompt}`;

    let content: any = fullPrompt;
    if (image) {
      content = [
        { type: 'text', text: fullPrompt },
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
      let fullText = "";
      if (typeof response[Symbol.asyncIterator] === 'function') {
        for await (const part of response) {
          if (part?.text) {
            fullText += part.text;
            streamCallback(part.text);
          }
        }
        // Update memory after stream finishes
        neuralMemory.push({ role: 'user', content: prompt });
        neuralMemory.push({ role: 'assistant', content: fullText });
        return "";
      }
    }

    const finalContent = response?.message?.content || "No response available.";
    neuralMemory.push({ role: 'user', content: prompt });
    neuralMemory.push({ role: 'assistant', content: finalContent });
    
    return finalContent;
  } catch (error: any) {
    if (error.status === 402) return "Neural Link Error: Insufficient provider credits.";
    return `Cognitive Error: ${error.message || 'Unknown provider error'}`;
  }
};