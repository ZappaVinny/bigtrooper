import TrooperSitting from "../assets/trooper-sitting.png";
import ButtonPrimary from "../components/ButtonPrimary";

export default function Home() {
  return (
    <main className="h-[calc(100vh-72px)] overflow-y-scroll snap-y snap-mandatory">
      <section className="h-[calc(100vh-72px)] w-full snap-start">
        <div className="flex flex-row h-full w-full">
          {/* Image side — fixed to its natural width, sits on the left */}
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
      </section>

      <section className="h-[calc(100vh-72px)] snap-start">Panel 2</section>

      <section className="h-[calc(100vh-72px)] snap-start">Panel 3</section>
    </main>
  );
}
