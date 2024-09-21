import React from 'react'
import { Sprout } from "lucide-react";


export default function Logo() {
  return (
    <div className="text-xl font-semibold flex items-center gap-2">
      <Sprout />
      <h1>
        Agri
        <span className="text-primary">Q</span>
      </h1>
    </div>
  );
}
