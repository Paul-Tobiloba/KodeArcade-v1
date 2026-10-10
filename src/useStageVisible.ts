import { useEffect, useState, type RefObject } from 'react';

/** Pause decorative run loops when the stage or browser tab is out of view. */
export default function useStageVisible(ref: RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  useEffect(() => {
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); });
    if (ref.current) observer?.observe(ref.current);
    document.addEventListener('visibilitychange', update);
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, [ref]);
  return visible;
}
