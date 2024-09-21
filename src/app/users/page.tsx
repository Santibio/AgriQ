import db from "@/libs/db";
import { Plus } from "lucide-react";
import { Button, Link } from "@nextui-org/react";
import PageTitle from "@/components/common/page-title";
import paths from "@/libs/paths";
import UserList from "./components/users-list";

export default async function UsersPage() {
  const users = await db.user.findMany();
  return (
    <section className="flex flex-col justify-between gap-6">
      <PageTitle>Lista de usuarios</PageTitle>
      <UserList users={users} />
      <Button
        color="primary"
        className="w-full"
        href={paths.userAdd()}
        as={Link}
        startContent={<Plus className="h-[20px]" />}
      >
        Agregar usuario
      </Button>
    </section>
  );
}
