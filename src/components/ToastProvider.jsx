import * as Toast from "@radix-ui/react-toast";
import { createContext, useContext, useState } from "react";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export default function ToastProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success"); // "success" | "error"

  const showToast = (msg, t = "success") => {
    setMessage(msg);
    setType(t);
    setOpen(true);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast.Provider swipeDirection="right">
        {children}
        <Toast.Root
          open={open}
          onOpenChange={setOpen}
          className={`fixed bottom-4 right-4 w-80 rounded-md px-4 py-3 shadow-lg border 
            ${type === "success" ? "bg-green-600 text-white border-green-700" : "bg-red-600 text-white border-red-700"}
          `}
        >
          <Toast.Title className="font-medium">{message}</Toast.Title>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-0 right-0 flex flex-col p-4 gap-2 w-[400px] max-w-[100vw] m-0 list-none z-[2147483647]" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
