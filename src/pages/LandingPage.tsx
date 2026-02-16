import Hero from '../components/landing/Hero'
import PainPoints from '../components/landing/PainPoints'
import Transformation from '../components/landing/Transformation'
import FourPillars from '../components/landing/FourPillars'
import Testimonials from '../components/landing/Testimonials'
import TrainingPhilosophy from '../components/landing/TrainingPhilosophy'
import WorldAnvilIntegration from '../components/landing/WorldAnvilIntegration'
import Pricing from '../components/landing/Pricing'
import FAQ from '../components/landing/FAQ'
import FinalCTA from '../components/landing/FinalCTA'
import Footer from '../components/landing/Footer'
import { useInteractionProfiler } from '../hooks'

export default function LandingPage() {
  useInteractionProfiler({ label: 'Landing page interactions' })

  return (
    <div className="min-h-screen bg-void-0">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-arcane focus:text-void-0 focus:rounded-lg"
      >
        Skip to main content
      </a>

      <main id="main-content">
        {/* Section 1: Hero */}
        <Hero />

        {/* Section 2: Pain Points */}
        <PainPoints />

        {/* Section 3: Transformation Promise */}
        <Transformation />

        {/* Section 4: Four Pillars */}
        <FourPillars />

        {/* Section 5: Social Proof / Testimonials */}
        <Testimonials />

        {/* Section 6: Training Philosophy */}
        <TrainingPhilosophy />

        {/* Section 7: World Anvil Integration */}
        <WorldAnvilIntegration />

        {/* Section 8: Pricing */}
        <Pricing />

        {/* Section 9: FAQ */}
        <FAQ />

        {/* Section 10: Final CTA */}
        <FinalCTA />
      </main>

      {/* Section 11: Footer */}
      <Footer />
    </div>
  )
}
