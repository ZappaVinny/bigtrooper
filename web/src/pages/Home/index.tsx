import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AttentionSection from "./AttentionSection";
import HowItWorksSection from "./HowItWorksSection";
import StorySection from "./StorySection";
import FAQSection from "./FAQSection";

export default function Home() {
  const { hash, key } = useLocation();

  // Links like /#faq jump to that panel, and the logo (plain "/") returns to
  // the top. Keyed on location.key so clicking the same link again still
  // scrolls, even though the URL hasn't changed.
  useEffect(() => {
    document
      .getElementById(hash ? hash.slice(1) : "top")
      ?.scrollIntoView({ behavior: "smooth" });
  }, [hash, key]);

  return (
    <div className="h-[calc(100dvh-var(--header-h))] overflow-y-scroll snap-y snap-mandatory no-scrollbar">
      <AttentionSection />
      <HowItWorksSection />
      <StorySection />
      <FAQSection />
    </div>
  );
}
