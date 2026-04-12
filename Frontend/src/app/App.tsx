import { RouterProvider } from "react-router";
import { router } from "./routes";
import { useEffect } from "react";
import { AppProvider } from "./contexts/AppContext";

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
