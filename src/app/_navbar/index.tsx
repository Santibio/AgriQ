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
        py-0
        h-16
        min-h-16
        max-h-16
        overflow-x-hidden
      "
    >
      <Tabs
        selectedKey={pathname}
        aria-label="Options"
        variant="underlined"
        className="max-w-xl w-full justify-center"
        color="primary"
        style={{
          height: "100%",
          minHeight: "100%",
          maxHeight: "100%",
          overflowX: "hidden",
        }}
      >
        {config.navItems.map((item) => (
          <Tab
            key={item.link}
            href={item.link}
            className="h-full min-h-full max-h-full"
            title={
              <div className="flex flex-col items-center justify-center gap-0.5 py-0.5 w-full h-full">
                <span className="w-5 h-5 flex items-center justify-center text-base sm:text-sm" style={{ fontSize: "1.1em" }}>
                  {item.icon}
                </span>
                <span className="text-xs sm:text-[10px] truncate">{item.label}</span>
              </div>
            }
          />
        ))}
      </Tabs>
    </nav>
  );
};

export default NavBar;
