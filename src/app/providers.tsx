"use client";

import { NextUIProvider } from "@nextui-org/react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRef } from "react";
import { Provider } from "react-redux";
import { AppStore, makeStore } from "@/libs/redux/store";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  return (
    <Provider store={storeRef.current}>
      <NextUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="light">
          <Toaster position="top-center" />
          {children}
        </NextThemesProvider>
      </NextUIProvider>
    </Provider>
  );
}
