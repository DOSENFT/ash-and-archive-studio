import { useState } from 'react'
import InteractiveCTA from './InteractiveCTA'

const faqs = [
  {
    question: "I'm a brand new DM. Is this too advanced for me?",
    answer:
      "Not at all! The Studio is designed to meet you where you are. Our training modules start from absolute basics and progress to advanced techniques. New DMs often find the structured approach accelerates their learning dramatically compared to piecing together YouTube tutorials.",
  },
  {
    question: 'How is this different from free YouTube tutorials?',
    answer:
      "YouTube is great for inspiration, but it's scattered and passive. The Studio provides structured, progressive training with exercises, feedback loops, and tools that work together. It's the difference between watching cooking shows and attending culinary school.",
  },
  {
    question: 'Is this system-agnostic? I don\'t play D&D 5e.',
    answer:
      "Absolutely. While we use D&D terminology, the skills taught—voice acting, improvisation, world-building, storytelling—apply to every tabletop RPG system. Whether you run Pathfinder, Call of Cthulhu, Fate, or homebrew, these techniques transfer.",
  },
  {
    question: 'What happens to my data if I cancel?',
    answer:
      "Your data remains accessible in read-only mode for 90 days after cancellation. You can export everything at any time. We believe your worldbuilding belongs to you, not us.",
  },
  {
    question: 'Can I use this with my existing World Anvil world?',
    answer:
      "Yes! Our official World Anvil integration lets you sync your existing world seamlessly. Import your articles, keep everything canonical, and enhance your workflow without starting over.",
  },
  {
    question: 'Is there a mobile app?',
    answer:
      "The Studio is fully responsive and works beautifully on tablets and phones. A dedicated mobile app with offline session support is on our roadmap for later this year.",
  },
  {
    question: 'Can I share access with my players?',
    answer:
      "Forge and Archive tiers include player-facing features. You control exactly what players can see—share location descriptions, character art, and lore without revealing your secrets.",
  },
  {
    question: 'What if I need help or have questions?',
    answer:
      "All plans include community Discord access. Forge members get priority support with 24-hour response times. Archive members have direct access to our team via private channels.",
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  // Split FAQs into two columns for desktop
  const midPoint = Math.ceil(faqs.length / 2)
  const leftColumn = faqs.slice(0, midPoint)
  const rightColumn = faqs.slice(midPoint)

  const FAQItem = ({ faq, index }: { faq: typeof faqs[0]; index: number }) => (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={() => toggleFAQ(index)}
        className="w-full py-6 flex items-start justify-between gap-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcane"
        aria-expanded={openIndex === index}
        aria-controls={`faq-answer-${index}`}
      >
        <span className="font-display font-semibold text-forge-0 pr-4">
          {faq.question}
        </span>
        <span
          className={`flex-shrink-0 w-6 h-6 rounded-full bg-void-2 flex items-center justify-center transition-transform duration-base ${
            openIndex === index ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          <svg
            className="w-4 h-4 text-forge-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div
        id={`faq-answer-${index}`}
        className={`overflow-hidden transition-all duration-enter ease-forge ${
          openIndex === index ? 'max-h-96 pb-6' : 'max-h-0'
        }`}
        aria-hidden={openIndex !== index}
      >
        <p className="text-forge-1 leading-relaxed pr-10">{faq.answer}</p>
      </div>
    </div>
  )

  return (
    <section
      className="section-padding relative overflow-hidden bg-void-1"
      aria-labelledby="faq-heading"
    >
      <div className="section-container relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-arcane font-mono text-sm tracking-widest uppercase mb-4">
            Questions Answered
          </p>
          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-forge-0 mb-4"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-forge-1 max-w-2xl mx-auto">
            Everything you need to know before entering The Studio.
          </p>
        </div>

        {/* FAQ grid - single column on mobile, two on desktop */}
        <div className="max-w-5xl mx-auto">
          {/* Mobile: single column */}
          <div className="lg:hidden glass-card p-6">
            {faqs.map((faq, index) => (
              <FAQItem key={index} faq={faq} index={index} />
            ))}
          </div>

          {/* Desktop: two columns */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-8">
            <div className="glass-card p-6">
              {leftColumn.map((faq, index) => (
                <FAQItem key={index} faq={faq} index={index} />
              ))}
            </div>
            <div className="glass-card p-6">
              {rightColumn.map((faq, index) => (
                <FAQItem key={index + midPoint} faq={faq} index={index + midPoint} />
              ))}
            </div>
          </div>
        </div>

        {/* Additional help */}
        <div className="text-center mt-12">
          <p className="text-forge-1 mb-4">
            Still have questions? We'd love to hear from you.
          </p>
          <InteractiveCTA
            variant="ghost"
            state="blocked"
            blockedLabel="Direct support link is coming soon"
            className="px-5 py-3 text-arcane hover:text-forge-0"
            aria-label="Direct support link unavailable"
          >
            Contact Support
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </InteractiveCTA>
        </div>
      </div>
    </section>
  )
}
