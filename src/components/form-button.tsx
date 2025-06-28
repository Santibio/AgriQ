import { Button } from "@heroui/react";
import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
};

export default function FormButton({ children }: Props) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" isLoading={pending}>
      {children}
    </Button>
  );
}
