"use client";
import { AvailableAction } from "@/app/dashboard/menu/_lib/ai";
import React, { createContext, useReducer } from "react";

export interface AiboardState {
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
  selectedRow: any | null; // Add selectedRow to the state
  isVisible: boolean;
}

export interface AiboardAction {
  type:
    | "SET_PAGE_INFO"
    | "SET_QUERY"
    | "SET_PAGINATION"
    | "SET_TABLE_DATA"
    | "REGISTER_ACTION"
    | "SET_VISIBILITY"
    | "SET_SELECTED_ROW"; // Add SET_SELECTED_ROW type
  payload: any;
}

const initialState: AiboardState = {
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
  selectedRow: null, // Initialize selectedRow
  isVisible: true,
};

export const AiboardContext = createContext<{
  state: AiboardState;
  dispatch: React.Dispatch<AiboardAction>;
} | null>(null);

export const AiboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(
    (state: AiboardState, action: AiboardAction): AiboardState => {
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
        case "SET_VISIBILITY":
          return { ...state, isVisible: action.payload };
        case "SET_SELECTED_ROW": // Handle SET_SELECTED_ROW
          return { ...state, selectedRow: action.payload };
        default:
          return state;
      }
    },
    initialState
  );

  return (
    <AiboardContext.Provider value={{ state, dispatch }}>
      {children}
    </AiboardContext.Provider>
  );
};
