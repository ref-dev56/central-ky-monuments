import Link from "next/link";

type Props = {
  heading?: string | null;
  text?: string | null;
  linkLabel?: string;
  /** Drop the outer page padding when the band sits inside another column. */
  inline?: boolean;
};

/** Soft call-to-action panel that leads to the Request information page. */
export default function ContactBand({
  heading = "Don’t see quite what you’re looking for?",
  text = "Every design can be adapted in size, color and lettering. Tell us what you have in mind and we’ll help you find the right memorial.",
  linkLabel = "Talk with us",
  inline = false,
}: Props) {
  const panel = (
    <div className="flex flex-wrap items-center justify-between gap-6 rounded-xl bg-sage-tint px-6 py-8 sm:px-11 sm:py-10">
      <div className="flex max-w-2xl flex-col gap-2">
        <h2 className="font-serif text-[30px] font-semibold leading-tight sm:text-[34px]">
          {heading}
        </h2>
        {text && <p className="leading-relaxed text-body">{text}</p>}
      </div>
      <Link
        href="/request-information/"
        className="inline-flex min-h-[50px] items-center rounded-md bg-brand px-6 font-medium text-white hover:bg-ink"
      >
        {linkLabel}
      </Link>
    </div>
  );
  if (inline) return panel;
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">{panel}</section>
  );
}
