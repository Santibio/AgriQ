"use client";
import { ReactNode } from "react";
import PageTitle from "../page-title";

interface FormPageProps {
  children: ReactNode;
  title: string;
}

export default function FormPage({ title, children }: FormPageProps) {
  return (
    <section className="flex flex-col gap-6 px-4 relative">
        <PageTitle>{title}</PageTitle>
        {children}
    </section>
  );
}
