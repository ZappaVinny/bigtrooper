import TrooperCollage from "../../assets/trooper-collage.png";

export default function StorySection({
  sectionRef,
  nextRef,
}: {
  sectionRef: React.RefObject<HTMLDivElement | null>;
  nextRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <section
      ref={sectionRef}
      className="relative h-[calc(100vh-72px)] snap-start bg-trooper-black"
    >
      <div className="flex flex-col h-full w-full overflow-hidden">
        <h1 className="text-[40px] font-bold text-cream text-center mt-12 shrink-0">
          About Trooper
        </h1>
        <div className="flex flex-row flex-1 gap-12 pl-36 pr-36 py-6 overflow-hidden items-start">
          <div className="flex-1 overflow-y-auto text-center text-cream text-[16px] leading-relaxed flex flex-col gap-4 pr-3">
            <p>
              I have grown up with pets my whole life. When I was young, it was
              cats, then dogs were thrown into the mix, and eventually a random
              assortment of other furry, and some not so furry, friends.
              Therefore, it is not surprising that I have a deep love for pets
              of all kinds. My family fostered many dogs during my adolescence,
              quite unsuccessfully, I might add. It seemed that every new foster
              turned into a new pet not long after. So, as a young man living on
              my own for the first time, I decided to throw my hand into the
              ring and start fostering a doggo of my own.
            </p>
            <p>
              I met Trooper for the first time as I was glancing at a card
              posted on the wall next to a kennel filled with four dogs. The
              card had a picture of a dog who I would soon come to learn was
              Trooper. Next to the low-quality photo was a date and the dreadful
              words under it: "Scheduled for Euthanasia." I glanced down at my
              phone to make sure, as the sobering realization hit that the date
              written on the card was the following day. With that, I looked into
              the kennel and immediately saw him. He was staring back at me with
              his signature amber eyes and a look of defeat on his face. I knew
              at that moment I had to meet him.
            </p>
            <p>
              From the moment I took him out of the kennel, his curiosity was on
              full display. His nose drove him down paths of discovery as I
              slowly guided the headstrong pupper to the outside visiting area.
              The instant he was in the pen, I took off his leash, and he got
              straight to business. It was only after a thorough sweep of the
              perimeter that he came up to me and sat patiently, looking for
              some pets. If his amber stare drew me in, then this sealed the
              deal. That day, I confirmed my intent to foster him and prevented
              the contents of the card posted next to his kennel from becoming a
              reality.
            </p>
            <p>
              Later that week, I went to pick up my new, and seemingly
              temporary, companion. They asked me if I wanted to change his
              name, as "Trooper" was given to him by the animal shelter upon his
              arrival. I asked, "Why did they name him Trooper?" The woman
              smiled and said, "I am glad you asked, because I happen to know
              the answer. We called him Trooper because when he came in, he was
              full of fleas and other parasites. Safe to say, he was in bad
              shape, but despite all of that, he had his tail wagging and kindly
              let the doctors get him all better without a hint of aggression. He
              was a real Trooper!" Although I want to believe he was a strong and
              humble little guy, it turns out it was more likely that he was
              just scared shitless.
            </p>
            <p>
              Trooper was quite shy at first, but not too long after, his
              personality really became clear. He was a cuddle bug. Well, if a
              cuddle bug was armed with four forks used to cause chaos. He would
              wake me up in the middle of the night by literally slapping me in
              the face, and then, after rudely awakening me, would cuddle up on
              my pillow, taking 70% and leaving a thoughtful 30% for me! Despite
              his midnight escapades, every day when I came home from work, he
              would be so happy to see me. Tail wagging, excited howls, the
              whole nine yards. I soon got over the pillow thievery and
              compromised for the Saturday morning cuddle sessions. And within a
              few months, I knew I would be following the family tradition. Sure
              enough, three months after first meeting him, I adopted him.
              Trooper was now officially my furry friend and loyal companion,
              when he wanted to be.
            </p>
            <p>
              Flash forward two years, and I had just conceived the idea for
              this site. The concept is certainly not new, but what really drove
              me to make this site was making sure it was accessible. Everyone
              who has the distinct pleasure of owning a furry friend knows how
              scary it can be when faced with the possibility of losing them. The
              goal of this site is to provide an easier and cheaper way to
              ensure they can get their pet back home. After all, sometimes the
              best pets are also the most curious ones, and they deserve a way
              back.
            </p>
            <p>So, on behalf of Trooper and myself, thank you!</p>
          </div>
          <div className="shrink-0">
            <img
              src={TrooperCollage}
              alt="Trooper collage"
              className="max-h-[70vh] max-w-125 w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      </div>
      <button
        onClick={() => nextRef.current?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-0 left-0 right-0 w-full h-28 flex flex-col items-center justify-end pb-6 text-cream opacity-60 hover:opacity-100 transition-opacity cursor-pointer animate-bounce"
        aria-label="Scroll to next section"
      >
        FAQ
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
