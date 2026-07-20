import dynamic from "next/dynamic";
import { ThemeToggle } from "./components/ThemeToggle";

const HomeClient = dynamic(() => import("./components/HomeClient"), {
  ssr: true,
  loading: () => (
    <div className="flex flex-col md:flex-row gap-8 w-full">
      <div className="w-full md:w-[60%] h-96 animate-pulse rounded-lg bg-muted" />
      <div className="w-full md:w-[40%] h-96 animate-pulse rounded-lg bg-muted" />
    </div>
  ),
});

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <h1 className="text-3xl font-bold">Code Style CV Generator</h1>
            <ThemeToggle />
          </div>
          <p className="text-muted-foreground mb-6">
            Generate a developer-style resume with terminal aesthetics
          </p>
        </header>

        <HomeClient />
      </div>
    </main>
  );
}
