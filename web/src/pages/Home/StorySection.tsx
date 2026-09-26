import TrooperCollage from "../../assets/trooper-collage.png";
import ScrollCue from "../../components/ScrollCue";

const STORY = [
  "I have grown up with pets my whole life. When I was young, it was cats, then dogs were thrown into the mix, and eventually a random assortment of other furry, and some not so furry, friends. Therefore, it is not surprising that I have a deep love for pets of all kinds. My family fostered many dogs during my adolescence, quite unsuccessfully, I might add. It seemed that every new foster turned into a new pet not long after. So, as a young man living on my own for the first time, I decided to throw my hand into the ring and start fostering a doggo of my own.",
  "I met Trooper for the first time as I was glancing at a card posted on the wall next to a kennel filled with four dogs. The card had a picture of a dog who I would soon come to learn was Trooper. Next to the low-quality photo was a date and the dreadful words under it: \"Scheduled for Euthanasia.\" I glanced down at my phone to make sure, as the sobering realization hit that the date written on the card was the following day. With that, I looked into the kennel and immediately saw him. He was staring back at me with his signature amber eyes and a look of defeat on his face. I knew at that moment I had to meet him.",
  "From the moment I took him out of the kennel, his curiosity was on full display. His nose drove him down paths of discovery as I slowly guided the headstrong pupper to the outside visiting area. The instant he was in the pen, I took off his leash, and he got straight to business. It was only after a thorough sweep of the perimeter that he came up to me and sat patiently, looking for some pets. If his amber stare drew me in, then this sealed the deal. That day, I confirmed my intent to foster him and prevented the contents of the card posted next to his kennel from becoming a reality.",
  "Later that week, I went to pick up my new, and seemingly temporary, companion. They asked me if I wanted to change his name, as \"Trooper\" was given to him by the animal shelter upon his arrival. I asked, \"Why did they name him Trooper?\" The woman smiled and said, \"I am glad you asked, because I happen to know the answer. We called him Trooper because when he came in, he was full of fleas and other parasites. Safe to say, he was in bad shape, but despite all of that, he had his tail wagging and kindly let the doctors get him all better without a hint of aggression. He was a real Trooper!\" Although I want to believe he was a strong and humble little guy, it turns out it was more likely that he was just scared shitless.",
  "Trooper was quite shy at first, but not too long after, his personality really became clear. He was a cuddle bug. Well, if a cuddle bug was armed with four forks used to cause chaos. He would wake me up in the middle of the night by literally slapping me in the face, and then, after rudely awakening me, would cuddle up on my pillow, taking 70% and leaving a thoughtful 30% for me! Despite his midnight escapades, every day when I came home from work, he would be so happy to see me. Tail wagging, excited howls, the whole nine yards. I soon got over the pillow thievery and compromised for the Saturday morning cuddle sessions. And within a few months, I knew I would be following the family tradition. Sure enough, three months after first meeting him, I adopted him. Trooper was now officially my furry friend and loyal companion, when he wanted to be.",
  "Flash forward two years, and I had just conceived the idea for this site. The concept is certainly not new, but what really drove me to make this site was making sure it was accessible. Everyone who has the distinct pleasure of owning a furry friend knows how scary it can be when faced with the possibility of losing them. The goal of this site is to provide an easier and cheaper way to ensure they can get their pet back home. After all, sometimes the best pets are also the most curious ones, and they deserve a way back.",
  "So, on behalf of Trooper and myself, thank you!",
];

export default function StorySection() {
  return (
    <section
      id="story"
      className="relative flex h-[calc(100dvh-var(--header-h))] snap-start flex-col bg-trooper-black"
    >
      <h2 className="shrink-0 pt-10 text-center text-4xl text-cream md:pt-16 md:text-5xl">
        About Trooper
      </h2>

      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 gap-12 px-6 pb-20 pt-6 md:px-10 md:pt-8">
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto [mask-image:linear-gradient(to_bottom,black_80%,transparent)]">
          <div className="mx-auto flex max-w-prose flex-col gap-4 pb-24 text-[17px] leading-relaxed text-cream/80">
            {STORY.map((p, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.85] first-letter:text-trooper-amber"
                    : undefined
                }
              >
                {p}
              </p>
            ))}
          </div>
        </div>
        <div className="hidden shrink-0 md:block">
          <img
            src={TrooperCollage}
            alt="Photos of Trooper"
            className="max-h-[55vh] w-auto max-w-95 rounded-2xl object-contain ring-1 ring-cream/10"
          />
        </div>
      </div>

      <ScrollCue label="FAQ" target="faq" tone="light" />
    </section>
  );
}
