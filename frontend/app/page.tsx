import { HeroSection } from "@/components/hero-section"
import { SearchForm } from "@/components/search-form"
import { DestinationsSection } from "@/components/destinations-section"
import { FeaturesSection } from "@/components/features-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <SearchForm />
      <DestinationsSection />
      <FeaturesSection />
    </main>
  )
}
