"use client";

import BackButton from "../../app/_header/components/back-button";
import { useEffect, useState } from "react";
import { Sprout } from "lucide-react";
import UserMenu from "../../app/_header/components/user-menu";
import { usePathname } from "next/navigation";
import paths from "@/libs/paths";


export default function Header() {
  const path = usePathname();
  const isLoginPage = path === paths.login();
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

  if (isLoginPage) return null;
    return (
      <header
        className={` max-w-[600px] m-auto flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-black z-50 transition-shadow py-4 px-2 ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        <BackButton />
        <div className="text-xl font-semibold flex items-center gap-2">
          <Sprout />
          <h1>
            Agri
            <span className="text-primary">Q</span>
          </h1>
        </div>
        <UserMenu />
      </header>
    );
}
