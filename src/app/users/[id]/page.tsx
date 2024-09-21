import PageTitle from "@/components/common/page-title";
import UserForm from "@/app/users/components/user-form";
import db from "@/libs/db";
import { notFound } from "next/navigation";
import React from "react";

interface UserEditPageProps {
  params: {
    id: string;
  };
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const userId = parseInt(params.id);
  console.log("userId: ", userId);

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) return notFound();
  return (
    <section className="pt-6 flex flex-col justify-between gap-6">
      <PageTitle>Editar Usuario</PageTitle>
      <UserForm user={user} />
    </section>
  );
}
