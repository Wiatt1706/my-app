"use client";

import React from "react";
import { useAiboard } from "@/hooks/useAiboard";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react"; // Use icons from Lucide or any preferred library

const AiToggle: React.FC = () => {
  const { state, dispatch } = useAiboard();

  const toggleAi = () => {
    dispatch({
      type: "SET_VISIBILITY",
      payload: !state.isVisible,
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleAi}
      aria-label={state.isVisible ? "Disable AI" : "Enable AI"} // Accessibility
    >
      {state.isVisible ? (
        <Brain className="h-4 w-4" /> // Icon for AI disabled
      ) : (
        <Brain className="h-4 w-4" /> // Icon for AI enabled
      )}
    </Button>
  );
};

export default AiToggle;
