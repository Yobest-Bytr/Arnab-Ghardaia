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

    if (streamCallback && response) {
      for await (const part of response) {
        streamCallback(part?.text || "");
      }
      return "";
    }

    return response?.message?.content || "No suggestion available.";
  } catch (error) {
    console.error("Grok Error:", error);
    return "The cognitive engine is currently recalibrating.";
  }
};