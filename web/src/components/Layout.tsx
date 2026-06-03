import { Outlet } from "react-router-dom";

interface LayoutProps {
  header: React.ReactNode;
  footer: React.ReactNode;
}

export default function Layout({ header, footer }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      {header}
      <main className="flex-1 overflow-y-auto bg-cream">
        <Outlet />
      </main>
    </div>
  );
}
