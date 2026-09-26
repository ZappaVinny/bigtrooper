import type { ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";

export default function Layout({
  header,
  footer,
}: {
  header: ReactNode;
  footer: ReactNode;
}) {
  // The homepage is a full-height snap scroller, so it has no footer.
  const isHome = useLocation().pathname === "/";

  return (
    <div className="flex min-h-dvh flex-col">
      {header}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isHome && footer}
    </div>
  );
}
