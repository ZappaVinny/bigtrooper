import TrooperStanding from "../../assets/trooper-standing.png";
import Card from "../../components/Card";

export default function FAQSection({
  sectionRef,
  topRef,
}: {
  sectionRef: React.RefObject<HTMLDivElement | null>;
  topRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col h-[calc(100vh-72px)] w-full snap-start"
    >
      <div className="flex flex-col h-full w-full">
        <h1 className="text-[40px] font-bold text-trooper-black text-center mt-12.5">
          FAQ
        </h1>
        <div className="flex flex-row w-full flex-1 items-center justify-center gap-0 px-24">
          <div className="flex flex-col gap-4 pt-6 pb-20 justify-center h-full w-280 shrink-0">
            <Card length="w-full" height="h-[195px]" bgcolor="bg-charcoal">
              <div className="flex flex-col items-center justify-start pt-5 px-8 h-full">
                <h2 className="text-[26px] text-trooper-amber mb-4 text-center">
                  What if I don't own a 3D printer?
                </h2>
                <p className="text-cream text-[16px] text-center leading-relaxed">
                  No printer, no problem. The 3D model file we provide works
                  with any online printing service. Sites like Craftcloud,
                  Shapeways, or JLCPCB will print and ship your tag for a few
                  dollars. If you've got a local library, makerspace, or a
                  friend with a printer, those work too. The file is standard
                  and ready to go.
                </p>
              </div>
            </Card>

            <Card length="w-full" height="h-[195px]" bgcolor="bg-charcoal">
              <div className="flex flex-col items-center justify-start pt-5 px-8 h-full">
                <h2 className="text-[26px] text-trooper-amber mb-4 text-center">
                  What happens when someone scans my pet's tag?
                </h2>
                <p className="text-cream text-[16px] text-center leading-relaxed">
                  The scanner is taken to a simple page with your pet's name,
                  photo, and the contact options you chose when setting up your
                  account. They can reach you with one tap, and you'll get a
                  notification the moment the tag is scanned, including the
                  scanner's general location if their phone shares it. No app
                  download required on either end.
                </p>
              </div>
            </Card>

            <Card length="w-full" height="h-[195px]" bgcolor="bg-charcoal">
              <div className="flex flex-col items-center justify-start pt-5 px-8 h-full">
                <h2 className="text-[26px] text-trooper-amber mb-4 text-center">
                  Is my personal information safe?
                </h2>
                <p className="text-cream text-[16px] text-center leading-relaxed">
                  Your address and full contact details are never shown on the
                  public tag page. A finder only sees what you choose to share,
                  which is typically your pet's name, a photo, and a way to
                  reach you, whether that's a call, text, or email. You stay in
                  control of what's visible, and you can update or hide
                  information from your dashboard anytime.
                </p>
              </div>
            </Card>
          </div>
          <img
            src={TrooperStanding}
            alt="Trooper Standing"
            className="max-h-[75vh] w-auto object-contain shrink-0"
          />
        </div>
      </div>
      <button
        onClick={() => topRef.current?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center text-trooper-black opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        aria-label="Scroll to top"
      >
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
          <polyline points="6 15 12 9 18 15" />
        </svg>
        Back to Top
      </button>
    </section>
  );
}
