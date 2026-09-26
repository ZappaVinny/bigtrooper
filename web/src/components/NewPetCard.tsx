import { Link } from "react-router-dom";
import { PlusIcon } from "./icons";

export default function NewPetCard() {
  return (
    <Link
      to="/pets/new"
      className="focus-ring group flex h-full min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-trooper-black/15 bg-cream-50/40 p-6 text-charcoal/60 transition-colors hover:border-trooper-amber/60 hover:bg-trooper-amber/5 hover:text-trooper-amber"
    >
      <span className="grid h-12 w-12 place-items-center rounded-full bg-trooper-tan/30 transition-colors group-hover:bg-trooper-amber/15">
        <PlusIcon width={22} height={22} />
      </span>
      <span className="text-sm font-bold">Add a pet</span>
    </Link>
  );
}
