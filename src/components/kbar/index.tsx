"use client";
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch,
} from "kbar";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";
import RenderResults from "./render-result";
import useThemeSwitching from "./use-theme-switching";
import {
  SystemMenuWithChildren,
  getNavMenus,
} from "@/app/dashboard/_lib/queries";
import { RenderIcon } from "../icons";

interface KBarProps {
  promises: Promise<[Awaited<ReturnType<typeof getNavMenus>>]>;
  children: React.ReactNode;
}

export default function KBar({ promises, children }: KBarProps) {
  const [{ data }] = React.use(promises);
  const router = useRouter();

  const navItems = [...data.navMainDatas, ...data.projectsDatas];
  const navigateTo = (url: string) => {
    router.push(url);
  };

  // These actions are for the navigation
  const actions = useMemo(() => {
    // Recursive function to generate actions for each item
    const generateActions = (
      navItem: SystemMenuWithChildren,
      parentSection?: string
    ): NonNullable<typeof baseAction>[] => {
      // Base action for items with a valid URL
      const baseAction = navItem.url
        ? {
            id: `${navItem.title.toLowerCase()}Action`,
            name: navItem.title,
            icon: RenderIcon(navItem.icon as string),
            shortcut: navItem.shortcut ?? [],
            keywords: navItem.title.toLowerCase(),
            section: parentSection || "Navigation",
            subtitle: `Go to ${navItem.title}`,
            perform: () => navigateTo(navItem.url as string),
          }
        : null;

      // Recursively generate child actions
      const childActions =
        navItem.children?.flatMap((childItem) =>
          generateActions(childItem, navItem.title)
        ) ?? [];

      // Combine the base action and child actions, filtering out nulls
      return [baseAction, ...childActions].filter(
        (action): action is NonNullable<typeof action> => action !== null
      );
    };

    // Map over top-level items and generate actions for all levels
    return navItems.flatMap((navItem) => generateActions(navItem));
  }, [data]);


  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}

const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className="scrollbar-hide fixed inset-0 z-[99999] bg-black/80  !p-0 backdrop-blur-sm">
          <KBarAnimator className="relative !mt-64 w-full max-w-[600px] !-translate-y-12 overflow-hidden rounded-lg border bg-background text-foreground shadow-lg">
            <div className="bg-background">
              <div className="border-x-0 border-b-2">
                <KBarSearch className="w-full border-none bg-background px-6 py-4 text-lg outline-none focus:outline-none focus:ring-0 focus:ring-offset-0" />
              </div>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
