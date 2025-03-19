export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-8">
      <header className="flex flex-col items-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          2025 <span className="text-primary">Hackathon</span>
        </h1>
        <p className="text-xl text-muted-foreground text-center max-w-[600px]">
          from Numa
        </p>
      </header>
      
      <main className="flex flex-col items-center space-y-6 text-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {[
            { name: "Stefan", role: "Team Member" },
            { name: "Kishore", role: "Team Member" },
            { name: "Samson", role: "Team Member" },
            { name: "Angie", role: "Team Member" }
          ].map((member) => (
            <div key={member.name} className="flex flex-col items-center p-4 border rounded-lg bg-card shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-xl font-semibold text-primary">{member.name[0]}</span>
              </div>
              <h3 className="text-lg font-medium">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </div>
          ))}
        </div>
      </main>
      
      <footer className="flex justify-center text-sm text-muted-foreground">
        <p>© 2025 Numa Hackathon</p>
      </footer>
    </div>
  );
}
