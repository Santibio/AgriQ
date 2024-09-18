"use client";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "../common/theme-switcher";
import BackButton from "./back-button";
import { useEffect, useState } from "react";
import { Sprout } from "lucide-react";

export default function Header() {
  const path = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (path === "/login") return null;
  return (
    <header
      className={`flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-black z-50 transition-shadow ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <BackButton />
      <div className="text-xl font-semibold flex items-center gap-2">
        <Sprout />
        <h1>
          Agro
          <span className="text-primary">Q</span>
        </h1>
      </div>
      <ThemeSwitcher />
    </header>
  );
}
