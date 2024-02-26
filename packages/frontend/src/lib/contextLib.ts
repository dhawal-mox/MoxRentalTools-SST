import { createContext, useContext } from "react";
import { UserType } from "../types/user";

export interface AppContextType {
  isAuthenticated: boolean;
  userHasAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
}

export const AppContext = createContext<AppContextType>({
  isAuthenticated: false,
  userHasAuthenticated: useAppContext,
  user: {},
  setUser: useAppContext
});

export function useAppContext() {
  return useContext(AppContext);
}