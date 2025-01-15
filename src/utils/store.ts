import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface AppState {
  clearState: () => void;
  hasRedirected: boolean;
  lastState: Record<string, any> | null;
  setRedirected: (status: boolean) => void;
  setLastState: (state: Record<string, any>) => void;
}
const useAppState = create(
  persist<AppState>(
    (set) => ({
      lastState: null,
      hasRedirected: false,
      setRedirected: (status) => set({ hasRedirected: status }),
      clearState: () => set({ lastState: null, hasRedirected: false }),
      setLastState: (state) => set({ lastState: state, hasRedirected: false })
    }),
    { name: "app-state", storage: createJSONStorage(() => AsyncStorage) }
  )
);
export default useAppState;
