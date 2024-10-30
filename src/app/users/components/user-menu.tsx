"use client";
import paths from "@/libs/paths";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { EllipsisVertical, Pencil, Trash, UserRoundCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteUser, activeUser } from "../actions";

interface UserMenuProps {
  userId: number;
  isActive: boolean;
}

export default function UserMenu({ userId, isActive }: UserMenuProps) {
  const router = useRouter();
  const iconClasses =
    "text-xl text-default-500 pointer-events-none flex-shrink-0 h-[18px]";

  const handleGoToEditUser = () => {
    const userEditPage = paths.userEdit(userId.toString());
    router.push(userEditPage);
  };

  const handleDeleteUser = async () => {
    const response = await deleteUser(userId);
    if (response.error) return toast.error(response.error);
    toast.success("Usuario desactivado correctamente");
  };

  const handleActivateUser = async () => {
    const response = await activeUser(userId);
    if (response.error) return toast.error(response.error);
    toast.success("Usuario activado correctamente");
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly variant="light">
          <EllipsisVertical className="stroke-slate-500 h-[18px]" />
        </Button>
      </DropdownTrigger>
      {isActive ? (
        <DropdownMenu variant="faded">
          <DropdownItem
            key="new"
            startContent={<Pencil className={iconClasses} />}
            onClick={handleGoToEditUser}
          >
            Editar
          </DropdownItem>
          <DropdownItem
            key="delete"
            className="text-danger"
            color="danger"
            startContent={
              <Trash className={`${iconClasses} text-danger stroke-danger`} />
            }
            onClick={handleDeleteUser}
          >
            Desactivar
          </DropdownItem>
        </DropdownMenu>
      ) : (
        <DropdownMenu variant="faded">
          <DropdownItem
            key="delete"
            className="text-success"
            color="success"
            startContent={
              <UserRoundCheck
                className={`${iconClasses} text-success stroke-success`}
              />
            }
            onClick={handleActivateUser}
          >
            Activar
          </DropdownItem>
        </DropdownMenu>
      )}
    </Dropdown>
  );
}
