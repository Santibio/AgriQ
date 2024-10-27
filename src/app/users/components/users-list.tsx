import type { User } from "@prisma/client";
import { Avatar, ScrollShadow } from "@nextui-org/react";
import UserMenu from "./user-menu";
import Link from "next/link";
import paths from "@/libs/paths";

interface UserListProps {
  users: User[];
}

// TODO: Mejorar
type UserRole = "administrator" | "deposit" | "sells";

const roleMap: Record<UserRole, string> = {
  administrator: "Administrador",
  deposit: "Depósito",
  sells: "Ventas",
};

export default function UserList({ users }: UserListProps) {
  return (
    <ScrollShadow className="h-[70dvh]">
      <ul className="flex gap-2 flex-col">
        {users.map((user) => {
          const roleLabel = roleMap[user.role as UserRole] || "Rol desconocido";

          return (
            <li key={user.id}>
              <div className="flex border rounded-md p-1 gap-2 items-center justify-between">
                <Link
                  href={paths.userEdit(user.id.toString())}
                  className=" w-full"
                >
                  <div className="flex gap-4 items-center">
                    <Avatar src={user.avatar} showFallback />
                    <div className="flex flex-col">
                      <h3 className="text-md text-primary font-medium capitalize">
                        {`${user.lastName} ${user.name}`}
                      </h3>
                      <p className="text-slate-500 capitalize">{roleLabel}</p>
                    </div>
                  </div>
                </Link>
                <UserMenu userId={user.id} />
              </div>
            </li>
          );
        })}
      </ul>
    </ScrollShadow>
  );
}
