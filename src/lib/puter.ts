/**
 * Utility to interact with Puter AI (Grok 4.1 Fast) or Custom Providers
 */

export const grokChat = async (prompt: string, streamCallback?: (chunk: string) => void) => {
  const userId = localStorage.getItem('supabase.auth.token') ? JSON.parse(localStorage.getItem('supabase.auth.token') || '{}')?.currentSession?.user?.id : null;
  const savedKeys = userId ? JSON.parse(localStorage.getItem(`ai_keys_${userId}`) || '{}') : {};

  // If user has a custom Grok key, we could theoretically use it here with a fetch call to xAI
  // For now, we use Puter as the high-performance default engine
  
  if (!(window as any).puter) {
    console.error("Puter.js not loaded");
    return "AI Engine Offline";
  }

  try {
    const response = await (window as any).puter.ai.chat(
      prompt,
      {
        model: 'x-ai/grok-4.1-fast',
        stream: !!streamCallback,
      }
    );

    if (!response) return "No response from engine.";

    if (streamCallback) {
      if (typeof response[Symbol.asyncIterator] === 'function') {
        for await (const part of response) {
          if (part?.text) streamCallback(part.text);
        }
        return "";
      }
    }

    return response?.message?.content || "No suggestion available.";
  } catch (error: any) {
    console.error("Grok Error:", error);
    return "The cognitive engine is currently offline.";
  }
};