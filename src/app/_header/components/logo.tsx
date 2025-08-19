import React from "react";
import { Sprout } from "lucide-react";
import { Link } from "@heroui/react";

export default function Logo() {
  return (
    <Link href="/" color="foreground">
      <div className="text-xl font-semibold flex items-center">
        <Sprout />
        <h1>
          Agri
          <span className="text-primary">Q</span>
        </h1>
      </div>
    </Link>
  );
}
