export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-8">
      <header className="flex flex-col items-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Hackathon <span className="text-primary">HSK</span>
        </h1>
        <p className="text-xl text-muted-foreground text-center max-w-[600px]">
          Your AI-powered hackathon platform
        </p>
      </header>
      
      <main className="flex flex-col items-center space-y-6 text-center">
        <div className="p-8 border rounded-lg bg-card shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Welcome to Hackathon HSK</h2>
          <p className="text-muted-foreground mb-6">
            Get started by editing <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">src/app/page.tsx</code>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Get Started
            </a>
            <a 
              href="#" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Documentation
            </a>
          </div>
        </div>
      </main>
      
      <footer className="flex justify-center text-sm text-muted-foreground">
        <p>© 2025 Hackathon HSK. All rights reserved.</p>
      </footer>
    </div>
  );
}
