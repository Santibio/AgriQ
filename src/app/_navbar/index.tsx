"use client";
import config from "@/config";
import React, { useState } from "react";

const NavBar = () => {
  const [activeTab, setActiveTab] = useState("home");
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-white/20 px-4 py-2">
      <div className="flex items-center justify-around gap-1">
        {config.navItems.map((item) => {
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 w-20 ${
                activeTab === item.id
                  ? "text-blue-600 bg-blue-50 scale-110"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default NavBar;
