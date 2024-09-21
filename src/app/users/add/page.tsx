import PageTitle from "@/components/common/page-title";
import UserForm from "@/app/users/components/user-form";
import React from "react";

export default function UserEditPage() {
  return (
    <section className="flex flex-col justify-between gap-6">
      <PageTitle>Agregar Usuario</PageTitle>
      <UserForm />
    </section>
  );
}
