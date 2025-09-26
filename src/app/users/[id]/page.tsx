import PageTitle from "@/components/page-title";
import UserForm from "@/app/users/components/user-form";
import db from "@/lib/db";
import { notFound } from "next/navigation";

interface UserEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserEditPage(props: UserEditPageProps) {
  const params = await props.params;
  const userId = parseInt(params.id);

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) return notFound();

  return (
    <section className="flex flex-col justify-between gap-6">
      <PageTitle>Editar Usuario</PageTitle>
      <UserForm user={user} />
    </section>
  );
}
