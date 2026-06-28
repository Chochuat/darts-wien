"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, Suspense } from "react";
import "@/app/_i18n/i18n";
import LocaleProvider from "@/app/_i18n/locale-provider";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#90caf9" },
    secondary: { main: "#f48fb1" },
  },
});

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={null}>
            <LocaleProvider />
          </Suspense>
          {children}
        </QueryClientProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

export default Providers;
