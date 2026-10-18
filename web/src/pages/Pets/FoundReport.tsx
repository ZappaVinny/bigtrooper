import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { PawIcon } from "../../components/icons";
import { formatPhoneForDisplay } from "../../lib/phone";
import { ReportFoundError, getFoundReport, type FoundReportInfo } from "../../api/found";

const eyebrow = "text-xs font-extrabold uppercase tracking-[0.12em]";

function ContactRow({ label, href, value }: { label: string; href: string; value: string }) {
  return (
    <div className="px-5 py-4">
      <p className={`${eyebrow} text-charcoal/60`}>{label}</p>
      <a href={href} className="text-lg font-bold text-trooper-black">
        {value}
      </a>
    </div>
  );
}

export default function FoundReport() {
  const { code = "" } = useParams<{ code: string }>();
  const [report, setReport] = useState<FoundReportInfo | null>(null);
  const [failure, setFailure] = useState<"missing" | "forbidden" | "error" | null>(null);

  useEffect(() => {
    let alive = true;
    getFoundReport(code)
      .then((r) => alive && setReport(r))
      .catch((err) => {
        if (!alive) return;
        const status = err instanceof ReportFoundError ? err.status : 0;
        setFailure(status === 404 ? "missing" : status === 403 ? "forbidden" : "error");
      });
    return () => {
      alive = false;
    };
  }, [code]);

  if (failure) {
    const { title, message } = {
      missing: {
        title: "No report found",
        message: "There's no finder report for this tag yet, or the tag has been paused.",
      },
      forbidden: {
        title: "Not your pet",
        message: "This report belongs to another account. Log in with the account that owns this pet to see it.",
      },
      error: {
        title: "Something went wrong",
        message: "We couldn't load this report right now. Please try again in a moment.",
      },
    }[failure];

    return (
      <PageShell title={title} width="sm" center>
        <Card className="flex flex-col items-center gap-4 p-8 text-center">
          <p className="text-charcoal/70">{message}</p>
          <Button to="/pets">Back to your pets</Button>
        </Card>
      </PageShell>
    );
  }

  if (!report) {
    return (
      <PageShell width="md">
        <div className="flex animate-pulse flex-col gap-8">
          <div className="mx-auto h-12 w-2/3 rounded-full bg-trooper-black/10" />
          <div className="h-32 rounded-2xl border border-line bg-cream-50" />
          <div className="h-64 rounded-2xl border border-line bg-cream-50" />
        </div>
      </PageShell>
    );
  }

  const { pet_name: name, finder_email: email, finder_phone: phone, finder_location: location } = report;

  return (
    <PageShell
      title={`${name} has been reported found!`}
      subtitle={`Someone scanned ${name}'s tag and let us know they've found them. Take a breath: the hardest part is over.`}
      width="md"
    >
      {location && (
        <Card className="p-6 sm:p-8">
          <p className={`${eyebrow} text-trooper-amber`}>Where they were found</p>
          <h2 className="mt-1 text-3xl text-trooper-black">Near {location}</h2>
          <p className="mt-1 text-sm text-charcoal/65">
            An approximate area (about 1 km) shared by the finder.
          </p>
        </Card>
      )}

      <Card className="flex flex-col gap-5 p-6 sm:p-8">
        <div>
          <h2 className="text-3xl text-trooper-black">Get in touch with the finder</h2>
          <p className="mt-1 text-sm text-charcoal/65">
            The person who found {name} provided the following contact information:
          </p>
        </div>

        <div className="divide-y divide-line rounded-xl border border-line bg-cream/50">
          {phone && <ContactRow label="Phone" href={`tel:${phone}`} value={formatPhoneForDisplay(phone)} />}
          {email && <ContactRow label="Email" href={`mailto:${email}`} value={email} />}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {phone && <Button to={`tel:${phone}`}>Call the finder</Button>}
          {email && (
            <Button to={`mailto:${email}?subject=${encodeURIComponent(`You found ${name}!`)}`} variant="dark">
              Send an email
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <p className={`${eyebrow} text-trooper-amber`}>A few tips</p>
        <ul className="mt-3 flex flex-col gap-3 leading-relaxed text-charcoal/80">
          {[
            "Reach out soon. Finders are often keeping your pet safe until you arrive.",
            `Meet somewhere public and bring a photo of ${name} just in case.`,
            "Once they're home, a thank-you goes a long way.",
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-3">
              <PawIcon width={16} height={16} className="mt-1 shrink-0 text-trooper-tan" />
              {tip}
            </li>
          ))}
        </ul>
      </Card>
    </PageShell>
  );
}
