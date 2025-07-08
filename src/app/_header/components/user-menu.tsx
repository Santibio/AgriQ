import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { useTheme } from "next-themes";
import { LogOut, Moon, Sun } from "lucide-react";
import { logout } from "@/app/login/actions";
import { User } from "@prisma/client";
import { toast } from "sonner";
import CustomAvatar from "@/components/custom-avatar";

interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
  const { theme, setTheme } = useTheme();

  const logoutHandler = async () => {
    try {
      await logout();
    } catch(error) {
      console.log("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
    }
  };
  const handleSwitchTheme = () =>
    setTheme(theme === "light" ? "dark" : "light");

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          variant="light"
          className="rounded-full p-0 border-none transition-transform w-[45px] h-[45px]"
          isIconOnly
        >
          <CustomAvatar src={user.avatar} alt={user.username} size={45} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem key="profile" className="h-14 gap-2">
          <p className="font-semibold">Ingreso con</p>
          <p className="font-semibold text-primary">{user.username}</p>
        </DropdownItem>
        <DropdownItem
          key="theme_switcher"
          color="primary"
          onClick={handleSwitchTheme}
          startContent={
            theme === "light" ? (
              <Moon className="size-4" />
            ) : (
              <Sun className="size-4" />
            )
          }
        >
          {` Cambiar a tema ${theme === "light" ? "oscuro" : "claro"}`}
        </DropdownItem>
        <DropdownItem
          key="logout"
          color="danger"
          onClick={logoutHandler}
          startContent={<LogOut className="size-4" />}
        >
          Log Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
