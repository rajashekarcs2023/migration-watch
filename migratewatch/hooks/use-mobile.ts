import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current device is mobile
 * @param breakpoint Width threshold for mobile detection (default: 768px)
 * @returns Boolean indicating if the device is mobile
 */
export function useMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup event listener
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [breakpoint]);

  /**
   * Check if the current device is mobile based on screen width
   */
  const checkIfMobile = () => {
    setIsMobile(window.innerWidth < breakpoint);
  };

  return isMobile;
}

/**
 * Hook to detect if the user agent is a mobile device
 * @returns Boolean indicating if the user agent is a mobile device
 */
export function useMobileUserAgent(): boolean {
  const [isMobileUA, setIsMobileUA] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in browser
    if (typeof window === 'undefined') {
      return;
    }

    // Check if user agent indicates a mobile device
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    
    setIsMobileUA(mobileRegex.test(userAgent));
  }, []);

  return isMobileUA;
}

export default useMobile;
