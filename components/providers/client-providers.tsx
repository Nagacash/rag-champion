"use client";

import * as React from "react";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      {children}
    </ClerkProvider>
  );
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ClerkProviderWrapper>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          enableColorScheme
        >
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster richColors closeButton position="top-right" />
          </QueryClientProvider>
        </ThemeProvider>
      </ClerkProviderWrapper>
    </Suspense>
  );
}

