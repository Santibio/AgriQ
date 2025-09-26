"use client";

import { HeroUIProvider } from "@heroui/react";
import { Toaster } from "sonner";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
// import { useRef } from "react";
// import { Provider } from "react-redux";
// import { AppStore, makeStore } from "@/lib/redux/store";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    const router = useRouter();

  // const storeRef = useRef<AppStore>();
  // if (!storeRef.current) {
  //   storeRef.current = makeStore();
  // }
  return (
    // <Provider store={storeRef.current}>
    // </Provider>
    <HeroUIProvider locale="es-ES" navigate={router.push}>
      <NextThemesProvider attribute="class" defaultTheme="light">
        <Toaster position="top-center" richColors />
        {children}
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
