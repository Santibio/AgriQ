import NavbarItemsList from "@/components/navbar-items-list";
import QuickActions from "@/components/quick-actions";
import RecentMovements from "@/components/recent-movements";
import StatsCards from "@/components/stats-cards";
import WelcomeBanner from "@/components/welcom-banner";
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
    <section className="pb-20 px-4 space-y-6 bg-slate-50 pt-4">
      <WelcomeBanner name={user.name} />
      <StatsCards />
      <QuickActions />
      <RecentMovements />
    </section>
  );
}
