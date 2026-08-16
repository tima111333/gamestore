import { PageTransition } from '@/components/motion/PageTransition'

/**
 * Templates remount per navigation (unlike layouts), which is exactly the hook
 * a route transition needs.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>
}
