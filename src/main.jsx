import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css"; // ✅ IMPORTANT: load your global layout + reset + wave css

import App from "./App.jsx";
import ThemeProvider from "./app/providers/ThemeProvider.jsx";
import AuthProvider from "./app/providers/AuthProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
