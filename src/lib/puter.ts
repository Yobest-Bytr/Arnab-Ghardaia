/**
 * Utility to interact with Puter AI (Grok 4.1 Fast)
 */

export const grokChat = async (prompt: string, streamCallback?: (chunk: string) => void) => {
  if (!(window as any).puter) {
    console.error("Puter.js not loaded");
    return "AI Engine Offline";
  }

  try {
    const response = await (window as any).puter.ai.chat(
      {
        model: 'x-ai/grok-4.1-fast',
        messages: [{ role: 'user', content: prompt }],
        stream: !!streamCallback,
      }
    );

    if (!response) return "No response from engine.";

    if (streamCallback) {
      // Ensure response is iterable before attempting to loop
      if (typeof response[Symbol.asyncIterator] === 'function') {
        for await (const part of response) {
          streamCallback(part?.text || "");
        }
        return "";
      } else if (response.message?.content) {
        streamCallback(response.message.content);
        return response.message.content;
      }
    }

    return response?.message?.content || "No suggestion available.";
  } catch (error: any) {
    console.error("Grok Error:", error);
    // Handle the specific 'map' error which often comes from malformed SDK calls
    if (error.message?.includes('map')) {
      return "The cognitive engine is recalibrating its neural pathways. Please try again.";
    }
    return "The cognitive engine is currently offline.";
  }
};