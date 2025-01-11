import { AvailableAction } from "@/app/dashboard/menu/_lib/ai";
import { DashboardContext } from "@/components/DashboardProvider";
import React, { useContext } from "react";

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

export const useRegisterAction = (action: AvailableAction) => {
  const { dispatch } = useDashboard();
  React.useEffect(() => {
    dispatch({ type: "REGISTER_ACTION", payload: action });
  }, [action, dispatch]);
};
