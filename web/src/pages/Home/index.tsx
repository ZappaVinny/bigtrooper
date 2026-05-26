import { useRef } from "react";
import AttentionSection from "./AttentionSection";
import HowItWorksSection from "./HowItWorksSection";
import StorySection from "./StorySection";
import FAQSection from "./FAQSection";

export default function Home() {
  const panel1Ref = useRef<HTMLDivElement>(null);
  const panel2Ref = useRef<HTMLDivElement>(null);
  const panel3Ref = useRef<HTMLDivElement>(null);
  const panel4Ref = useRef<HTMLDivElement>(null);

  return (
    <main className="h-[calc(100vh-72px)] overflow-y-scroll snap-y snap-mandatory">
      <AttentionSection   sectionRef={panel1Ref} nextRef={panel2Ref} />
      <HowItWorksSection  sectionRef={panel2Ref} nextRef={panel3Ref} />
      <StorySection       sectionRef={panel3Ref} nextRef={panel4Ref} />
      <FAQSection         sectionRef={panel4Ref} topRef={panel1Ref}  />
    </main>
  );
}
