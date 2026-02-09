/**
 * Utility to interact with Puter AI or Custom Providers
 */

export const grokChat = async (
  prompt: string, 
  options: { model?: string; image?: string; stream?: boolean } = {},
  streamCallback?: (chunk: string) => void
) => {
  if (!(window as any).puter) {
    console.error("Puter.js not loaded");
    return "AI Engine Offline";
  }

  const { model = 'x-ai/grok-4.1-fast', image, stream = true } = options;

  try {
    // Prepare the message content
    let content: any = prompt;
    
    // If there's an image and the model likely supports it, we format accordingly
    // Note: Puter's SDK handles multimodal inputs via the chat interface
    if (image) {
      content = [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: image } }
      ];
    }

    const response = await (window as any).puter.ai.chat(
      content,
      {
        model: model,
        stream: !!streamCallback && stream,
      }
    );

    if (!response) return "No response from engine.";

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
    return "The cognitive engine encountered an error. Check your connection or API limits.";
  }
};