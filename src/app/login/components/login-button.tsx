"use client";

import { Button } from "@nextui-org/react";
import { useFormStatus } from "react-dom";


export default function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-full mt-4"
      color="primary"
      type="submit"
      variant="solid"
      isDisabled={pending}
      isLoading={pending}
    >
      Ingresar
    </Button>
  );
}
