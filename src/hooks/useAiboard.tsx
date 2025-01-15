import { AvailableAction } from "@/app/dashboard/menu/_lib/ai";
import { AiboardContext } from "@/components/AiboardProvider";
import React, { useContext } from "react";

export const useAiboard = () => {
  const context = useContext(AiboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

export const useRegisterAction = (action: AvailableAction) => {
  const { dispatch } = useAiboard();
  React.useEffect(() => {
    dispatch({ type: "REGISTER_ACTION", payload: action });
  }, [action, dispatch]);
};
