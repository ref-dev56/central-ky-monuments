// Temporary placeholder so the project builds. The real home page
// (photo hero, category tabs, gallery, lightbox) comes in phase 2.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-4 px-6 py-24">
      <p className="text-sm font-medium tracking-wide text-muted">
        Serving Central Kentucky families
      </p>
      <h1 className="font-serif text-5xl font-semibold leading-tight">
        Central Kentucky Monuments
      </h1>
      <p className="max-w-xl text-lg leading-relaxed text-body">
        Site under construction.
      </p>
      <a
        href="#"
        className="inline-flex min-h-11 w-fit items-center rounded-md bg-brand px-5 font-medium text-white"
      >
        Request information
      </a>
    </main>
  );
}
