import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </ThemeProvider>,
);
