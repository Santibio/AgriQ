import { Button, Link } from "@heroui/react";
import { Plus } from "lucide-react";
import React from "react";

interface AddButtonProps {
  children: React.ReactNode;
  href?: string;
  onPress?: () => void;
}

export default function AddButton({ children, href, onPress }: AddButtonProps) {
  return (
    <Button
      color="primary"
      className="w-full"
      href={href}
      as={Link}
      startContent={<Plus className="h-[20px]" />}
      onPress={onPress}
    >
      {children}
    </Button>
  );
}
