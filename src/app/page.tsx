import { Suspense } from "react";
import { Nav } from "@/components/Nav";
import { Playground } from "@/components/Playground";
import { ToastProvider } from "@/components/ui/Toast";

export default function Home() {
  return (
    <ToastProvider>
      <Suspense fallback={<Shell />}>
        <Playground />
      </Suspense>
    </ToastProvider>
  );
}

/** Static first paint while the playground restores state in the browser. */
function Shell() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-10" aria-busy="true">
        <div className="h-[88px]" />
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="h-[70dvh] rounded-[18px] border border-line bg-sheet" />
        </div>
      </main>
    </>
  );
}
