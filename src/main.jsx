import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      {/* Avisos (toast) para todo el sistema: import { toast } from "sonner" */}
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  </StrictMode>,
);
