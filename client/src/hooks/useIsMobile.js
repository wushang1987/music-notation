import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the current device is mobile
 * @param {number} breakpoint - The width threshold for mobile (default: 768px)
 * @returns {boolean} - True if viewport width is below breakpoint
 */
const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if window is defined (for SSR compatibility)
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

        // Set initial value
        setIsMobile(mediaQuery.matches);

        // Handler for media query changes
        const handler = (e) => setIsMobile(e.matches);

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handler);
            return () => mediaQuery.removeListener(handler);
        }
    }, [breakpoint]);

    return isMobile;
};

export default useIsMobile;
