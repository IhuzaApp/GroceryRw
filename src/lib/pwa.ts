// PWA utilities and service worker registration

export const isSupported = () => {
  return typeof window !== "undefined" && "serviceWorker" in navigator;
};

export const registerServiceWorker = async () => {
  if (!isSupported()) {
    console.log("Service workers are not supported in this browser");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("Service worker registered successfully:", registration);

    // Handle updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // New content is available, show update notification
            if (confirm("New version available! Reload to update?")) {
              window.location.reload();
            }
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error("Service worker registration failed:", error);
  }
};

export const unregisterServiceWorker = async () => {
  if (!isSupported()) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map((registration) => registration.unregister())
    );
    console.log("Service workers unregistered");
  } catch (error) {
    console.error("Service worker unregistration failed:", error);
  }
};

// Check if app is running in standalone mode (installed)
export const isStandalone = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
};

// Check if device is iOS
export const isIOS = () => {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Check if device is Android
export const isAndroid = () => {
  if (typeof window === "undefined") return false;
  return /Android/.test(navigator.userAgent);
};

// Get install prompt event
export const getInstallPrompt =
  (): Promise<BeforeInstallPromptEvent | null> => {
    return new Promise((resolve) => {
      const handler = (e: Event) => {
        e.preventDefault();
        resolve(e as BeforeInstallPromptEvent);
      };

      window.addEventListener("beforeinstallprompt", handler, { once: true });

      // Resolve with null after 10 seconds if no prompt event
      setTimeout(() => resolve(null), 10000);
    });
  };
