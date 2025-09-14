"use client";
import { ReactNode } from "react";
import PageTitle from "../page-title";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  ScrollShadow,
  useDisclosure,
} from "@heroui/react";
import { ArrowDownWideNarrow } from "lucide-react";

interface ListPageProps {
  children: ReactNode;
  title: string;
  actions?: ReactNode;
}

export default function ListPage({ title, actions, children }: ListPageProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <section className="flex flex-col h-[calc(100vh-150px)] px-4 relative gap-2">
        <div className="flex items-center justify-between">
          <PageTitle>{title}</PageTitle>
          <Button
            isIconOnly
            color="primary"
            size="sm"
            variant="flat"
            onPress={onOpen}
            disabled
          >
            <ArrowDownWideNarrow className="h-4 w-4 " color="blue" />
          </Button>
        </div>
        <ScrollShadow
          className="pb-2 custom-scroll-shadow flex-1"
          hideScrollBar
        >
          {children}
        </ScrollShadow>
        <div>{actions}</div>
      </section>
      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        placement="bottom"
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                Filtros y ordernamiento
              </DrawerHeader>
              <DrawerBody>
                <p>En trabajo...</p>
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
