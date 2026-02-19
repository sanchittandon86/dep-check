import { PortfolioCard } from "@/components/PortfolioCard"

function App() {
  return (
    <div className="max-w-3xl space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Customer portfolio overview
          </p>
        </header>
        <PortfolioCard />
    </div>
  )
}

export default App
