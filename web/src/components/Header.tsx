import { useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import Button from "./Button";
import { useAuth } from "../auth/AuthContext";
import { cn } from "../lib/cn";
import { useDismiss } from "../lib/useDismiss";
import {
  ChevronDownIcon,
  CloseIcon,
  DashboardIcon,
  LogOutIcon,
  MenuIcon,
  PawIcon,
  UserIcon,
} from "./icons";

import logo from "../assets/BigTrooperLogo.svg";

// Split around the centered logo: two links on each side.
const LEFT_LINKS = [
  { label: "How It Works", to: "/#how-it-works" },
  { label: "Our Story", to: "/#story" },
];
const RIGHT_LINKS = [
  { label: "FAQ", to: "/#faq" },
  { label: "Articles", to: "/articles" },
];

const navLinkClass =
  "focus-ring rounded-md px-1 py-1 text-sm font-semibold text-cream/70 transition-colors hover:text-cream hover:no-underline";
const activeClass =
  "text-cream underline decoration-trooper-amber decoration-2 underline-offset-8";

// Hash links (/#faq) point at homepage panels, so only real routes get an
// active state; NavLink would otherwise mark every hash link active on "/".
function HeaderLink({ label, to, className }: { label: string; to: string; className?: string }) {
  if (to.includes("#")) {
    return (
      <Link to={to} className={cn(navLinkClass, className)}>
        {label}
      </Link>
    );
  }
  return (
    <NavLink to={to} className={({ isActive }) => cn(navLinkClass, className, isActive && activeClass)}>
      {label}
    </NavLink>
  );
}

function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));

  if (!user) return null;
  const initials =
    `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() ||
    "?";

  const itemClass =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-trooper-black hover:bg-trooper-tan/25 hover:no-underline";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="focus-ring flex items-center gap-1 rounded-full p-0.5 pr-1.5 text-cream/70 transition-colors hover:text-cream cursor-pointer"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-trooper-tan text-sm font-extrabold text-trooper-black">
          {initials}
        </span>
        <ChevronDownIcon
          width={16}
          height={16}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-line bg-cream-50 p-1.5 shadow-menu"
        >
          <div className="px-3 pb-2 pt-1.5">
            <p className="truncate text-sm font-bold text-trooper-black">
              {user.first_name} {user.last_name}
            </p>
            <p className="truncate text-xs text-charcoal/60">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          <Link to="/pets" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
            <PawIcon width={16} height={16} /> My Pets
          </Link>
          <Link to="/account" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
            <UserIcon width={16} height={16} /> Account Settings
          </Link>
          {user.admin && (
            <Link to="/admin" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
              <DashboardIcon width={16} height={16} /> Admin Dashboard
            </Link>
          )}
          <div className="my-1 h-px bg-line" />
          <button
            type="button"
            role="menuitem"
            className={cn(itemClass, "cursor-pointer text-danger")}
            onClick={async () => {
              setOpen(false);
              await logout();
              navigate("/");
            }}
          >
            <LogOutIcon width={16} height={16} /> Log Out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useDismiss(ref, mobileOpen, () => setMobileOpen(false));
  const close = () => setMobileOpen(false);

  return (
    <header
      ref={ref}
      className="sticky top-0 z-40 h-(--header-h) border-b border-cream/10 bg-trooper-black"
    >
      <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 md:gap-4 md:px-6 lg:gap-10">
        {/* Left: menu toggle (mobile) / first half of the section links (desktop) */}
        <div className="flex items-center lg:justify-end">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="focus-ring -ml-2 grid h-10 w-10 place-items-center rounded-full text-cream/80 hover:bg-cream/10 cursor-pointer lg:hidden"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
            {LEFT_LINKS.map((l) => (
              <HeaderLink key={l.to} {...l} />
            ))}
          </nav>
        </div>

        {/* Center: logo */}
        <Link to="/" onClick={close} className="focus-ring rounded-md" aria-label="BigTrooper home">
          <img src={logo} alt="BigTrooper" className="h-7 w-auto md:h-10" />
        </Link>

        {/* Right: second half of the section links (desktop), then auth */}
        <div className="flex items-center justify-end gap-3 md:gap-5 lg:justify-between">
          <nav className="hidden items-center gap-8 lg:flex" aria-label="More">
            {RIGHT_LINKS.map((l) => (
              <HeaderLink key={l.to} {...l} />
            ))}
          </nav>
          <div className={cn("flex items-center gap-3 md:gap-5", loading && "invisible")}>
            {user ? (
              <>
                <HeaderLink label="My Pets" to="/pets" className="hidden sm:inline" />
                <AccountMenu />
              </>
            ) : (
              <>
                <HeaderLink label="Log In" to="/login" className="hidden sm:inline" />
                <Button to="/register" size="sm">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          aria-label="Mobile"
          className="absolute inset-x-0 top-full border-b border-cream/10 bg-trooper-black px-4 pb-5 pt-2 shadow-menu lg:hidden"
        >
          <ul className="flex flex-col">
            {[...LEFT_LINKS, ...RIGHT_LINKS].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={close}
                  className="block rounded-lg px-2 py-3 text-base font-semibold text-cream/80 hover:bg-cream/5 hover:text-cream hover:no-underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {!user && (
              <li className="sm:hidden">
                <Link
                  to="/login"
                  onClick={close}
                  className="block rounded-lg px-2 py-3 text-base font-semibold text-cream/80 hover:bg-cream/5 hover:text-cream hover:no-underline"
                >
                  Log In
                </Link>
              </li>
            )}
            {user && (
              <li className="sm:hidden">
                <Link
                  to="/pets"
                  onClick={close}
                  className="block rounded-lg px-2 py-3 text-base font-semibold text-cream/80 hover:bg-cream/5 hover:text-cream hover:no-underline"
                >
                  My Pets
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
