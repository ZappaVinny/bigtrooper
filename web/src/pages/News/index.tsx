import ButtonPrimary from "../../components/ButtonPrimary";

const ARCHIVE = [
  {
    id: 1,
    date: "May 12, 2026",
    title: "How to Train Your Dog",
    excerpt:
      "Lorem ipsum PSUMidsaut dLorem PSUMidsaut dLorem PSUMidsaut adLorem PSUMidsaut sad",
  },
  {
    id: 2,
    date: "May 17, 2026",
    title: "News Title Could Be",
    excerpt:
      "Lorem PSUMidsaut dLorem PSUMidsaut dLorem PSUMidsaut sdh adLorem PSUMidsaut sad dLorem",
  },
  {
    id: 3,
    date: "May 12, 2026",
    title: "News Title Could Be",
    excerpt:
      "Lorem PSUMidsaut dLorem PSUMidsaut dLorem PSUMidsaut sdh adLorem PSUMidsaut sad dLorem",
  },
  {
    id: 4,
    date: "May 12, 2026",
    title: "News Title Could Be",
    excerpt:
      "Lorem PSUMidsaut dLorem PSUMidsaut dLorem PSUMidsaut sdh adLorem PSUMidsaut sad dLorem",
  },
  {
    id: 5,
    date: "May 12, 2026",
    title: "News Title Could Be",
    excerpt:
      "Lorem PSUMidsaut dLorem PSUMidsaut dLorem PSUMidsaut sdh adLorem PSUMidsaut sad dLorem",
  },
];

const TABLE_OF_CONTENTS = [
  "Paragraph 1",
  "Paragraph 2",
  "Paragraph 3",
  "Paragraph 4",
  "Paragraph 5",
];

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla condimentum nec nibh eget sodales. In pharetra velit at risus cursus, at interdum purus ornare. Quisque ipsum nibh, tincidunt tincidunt rutrum sit, consequat sed ligula. Maecenas ut neque eget felis semper suscipit. Vivamus commodo viverra risus sed semper. Donec vulputate at magna convallis auctor. Vestibulum at fringilla felis, quis malesuada lorem. Nunc at augue nisl. Pellentesque quis augue non risus eleifend ornare. Curabitur orci metus, mollis dapibus dui sed, sollicitudin viverra sem. Pellentesque eu elit varius, magna eleifend malesuada cursus a eros. Cras sit amet quam in diam rutrum placerat. Sed nibh mauris, dapibus sed tempor ac, malesuada sed risus. Integer quis leo nam sem iaculis scelerisque ut id lectus. In ut elit faucibus lorem blandit laoreet.";

const LOREM_SHORT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi fringilla sem id lacinia aliquam. Pellentesque volutpat mi vitae elit viverra, quis gravida neque placerat. In viverra placerat orci eget fringilla. Vivamus commodo nisl quis dolor mattis, at varius orci cursus. Maecenas sodales sem id nulla suscipit, at ultrices lacus varius. Cras eu ante suscipit, convallis nisl id, vehicula eros. Nullam pretium ornare dolor, in porta sem tempus sed. Aenean vel sapien arcu. Aenean justo lorem, cursus mollis volutpat vel, ultrices sit amet dui. Cras viverra varius mauris, id finibus tellus ultrices sit amet. Pellentesque felis orci, viverra ut convallis in, efficitur ac nulla. In et justo at velit blandit tristique vel eget magna. Etiam rhoncus nunc id tortor consequat quis pulvinar ante blandit. Morbi at lobortis lectus. Aliquam vel magna orci. Pellentesque ut dignissim nibh.";

export default function News() {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-cream">
      {/* Title bar */}
      <div className="py-4 text-center">
        <h1 className="font-display text-4xl text-trooper-black">News</h1>
      </div>

      <div className="grid grid-cols-[240px_1fr_180px] min-h-[calc(100vh-72px-65px)] items-start">

        {/* Left — News Archive, NOT sticky, scrolls with page */}
        <aside className="flex flex-col bg-trooper-black rounded-r-2xl">
          <div className="bg-trooper-black px-4 py-3 border-b rounded-tr-2xl border-cream/10">
            <h2 className="font-display text-lg text-cream">News Archive</h2>
          </div>
          <div className="flex flex-col">
            {ARCHIVE.map((item) => (
              <button
                key={item.id}
                className="flex flex-col gap-0.5 px-4 py-3 text-left border-l-4 border-transparent hover:bg-cream/5 transition-all"
              >
                <span className="text-xs font-semibold not-fancy text-trooper-amber">
                  {item.date}
                </span>
                <span className="text-sm font-bold text-cream not-fancy leading-snug">
                  {item.title}
                </span>
                <span className="text-xs text-cream/50 not-fancy leading-snug line-clamp-2">
                  {item.excerpt}
                </span>
              </button>
            ))}
          </div>
          {/* View More sits right below the list */}
          <div className="px-4 py-3">
            <ButtonPrimary className="bg-trooper-amber text-cream w-full h-9 text-sm rounded-xl">
              View More
            </ButtonPrimary>
          </div>
        </aside>

        {/* Center — Main article */}
        <main className="px-8 py-6 bg-cream">
          <span className="text-xs font-semibold not-fancy text-trooper-amber block mb-1">
            May 12, 2026
          </span>
          <h1 className="font-display text-4xl text-trooper-black mb-4 leading-tight">
            How to Train Your Dog
          </h1>
          <p className="text-sm text-charcoal not-fancy leading-relaxed mb-6">{LOREM}</p>

          {[1, 2, 3, 4, 5].map((n) => (
            <section key={n} id={`paragraph-${n}`} className="mb-6">
              <h2 className="font-display text-xl text-trooper-black mb-2 pb-1 border-b border-trooper-tan">
                How to Train Your Dog
              </h2>
              <p className="text-sm text-charcoal not-fancy leading-relaxed mb-3">{LOREM_SHORT}</p>
              <p className="text-sm text-charcoal not-fancy leading-relaxed">{LOREM_SHORT}</p>
            </section>
          ))}
        </main>

        {/* Right — Table of Contents, STICKY */}
        <aside className="sticky top-0 bg-trooper-tan rounded-l-2xl px-4 py-6">
          <h2 className="font-display text-base text-trooper-black mb-4">Table of Contents</h2>
          <ul className="flex flex-col gap-1">
            {TABLE_OF_CONTENTS.map((item, i) => (
              <li key={i}>
                <a
                  href={`#paragraph-${i + 1}`}
                  className="text-sm not-fancy text-trooper-black/70 hover:text-trooper-black flex items-center gap-2 py-1 hover:pl-1 transition-all"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-trooper-black/40 shrink-0" />
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </aside>

      </div>
    </div>
  );
}
