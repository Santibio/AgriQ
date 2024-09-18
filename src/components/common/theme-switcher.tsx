// app/components/ThemeSwitcher.tsx
"use client";

import { Button } from "@nextui-org/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSwitchTheme = () =>
    setTheme(theme === "light" ? "dark" : "light");

  if (!mounted) return <div className="w-10"/>;

  return (
    <Button onClick={handleSwitchTheme} isIconOnly variant="light">
      {theme === "light" ? <Moon /> : <Sun />}
    </Button>
  );
}
