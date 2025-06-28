import React from "react";

type Props = {
  text: string;
};

export default function EmptyListMsg({ text }: Props) {
  return (
      <span className="text-default-500 col-span-4">
        {/* TODO: Mejorar estilos */}
      {text}
    </span>
  );
}
