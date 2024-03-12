import { createContext, useContext } from "react";
import { UserType } from "../types/user";
import { OnboardingStatusType } from "../types/onboardingStatus";

export interface AppContextType {
  isAuthenticated: boolean;
  userHasAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  userOnboardingStatus: OnboardingStatusType;
  setUserOnboardingStatus: React.Dispatch<React.SetStateAction<OnboardingStatusType>>;
}

export const AppContext = createContext<AppContextType>({
  isAuthenticated: false,
  userHasAuthenticated: useAppContext,
  user: {},
  setUser: useAppContext,
  userOnboardingStatus: {},
  setUserOnboardingStatus: useAppContext,
});

export function useAppContext() {
  return useContext(AppContext);
}