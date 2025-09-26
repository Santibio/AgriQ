import db from "@/lib/db";
import paths from "@/lib/paths";
import UserList from "./components/users-list";
import AddButton from "@/components/buttons/add-button";
import PageSection from "@/components/layout/list-page";

export default async function UsersPage() {
  const users = await db.user.findMany({
    orderBy: [
      {
        active: "desc",
      },
      {
        lastName: "asc",
      },
    ],
  });
  return (
    <PageSection
      title="Usuarios"
      actions={<AddButton href={paths.userAdd()}>Crear usuario</AddButton>}
    >
      <UserList users={users} />
    </PageSection>
  );
}
