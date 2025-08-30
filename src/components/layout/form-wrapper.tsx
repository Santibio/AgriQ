import { ReactNode, FormEventHandler } from "react";
import { ScrollShadow } from "@nextui-org/react";
import { Button, Form } from "@heroui/react";

interface FormWrapperProps {
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  buttonLabel: string;
  buttonProps?: React.ComponentProps<typeof Button>; // para extender props del botón
}

export default function FormWrapper({
  onSubmit,
  children,
  buttonLabel,
  buttonProps,
}: FormWrapperProps) {
  return (
    <Form onSubmit={onSubmit} className="flex flex-col h-[76dvh]">
      <ScrollShadow className="pb-1 custom-scroll-shadow flex-1">
        {children}
      </ScrollShadow>
      <div className="pb-2 w-full">
        <Button
          variant="ghost"
          type="submit"
          className="mt-auto w-full"
          color="primary"
          {...buttonProps}
        >
          {buttonLabel}
        </Button>
      </div>
    </Form>
  );
}
