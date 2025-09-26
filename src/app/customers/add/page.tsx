import FormPage from "@/components/layout/form-page";
import CustomerForm from "../components/customer-form";
import React from "react";

export default function CustomerAddPage() {
  return (
    <FormPage title="Agregar Cliente">
      <CustomerForm />
    </FormPage>
  );
}
