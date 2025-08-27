import { ReactNode } from "react";
import PageTitle from "./page-title";
import { ScrollShadow } from "@heroui/react";

interface PageTitleProps {
  children: ReactNode;
  title: string;
  actions?: ReactNode;
}

export default function ListPage({ title, actions, children }: PageTitleProps) {
  return (
    <section className="flex flex-col gap-6 px-4 relative h-[82dvh]">
      <PageTitle>{title}</PageTitle>
      <ScrollShadow className="pb-1 custom-scroll-shadow flex-1" hideScrollBar>
        {children}
      </ScrollShadow>
      <div className="pb-2">{actions}</div>
    </section>
  );
}
