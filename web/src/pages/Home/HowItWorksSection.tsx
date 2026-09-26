import { useState } from "react";
import { Link } from "react-router-dom";
import TrooperRunning from "../../assets/trooper-running.png";
import Card from "../../components/Card";
import ScrollCue from "../../components/ScrollCue";
import { ArrowRightIcon } from "../../components/icons";
import { useAuth } from "../../auth/AuthContext";
import { cn } from "../../lib/cn";

type Step = {
  title: string;
  body: string;
  link?: { label: string; to: string };
  soon?: string;
};

export default function HowItWorksSection() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);

  const steps: Step[] = [
    {
      title: "Register",
      body: "Create your BigTrooper account and choose how you want to be reached, whether by text or email. Setting your preferences up front means that when something does come up, the alert reaches you exactly where you'll see it.",
      link: user
        ? { label: "You're all set", to: "/account" }
        : { label: "Create an account", to: "/register" },
    },
    {
      title: "Add pets",
      body: "Tell us about your pet. Add their name, a photo, and anything a kind stranger might need to know. Everything you add here is what shows up the moment their tag gets scanned.",
      link: { label: "Add a pet", to: "/pets/new" },
    },
    {
      title: "Print tag",
      body: "Download the 3D model for your tag and bring it to life. Print it at home if you've got a 3D printer, or send the file to an online print service. Either way, you'll have a tag ready to clip onto your pet's collar in a day or two.",
      soon: "Printing guide coming soon",
    },
    {
      title: "Get notified",
      body: "Pets wander. It happens to the best of them. When yours does, the person who finds them only needs to scan the tag. You'll get notified the moment it's scanned, with their location and a way to get in touch.",
      link: { label: "Notification settings", to: "/account" },
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative flex h-[calc(100dvh-var(--header-h))] w-full snap-start flex-col bg-trooper-tan"
    >
      <div className="no-scrollbar mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-y-auto px-4 pb-20 pt-10 md:px-8 tall:pt-16">
        {/* Auto margins center the content when the running-dog art is hidden;
            when it shows, it grows to fill the space instead. */}
        <h2 className="mt-auto text-center text-4xl text-trooper-black md:text-5xl">
          How It Works
        </h2>

        <div className="mb-auto">
          {/* A swipeable row keeps the panel to one screen; wide screens get a grid. */}
          <ol
            onScroll={(e) => {
              const el = e.currentTarget;
              const card = el.firstElementChild as HTMLElement | null;
              if (card) setActiveStep(Math.round(el.scrollLeft / (card.offsetWidth + 16)));
            }}
            className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 md:-mx-8 md:px-8 xl:mx-0 xl:grid xl:grid-cols-4 xl:gap-5 xl:overflow-visible xl:px-0 tall:mt-10"
          >
            {steps.map((step, i) => (
              <li key={step.title} className="w-[85%] shrink-0 snap-center sm:w-[46%] lg:w-[31%] xl:w-auto">
                <Card tone="dark" className="flex h-full flex-col gap-4 border-0 p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-trooper-amber text-lg font-extrabold text-cream">
                      {i + 1}
                    </span>
                    <h3 className="text-2xl text-cream">{step.title}</h3>
                  </div>
                  <p className="text-[15px] leading-relaxed text-cream/75">{step.body}</p>
                  <div className="mt-auto pt-1">
                    {step.link ? (
                      <Link
                        to={step.link.to}
                        className="focus-ring group inline-flex items-center gap-1.5 rounded-md text-sm font-bold text-trooper-tan hover:text-cream"
                      >
                        {step.link.label}
                        <ArrowRightIcon
                          width={16}
                          height={16}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-cream/40">{step.soon}</span>
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ol>

          <div className="mt-4 flex justify-center gap-2 xl:hidden" aria-hidden="true">
            {steps.map((step, i) => (
              <span
                key={step.title}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === activeStep ? "w-5 bg-trooper-black" : "w-1.5 bg-trooper-black/25",
                )}
              />
            ))}
          </div>
        </div>

        <div className="hidden flex-1 items-end justify-center pt-6 md:tall:flex">
          <img
            src={TrooperRunning}
            alt="Trooper running"
            className="max-h-[26vh] w-auto object-contain"
          />
        </div>
      </div>

      <ScrollCue label="Trooper's Story" target="story" />
    </section>
  );
}
