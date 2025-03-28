import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="container grid place-items-center py-12 px-4">
        <div className="flex flex-col items-center justify-center gap-12 max-w-4xl w-full">
          <header className="text-center">
            <h2 className="text-xl md:text-2xl font-semibold text-primary mb-2">
              HSK Video AI
            </h2>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              2025 <span className="text-primary">Hackathon</span>
            </h1>
          </header>

          <main className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {[
                { name: "Stefan", role: "Team Member" },
                { name: "Samson", role: "Team Member" },
                { name: "Angie", role: "Team Member" },
                { name: "Kishore", role: "Team Member" },
              ].map((member) => (
                <div
                  key={member.name}
                  className="flex items-center p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <span className="text-xl font-semibold text-primary">
                      {member.name[0]}
                    </span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-medium">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </main>

          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <Link href="/analysis" className="w-full">
              <Button size="lg" variant="default" className="w-full">
                Video Analysis
              </Button>
            </Link>

            <div className="flex gap-4 w-full">
              <Link href="/analysis/live" className="flex-1">
                <Button size="lg" variant="secondary" className="w-full">
                  Live Analysis
                </Button>
              </Link>

              <Link href="/verify" className="flex-1">
                <Button size="lg" variant="secondary" className="w-full">
                  Verification
                </Button>
              </Link>
            </div>

            <Link href="/components" className="w-full">
              <Button
                size="lg"
                variant="outline"
                className="w-full text-muted-foreground"
              >
                Components
              </Button>
            </Link>
          </div>

          <footer className="text-center text-sm text-muted-foreground">
            <p>© 2025 NUMA</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
