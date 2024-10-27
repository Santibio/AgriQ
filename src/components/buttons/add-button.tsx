import { Button, Link } from "@nextui-org/react";
import { Plus } from "lucide-react";
import React from "react";

interface AddButtonProps {
  children: React.ReactNode;
  href: string;
}

export default function AddButton({ children, href }: AddButtonProps) {
  return (
    <Button
      color="primary"
      className="w-full"
      href={href}
      as={Link}
      startContent={<Plus className="h-[20px]" />}
    >
      {children}
    </Button>
  );
}
