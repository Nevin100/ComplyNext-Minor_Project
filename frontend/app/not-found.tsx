import Link from "next/link";

export default function NotFound() {
  return (
    <div className="landing">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="eyebrow mb-4">404</p>
        <h1 className="font-display text-5xl md:text-6xl">
          This page went missing.
        </h1>
        <p className="mt-4 max-w-md text-[#587279]">
          The page you are looking for was never filed with the registry.
          The URL might be wrong, or the page may have been moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="btn-primary">
            Back to dashboard
          </Link>
          <Link href="/" className="btn-ghost">
            Landing page
          </Link>
        </div>
        <p className="mono mt-10 text-xs text-[#93a8ad]">
          status: 404 · registry: complynext · error: page_not_found
        </p>
      </div>
    </div>
  );
}
