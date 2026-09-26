import { Link } from "react-router-dom";
import logo from "../assets/BigTrooperLogo.svg";

const LINKS = [
  { label: "How It Works", to: "/#how-it-works" },
  { label: "Our Story", to: "/#story" },
  { label: "FAQ", to: "/#faq" },
  { label: "Articles", to: "/articles" },
];

export default function Footer() {
  return (
    <footer className="bg-trooper-black text-cream/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-10 md:flex-row md:justify-between md:px-8">
        <Link to="/" aria-label="BigTrooper home" className="focus-ring rounded-md">
          <img src={logo} alt="BigTrooper" className="h-7 w-auto opacity-90" />
        </Link>
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="focus-ring rounded-md text-sm font-semibold hover:text-trooper-tan"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs">
          © {new Date().getFullYear()} BigTrooper · Made for Trooper
        </p>
      </div>
    </footer>
  );
}
