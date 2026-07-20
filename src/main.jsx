import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./themes/ThemeContext.jsx";
import Cozykawaii from "./themes/cozykawaii.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import './index.css';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <Cozykawaii />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
