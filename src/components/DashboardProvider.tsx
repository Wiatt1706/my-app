"use client";
import { AvailableAction } from "@/app/dashboard/menu/_lib/ai";
import React, {  createContext, useReducer } from "react";

export interface DashboardState {
  pageInfo: {
    route: string;
    pageId: string;
    description: string;
  };
  query: {
    currentFilters: Record<string, any>;
    filterFields: any[];
  };
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
  };
  tableData: {
    data: any[];
    rowChildren?: (row: any) => any[];
  };
  actions: {
    availableActions: AvailableAction[];
    selectedRows: any[];
  };
}

export interface DashboardAction {
  type:
    | "SET_PAGE_INFO"
    | "SET_QUERY"
    | "SET_PAGINATION"
    | "SET_TABLE_DATA"
    | "REGISTER_ACTION";
  payload: any;
}

const initialState: DashboardState = {
  pageInfo: {
    route: "/",
    pageId: "dashboard",
    description: "",
  },
  query: {
    currentFilters: {},
    filterFields: [],
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
  },
  tableData: {
    data: [],
  },
  actions: {
    availableActions: [],
    selectedRows: [],
  },
};

export const DashboardContext = createContext<{
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
} | null>(null);



export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(
    (state: DashboardState, action: DashboardAction): DashboardState => {
      switch (action.type) {
        case "SET_PAGE_INFO":
          return { ...state, pageInfo: action.payload };
        case "SET_QUERY":
          return { ...state, query: { ...state.query, ...action.payload } };
        case "SET_PAGINATION":
          return {
            ...state,
            pagination: { ...state.pagination, ...action.payload },
          };
        case "SET_TABLE_DATA":
          return {
            ...state,
            tableData: { ...state.tableData, ...action.payload },
          };
        case "REGISTER_ACTION":
          return {
            ...state,
            actions: {
              ...state.actions,
              availableActions: action.payload.availableActions,
            },
          };
        default:
          return state;
      }
    },
    initialState
  );

  return (
    <DashboardContext.Provider value={{ state, dispatch }}>
      {children}
    </DashboardContext.Provider>
  );
};
