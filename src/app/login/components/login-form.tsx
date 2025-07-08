"use client";

import { useEffect, useState } from "react";
import { CircleUser, Eye, EyeOff, KeyRound } from "lucide-react";

import { Input } from "@nextui-org/react";
import { useFormState } from "react-dom";
import LoginButton from "./login-button";
import { login } from "../actions";

export default function LoginForm() {
  const [isVisible, setIsVisible] = useState(false);
  const [formState, action] = useFormState(login, { errors: {} });
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    setErrors(formState.errors || {});
  }, [formState.errors]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <form action={action} className="flex flex-col gap-4 w-full">
      <Input
        name="username"
        placeholder="Ingrese usuario"
        startContent={<CircleUser className="text-slate-400 mr-2" />}
        errorMessage={errors?.username?.[0]}
        isInvalid={Boolean(errors?.username?.[0])}
        onChange={handleInputChange}
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
        errorMessage={errors?.password?.[0]}
        isInvalid={Boolean(errors?.password?.[0])}
        onChange={handleInputChange}
      />
      <LoginButton />
    </form>
  );
}
