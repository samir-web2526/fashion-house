import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AuthProvider from "./context/AuthProvider.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import "./style.css";
import router from "./Routes/router";

import App from "./App.jsx";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
    >
      <AuthProvider>
        <ThemeProvider>
          <CartProvider>
            <QueryClientProvider client={queryClient}>
              <App>
                <HelmetProvider>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      borderRadius: "10px",
                      background: "#1a1a1a",
                      color: "#fff",
                    },
                    success: {
                      iconTheme: {
                        primary: "#fff",
                        secondary: "#1a1a1a",
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: "#fff",
                        secondary: "#1a1a1a",
                      },
                    },
                  }}
                />

                <div className="max-w-7xl mx-auto">
                  <RouterProvider router={router} />
                </div>

                </HelmetProvider>
              </App>
            </QueryClientProvider>
          </CartProvider>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);