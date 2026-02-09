/**
 * Utility to interact with Puter AI (Grok 4.1 Fast)
 * Based on: https://developer.puter.com/tutorials/free-unlimited-grok-api/
 */

export const grokChat = async (prompt: string, streamCallback?: (chunk: string) => void) => {
  if (!(window as any).puter) {
    console.error("Puter.js not loaded");
    return "AI Engine Offline";
  }

  try {
    // Using the exact signature from Puter documentation
    const response = await (window as any).puter.ai.chat(
      prompt,
      {
        model: 'x-ai/grok-4.1-fast',
        stream: !!streamCallback,
      }
    );

    if (!response) return "No response from engine.";

    if (streamCallback) {
      // Handle streaming response as an async iterator
      try {
        for await (const part of response) {
          if (part?.text) {
            streamCallback(part.text);
          }
        }
        return "";
      } catch (streamError) {
        // Fallback if response is not an iterator but contains content
        if (response.message?.content) {
          streamCallback(response.message.content);
          return response.message.content;
        }
        throw streamError;
      }
    }

    // Handle non-streaming response
    return response?.message?.content || "No suggestion available.";
  } catch (error: any) {
    console.error("Grok Error:", error);
    
    // Specific handling for the 'map' error or recalibration
    if (error.message?.includes('map') || error.message?.includes('undefined')) {
      return "The cognitive engine is recalibrating. Please try again in a moment.";
    }
    
    return "The cognitive engine is currently offline.";
  }
};