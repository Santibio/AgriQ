"use client";

import { useState } from "react";
import { CircleUser, Eye, EyeOff, KeyRound } from "lucide-react";

import { Input } from "@nextui-org/react";
import { useFormState } from "react-dom";
import LoginButton from "./login-button";
import { login } from "../actions";

export default function LoginForm() {
  const [isVisible, setIsVisible] = useState(false);
  const [formState, action] = useFormState(login, { errors: {} });

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <form action={action} className="flex flex-col gap-4 w-full">
      <Input
        name="username"
        placeholder="Ingrese usuario"
        startContent={<CircleUser className="text-slate-400 mr-2" />}
        errorMessage={formState?.errors?.username?.[0]}
        isInvalid={Boolean(formState?.errors?.username?.[0])}
      />
      <Input
        endContent={
          <button
            aria-label="toggle password visibility"
            className="focus:outline-none"
            type="button"
            onClick={toggleVisibility}
          >
            {isVisible ? (
              <Eye className="text-2xl text-default-400 pointer-events-none" />
            ) : (
              <EyeOff className="text-2xl text-default-400 pointer-events-none" />
            )}
          </button>
        }
        name="password"
        placeholder="Ingrese contraseña"
        startContent={<KeyRound className="text-slate-400 mr-2" />}
        type={isVisible ? "text" : "password"}
        errorMessage={formState?.errors?.password?.[0]}
        isInvalid={Boolean(formState?.errors?.password?.[0])}
      />
      <LoginButton />
    </form>
  );
}
