import { useState, useEffect, useRef, RefObject } from 'react';

interface Size {
  width: number | undefined;
  height: number | undefined;
}

// Remove unused type guard
// // Type guard to check if the target is an Element
// function isElement(target: EventTarget | null): target is Element {
//   return target instanceof Element;
// }

function useResizeObserver<T extends HTMLElement>(targetRef: RefObject<T>): Size {
  const [size, setSize] = useState<Size>({
    width: undefined,
    height: undefined,
  });

  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    // Ensure ResizeObserver is available (it is in modern browsers)
    if (typeof ResizeObserver === 'undefined') {
        console.warn('ResizeObserver is not supported by this browser.');
        // Optionally set initial size from targetRef if needed immediately
        if (targetRef.current) {
             setSize({
                width: targetRef.current.offsetWidth,
                height: targetRef.current.offsetHeight,
            });
        }
        return;
    }

    const element = targetRef.current;
    if (!element) {
      return; // No element to observe yet
    }

    // Disconnect previous observer if targetRef changes
    if (observerRef.current) {
        observerRef.current.disconnect();
    }

    // Create and assign the observer
    observerRef.current = new ResizeObserver(entries => {
      // We only observe one element, so we can take the first entry
      if (entries && entries.length > 0) {
        const { width, height } = entries[0].contentRect;
        setSize({ width, height });
      }
    });

    // Start observing the target element
    observerRef.current.observe(element);

    // Cleanup function to disconnect the observer
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null; // Clear the ref
      }
    };
  }, [targetRef]); // Re-run effect if targetRef changes

  return size;
}

export default useResizeObserver; 