import NavbarItemsList from "@/app/components/navbar-items-list";
import config from "@/config";
import { getCurrentUser } from "@/libs/session";
import { notFound } from "next/navigation";

type Role = keyof typeof config.rolePermissions;

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) return notFound();

  const currentRole = user.role as Role;

  // Si el rol no existe en los permisos, devolvemos un 404
  const currentPermissions = config.rolePermissions[currentRole] || [];

  const itemsWithPermission = config.navItems.map((item) => ({
    ...item,
    hasPermission: currentPermissions.includes(item.id),
  }));

  return (
    <section className="">
      <h1 className="text-3xl font-semibold mb-8">Inicio</h1>
      <NavbarItemsList itemsWithPermission={itemsWithPermission} />
    </section>
  );
}
