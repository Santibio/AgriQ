import React from "react";
import { Progress } from "@heroui/react";

export default function Loading() {
  return <Progress size="sm" isIndeterminate aria-label="Loading..." />;
}
