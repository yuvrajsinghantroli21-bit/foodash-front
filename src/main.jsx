import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { WebsiteSettingsProvider } from "./context/WebsiteSettingsContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <CartProvider>
      <WebsiteSettingsProvider>
        <App />
      </WebsiteSettingsProvider>
    </CartProvider>
  </ThemeProvider>,
);
