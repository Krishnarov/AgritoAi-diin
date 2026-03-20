import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#1a2e1a",
            color: "#86efac",
            border: "1px solid #166534",
            borderRadius: "12px",
            fontSize: "13px",
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);