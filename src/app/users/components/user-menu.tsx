"use client";
import { deleteUser } from "@/actions/users";
import paths from "@/libs/paths";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { EllipsisVertical, Pencil, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface UserMenuProps {
  userId: number;
}

export default function UserMenu({ userId }: UserMenuProps) {
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
    toast.success("Usuario borrado correctamente");
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly variant="light">
          <EllipsisVertical className="stroke-slate-500 h-[18px]" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu variant="faded" aria-label="Dropdown menu with shortcut">
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
          Borrar
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
