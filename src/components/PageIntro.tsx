type Props = {
  eyebrow?: string;
  title: string;
  intro?: string | null;
};

/** The stone-colored band at the top of inner pages. */
export default function PageIntro({ eyebrow, title, intro }: Props) {
  return (
    <section className="border-b border-border bg-stone">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 pb-10 pt-12 sm:px-6 sm:pb-12 sm:pt-16">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{eyebrow}</p>
        )}
        <h1 className="max-w-3xl font-serif text-[40px] font-semibold leading-[1.08] sm:text-[52px]">
          {title}
        </h1>
        {intro && <p className="max-w-2xl text-lg leading-relaxed text-body">{intro}</p>}
      </div>
    </section>
  );
}
