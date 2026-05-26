import TrooperRunning from "../../assets/trooper-running.png";
import Card from "../../components/Card";

export default function HowItWorksSection({
  sectionRef,
  nextRef,
}: {
  sectionRef: React.RefObject<HTMLDivElement | null>;
  nextRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col h-[calc(100vh-72px)] w-full snap-start bg-trooper-tan"
    >
      <div className="flex flex-col h-full w-full">
        <h1 className="text-[40px] font-bold text-trooper-black text-center mt-12.5">
          How it Works
        </h1>
        <div className="flex flex-row justify-center items-center gap-25 mt-19">
          {/* Step 1 */}
          <Card>
            <div className="flex flex-col items-center p-2.5 h-full">
              <div className="flex flex-row w-full justify-start align-center items-center gap-2.5 mb-2.5">
                <Card bgcolor="bg-trooper-black" length="w-16" height="h-16">
                  <div className="flex flex-col justify-center items-center h-full w-full">
                    <h1 className="text-[40px] font-bold text-cream leading-none">
                      1
                    </h1>
                  </div>
                </Card>
                <h2 className="text-[32px] text-cream">Register</h2>
              </div>
              <p className="text-center text-cream">
                Create your BigTrooper account and choose how you want to be
                reached, whether by text or email. Setting your preferences up
                front means that when something does come up, the alert reaches
                you exactly where you'll see it.
              </p>
              <div className="w-full mt-auto my-2.5 flex flex-row justify-center">
                <a
                  href="/register"
                  className="text-trooper-tan hover:text-trooper-black transition-colors"
                >
                  <p className="text-[24px] text-trooper-amber font-bold hover:underline">
                    Click to Register
                  </p>
                </a>
              </div>
            </div>
          </Card>

          {/* Step 2 */}
          <Card>
            <div className="flex flex-col items-center p-2.5 h-full">
              <div className="flex flex-row w-full justify-start align-center items-center gap-2.5 mb-2.5">
                <Card bgcolor="bg-trooper-black" length="w-16" height="h-16">
                  <div className="flex flex-col justify-center items-center h-full w-full">
                    <h1 className="text-[40px] font-bold text-cream leading-none">
                      2
                    </h1>
                  </div>
                </Card>
                <h2 className="text-[32px] text-cream">Add Pets</h2>
              </div>
              <p className="text-center text-cream">
                Tell us about your pet. Add their name, a photo, and anything a
                kind stranger might need to know. Everything you add here is
                what shows up the moment their tag gets scanned.
              </p>
              <div className="w-full mt-auto my-2.5 flex flex-row justify-center">
                <a
                  href="#"
                  className="text-trooper-tan hover:text-trooper-black transition-colors"
                >
                  <p className="text-[24px] text-trooper-amber font-bold hover:underline">
                    Click to Add a Pet
                  </p>
                </a>
              </div>
            </div>
          </Card>

          {/* Step 3 */}
          <Card>
            <div className="flex flex-col items-center p-2.5 h-full">
              <div className="flex flex-row w-full justify-start align-center items-center gap-2.5 mb-2.5">
                <Card bgcolor="bg-trooper-black" length="w-16" height="h-16">
                  <div className="flex flex-col justify-center items-center h-full w-full">
                    <h1 className="text-[40px] font-bold text-cream leading-none">
                      3
                    </h1>
                  </div>
                </Card>
                <h2 className="text-[32px] text-cream">Print Tag</h2>
              </div>
              <p className="text-center text-cream">
                Download the 3D model for your tag and bring it to life. Print
                it at home if you've got a 3D printer, or send the file to an
                online print service. Either way, you'll have a tag ready to
                clip onto your pet's collar in a day or two.
              </p>
              <div className="w-full mt-auto my-2.5 flex flex-row justify-center">
                <a
                  href="#"
                  className="text-trooper-tan hover:text-trooper-black transition-colors"
                >
                  <p className="text-[24px] text-trooper-amber font-bold hover:underline">
                    How to Print
                  </p>
                </a>
              </div>
            </div>
          </Card>

          {/* Step 4 */}
          <Card>
            <div className="flex flex-col items-center p-2.5 h-full">
              <div className="flex flex-row w-full justify-start align-center items-center gap-2.5 mb-2.5">
                <Card bgcolor="bg-trooper-black" length="w-16" height="h-16">
                  <div className="flex flex-col justify-center items-center h-full w-full">
                    <h1 className="text-[40px] font-bold text-cream leading-none">
                      4
                    </h1>
                  </div>
                </Card>
                <h2 className="text-[32px] text-cream">Get Notified</h2>
              </div>
              <p className="text-center text-cream">
                Pets wander. It happens to the best of them. When yours does,
                the person who finds them only needs to scan the tag. You'll get
                notified the moment it's scanned, with their location and a way
                to get in touch.
              </p>
              <div className="w-full mt-auto my-2.5 flex flex-row justify-center">
                <a
                  href="#"
                  className="text-trooper-tan hover:text-trooper-black transition-colors"
                >
                  <p className="text-[24px] text-trooper-amber font-bold hover:underline">
                    Notifications
                  </p>
                </a>
              </div>
            </div>
          </Card>
        </div>
        <div className="flex flex-1 justify-center items-end pb-14">
          <img
            src={TrooperRunning}
            alt="Trooper Running"
            className="max-h-[40vh] w-auto object-contain"
          />
        </div>
      </div>
      <button
        onClick={() => nextRef.current?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-0 left-0 right-0 w-full h-28 flex flex-col items-center justify-end pb-6 text-trooper-black opacity-60 hover:opacity-100 transition-opacity cursor-pointer animate-bounce"
        aria-label="Scroll to next section"
      >
        Trooper's Story
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
