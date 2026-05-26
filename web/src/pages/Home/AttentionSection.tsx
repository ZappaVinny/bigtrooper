import TrooperSitting from "../../assets/trooper-sitting.png";
import ButtonPrimary from "../../components/ButtonPrimary";

export default function AttentionSection({
  sectionRef,
  nextRef,
}: {
  sectionRef: React.RefObject<HTMLDivElement | null>;
  nextRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col h-[calc(100vh-72px)] w-full snap-start"
    >
      <div className="flex flex-row h-full w-full">
        <div className="flex shrink-0 h-full">
          <img
            src={TrooperSitting}
            alt="Trooper Sitting"
            className="h-full w-auto object-contain"
          />
        </div>
        <div className="flex flex-col flex-1 justify-center items-center gap-5">
          <h1 className="text-[40px] font-bold text-trooper-black text-center">
            For all the Troopers in your life...
          </h1>
          <p className="max-w-prose text-[24px] text-center">
            BigTrooper gives you peace of mind for the moments your pet's
            adventure runs a little longer than planned. Every tag links to a
            page with your contact info, so whoever finds your buddy can get
            them home with a single scan — no app to download, no account for
            them to make, no guessing whose dog this is. Because sometimes the
            best pets are also the most curious ones, and they deserve a way
            back.
          </p>
          <ButtonPrimary
            bgcolor="bg-trooper-black"
            bordercolor="border-trooper-tan"
            length="w-64"
            height="h-12"
            to="/register"
          >
            <div className="text-trooper-tan">Get Started</div>
          </ButtonPrimary>
        </div>
      </div>
      <button
        onClick={() => nextRef.current?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-0 left-0 right-0 w-full h-28 flex flex-col items-center justify-end pb-6 text-trooper-black opacity-60 hover:opacity-100 transition-opacity cursor-pointer animate-bounce"
        aria-label="Scroll to next section"
      >
        How it Works
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </section>
  );
}
