"use client";
import config from "@/config";
import { Tab, Tabs } from "@heroui/react";
import React from "react";
import { usePathname } from "next/navigation";

const NavBar = () => {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav
      className="
        fixed bottom-0 left-0 w-full
        bg-white/40 backdrop-blur-xl
        border-t border-gray-200
        shadow-lg z-50
        flex justify-center
        py-2
      "
    >
      <Tabs
        selectedKey={pathname}
        aria-label="Options"
        variant="underlined"
        className="max-w-xl w-full justify-center"
        color="primary"
      >
        {config.navItems.map((item) => (
          <Tab
            key={item.link}
            href={item.link}
            className="h-auto"
            title={
              <div className="flex flex-col items-center justify-center gap-0.5 py-0.5">
                <span className="w-5 h-5 flex items-center justify-center">
                  {item.icon}
                </span>
                <span className="text-xs">{item.label}</span>
              </div>
            }
          />
        ))}
      </Tabs>
    </nav>
  );
};

export default NavBar;
