export type AiMessage = {
    role: "user" | "model";
    parts: { text: string }[];
};

export const callChatAPI = async (
    history: AiMessage[],
    text: string
): Promise<AiMessage> => {
    const response = await fetch("/api/ai/generateChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, text }),
    });

    if (!response.ok) {
        throw new Error("Failed to call chat API");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullResponse = "";
    const modelMessage: AiMessage = { role: "model", parts: [{ text: "" }] };

    while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        fullResponse += decoder.decode(value, { stream: true });
    }

    modelMessage.parts[0].text = fullResponse;
    return modelMessage;
};
