import PageTitle from "@/components/page-title";
import CustomerForm from "../components/customer-form";
import React from "react";

export default function CustomerAddPage() {
  return (
    <section className="flex flex-col justify-between gap-6">
      <PageTitle>Agregar Cliente</PageTitle>
      <CustomerForm />
    </section>
  );
}
