import { useState } from "react";
import TrooperStanding from "../../assets/trooper-standing.png";
import Card from "../../components/Card";
import ScrollCue from "../../components/ScrollCue";
import { ChevronDownIcon } from "../../components/icons";
import { cn } from "../../lib/cn";

const FAQS = [
  {
    q: "What if I don't own a 3D printer?",
    a: "No printer, no problem. The 3D model file we provide works with any online printing service. Sites like Craftcloud, Shapeways, or JLCPCB will print and ship your tag for a few dollars. If you've got a local library, makerspace, or a friend with a printer, those work too. The file is standard and ready to go.",
  },
  {
    q: "What happens when someone scans my pet's tag?",
    a: "The scanner is taken to a simple page with your pet's name, photo, and the contact options you chose when setting up your account. They can reach you with one tap, and you'll get a notification the moment the tag is scanned, including the scanner's general location if their phone shares it. No app download required on either end.",
  },
  {
    q: "Is my personal information safe?",
    a: "Your address and full contact details are never shown on the public tag page. A finder only sees what you choose to share, which is typically your pet's name, a photo, and a way to reach you, whether that's a call, text, or email. You stay in control of what's visible, and you can update or hide information from your dashboard anytime.",
  },
];

export default function FAQSection() {
  // One answer at a time keeps the panel to one screen; tall desktops show all.
  const [open, setOpen] = useState(0);

  return (
    <section
      id="faq"
      className="relative flex h-[calc(100dvh-var(--header-h))] w-full snap-start flex-col"
    >
      <div className="no-scrollbar mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-y-auto px-4 pb-16 pt-10 md:px-8 tall:pb-24 tall:pt-16">
        <h2 className="text-center text-4xl text-trooper-black md:text-5xl">
          FAQ
        </h2>

        <div className="mt-6 flex flex-1 items-center justify-center gap-12 tall:mt-10">
          <dl className="flex w-full max-w-3xl flex-col gap-3 md:gap-4">
            {FAQS.map((f, i) => (
              <Card key={f.q} tone="dark" className="border-0 p-5 md:p-7">
                <dt>
                  <button
                    type="button"
                    onClick={() => setOpen(i)}
                    aria-expanded={open === i}
                    className="focus-ring flex w-full items-center justify-between gap-3 rounded-md text-left font-display text-lg text-trooper-tan cursor-pointer md:text-2xl md:tall:pointer-events-none"
                  >
                    {f.q}
                    <ChevronDownIcon
                      className={cn("shrink-0 text-cream/50 transition-transform md:tall:hidden", open === i && "rotate-180")}
                    />
                  </button>
                </dt>
                <dd
                  className={cn(
                    "mt-2 text-sm leading-relaxed text-cream/75 md:text-[15px] md:tall:block",
                    open === i ? "block" : "hidden",
                  )}
                >
                  {f.a}
                </dd>
              </Card>
            ))}
          </dl>
          <img
            src={TrooperStanding}
            alt="Trooper standing"
            className="hidden max-h-[65vh] w-auto shrink-0 object-contain lg:block"
          />
        </div>
      </div>

      <ScrollCue label="Back to top" target="top" direction="up" />
    </section>
  );
}
