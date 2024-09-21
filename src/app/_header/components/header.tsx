"use client"

import React, { useEffect, useState } from "react";
import { User } from "@prisma/client";
import BackButton from "./back-button";
import UserMenu from "./user-menu";
import Logo from "./logo";

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
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

  return (
    <header
      className={` max-w-[600px] m-auto flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-black z-50 transition-shadow py-2 px-2 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <BackButton />
      <Logo />
      <UserMenu user={user} />
    </header>
  );
}
