import { create } from "zustand";

export const useAlertStore = create((set) => ({
  message: "",
  visible: false,

  showAlert: (message) => {
    console.log("Zustand alertStore: Triggering alert message:", message);

    set({
      message,
      visible: true,
    });

    setTimeout(() => {
      set({ visible: false });
    }, 3000);
  },
}));