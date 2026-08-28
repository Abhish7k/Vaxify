import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/index.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { AuthProvider } from "./auth/AuthContext.tsx";
import { AppErrorBoundary } from "./components/AppErrorBoundary.tsx";
import { queryClient } from "./lib/query-client.ts";
import { warmUpBackend } from "./api/warmup";

warmUpBackend();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  </StrictMode>,
);
