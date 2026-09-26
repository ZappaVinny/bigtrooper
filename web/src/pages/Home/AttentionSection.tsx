import TrooperSitting from "../../assets/trooper-sitting.png";
import Button from "../../components/Button";
import ScrollCue from "../../components/ScrollCue";
import { PawIcon } from "../../components/icons";
import { useAuth } from "../../auth/AuthContext";

const HIGHLIGHTS = ["No app to download", "Print at home or ship", "Instant scan alerts"];

export default function AttentionSection() {
  const { user } = useAuth();

  return (
    <section
      id="top"
      className="relative flex h-[calc(100dvh-var(--header-h))] w-full snap-start flex-col lg:flex-row"
    >
      <div className="flex h-[24dvh] shrink-0 justify-center pt-3 lg:h-full lg:justify-start lg:pt-0">
        <img
          src={TrooperSitting}
          alt="Trooper sitting"
          className="h-full w-auto object-contain object-bottom"
        />
      </div>

      <div className="no-scrollbar flex min-h-0 flex-1 justify-center overflow-y-auto px-6 pb-20 pt-4 md:px-12 lg:items-center lg:pb-16 lg:pt-0">
        <div className="my-auto flex max-w-xl flex-col items-center gap-4 text-center md:gap-6 lg:items-start lg:text-left">
          <span className="rounded-full bg-trooper-tan/35 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.15em] text-trooper-amber">
            QR pet tags · print your own
          </span>
          <h1 className="text-4xl leading-[1.05] text-trooper-black sm:text-5xl lg:text-6xl">
            For all the Troopers in your life…
          </h1>
          {/* Phones get the heart of the pitch so the panel fits one screen. */}
          <p className="text-base leading-relaxed text-charcoal/80 md:hidden">
            Every tag links to a page with your contact info, so whoever finds
            your buddy can get them home with a single scan — no app to
            download, no account for them to make.
          </p>
          <p className="hidden text-lg leading-relaxed text-charcoal/80 md:block">
            BigTrooper gives you peace of mind for the moments your pet's
            adventure runs a little longer than planned. Every tag links to a
            page with your contact info, so whoever finds your buddy can get
            them home with a single scan — no app to download, no account for
            them to make, no guessing whose dog this is. Because sometimes the
            best pets are also the most curious ones, and they deserve a way
            back.
          </p>
          <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
            <Button
              variant="dark"
              size="lg"
              className="max-md:h-11 max-md:px-5"
              icon={<PawIcon />}
              to={user ? "/pets" : "/register"}
            >
              {user ? "Go to My Pets" : "Get Started"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-trooper-black max-md:h-11 max-md:px-5"
              onClick={() =>
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              How It Works
            </Button>
          </div>
          <ul className="hidden flex-wrap justify-center gap-x-5 gap-y-1 text-sm font-semibold text-charcoal/60 md:flex lg:justify-start">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-trooper-amber" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ScrollCue label="How It Works" target="how-it-works" />
    </section>
  );
}
