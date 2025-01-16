import React from "react";
import { AiMessage } from "../../_lib/chatApi";
import { renderAutoFunctionCalls, renderManualFunctionCalls, renderMarkdown } from "./RenderHelpers";

type Props = {
	message: AiMessage;
};

export const AiResponse: React.FC<Props> = ({ message }) => {
	return (
		<div className="inline-block rounded-lg max-w-full text-sm break-words space-y-2">
			{/* Render text or markdown */}
			{renderMarkdown(message.parts[0].text)}

			{/* Render manual function calls */}
			{message.parts[0].manualFunctionCalls &&
				renderManualFunctionCalls(
					message.parts[0].manualFunctionCalls,
					message
				)}

			{/* Render auto function calls */}
			{message.parts[0].autoFunctionCalls &&
				renderAutoFunctionCalls(message.parts[0].autoFunctionCalls)}
		</div>
	);
};
