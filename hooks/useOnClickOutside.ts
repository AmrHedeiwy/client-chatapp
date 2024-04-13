import { RefObject, useEffect } from 'react';

const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (e: Event) => void
) => {
  useEffect(() => {
    const listener = (e: Event) => {
      const element = ref.current;

      if (!element || element.contains((e.target as Node) || null)) return;

      handler(e);
    };

    document.addEventListener('touchstart', listener);
    document.addEventListener('mousedown', listener);

    return () => {
      document.removeEventListener('touchstart', listener);
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler]);
};

export default useOnClickOutside;
