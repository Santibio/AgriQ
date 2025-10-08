import { ReactNode, FormEventHandler } from "react";
import { ScrollShadow } from "@nextui-org/react";
import { Button, Form } from "@heroui/react";

interface FormWrapperProps {
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  buttonLabel: string;
  buttonProps?: React.ComponentProps<typeof Button>; // para extender props del botón
  showButton?: boolean;
  showScrollShadow?: boolean;
}

export default function FormWrapper({
  onSubmit,
  children,
  buttonLabel,
  buttonProps,
  showButton = true,
  showScrollShadow = true,
}: FormWrapperProps) {
  return (
    <Form onSubmit={onSubmit} className="flex flex-col justify-between h-[calc(100vh-205px)]">
      {showScrollShadow ? (
        <ScrollShadow className="pb-1 flex-1 w-full">{children}</ScrollShadow>
      ) : (
        children
      )}
      {showButton && (
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
      )}
    </Form>
  );
}
