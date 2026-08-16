import { cn } from '@/lib/utils'

/**
 * Per-character headline animation — CSS only, no client component.
 *
 * The earlier Framer version kept every glyph translated out of its mask until
 * hydration ran, which made the hero headline the last thing to paint and cost
 * seconds of LCP on a throttled phone. A CSS keyframe with a per-character
 * delay starts on the first frame instead, so the text paints while it moves
 * and needs no JavaScript at all.
 *
 * The readable string sits in the DOM once, visually hidden; the glyphs are
 * decorative. `prefers-reduced-motion` collapses the animation globally.
 */
export function SplitText({
  text,
  className,
  charClassName,
  delay = 0,
  stagger = 0.028,
  as: Tag = 'span',
}: {
  text: string
  className?: string
  charClassName?: string
  /** Seconds before the first character moves. */
  delay?: number
  /** Seconds between characters. */
  stagger?: number
  as?: 'span' | 'h1' | 'h2'
}) {
  let index = -1

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>

      {text.split(' ').map((word, wordIndex, words) => (
        <span key={`${word}-${wordIndex}`} className="inline-block whitespace-nowrap" aria-hidden="true">
          {[...word].map((char, charIndex) => {
            index += 1
            return (
              <span
                key={`${char}-${charIndex}`}
                className="inline-block overflow-hidden align-bottom"
              >
                <span
                  className={cn('split-char inline-block', charClassName)}
                  style={{ animationDelay: `${delay + index * stagger}s` }}
                >
                  {char}
                </span>
              </span>
            )
          })}
          {wordIndex < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </Tag>
  )
}
