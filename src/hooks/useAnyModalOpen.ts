import { useState, useEffect } from "react";

/**
 * A custom hook that detects if any global modal is currently open.
 * It observes the document.body for conventional modal classes or overflow styles.
 */
export function useAnyModalOpen() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkModals = () => {
      const bodyClasses = document.body.className;
      const hasModalClass =
        bodyClasses.includes("rs-modal-has-opened") ||
        bodyClasses.includes("modal-open") ||
        document.body.style.overflow === "hidden";

      setIsModalOpen(hasModalClass || false);
    };

    // Initial check
    checkModals();

    // Watch for class or style changes on the body
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      mutations.forEach((mutation) => {
        if (
          mutation.attributeName === "class" ||
          mutation.attributeName === "style"
        ) {
          shouldCheck = true;
        }
      });
      if (shouldCheck) {
        checkModals();
      }
    });

    observer.observe(document.body, { attributes: true });

    // Custom event listener for custom triggered modals
    const handleCustomModalEvent = (event: any) => {
      if (event.detail && typeof event.detail.isOpen === "boolean") {
        if (event.detail.isOpen) {
          setIsModalOpen(true);
        } else {
          checkModals(); // Re-eval based on actual DOM state
        }
      }
    };

    window.addEventListener("business-modal-toggle", handleCustomModalEvent);
    window.addEventListener("modal-toggle", handleCustomModalEvent);

    return () => {
      observer.disconnect();
      window.removeEventListener("business-modal-toggle", handleCustomModalEvent);
      window.addEventListener("modal-toggle", handleCustomModalEvent);
    };
  }, []);

  return isModalOpen;
}

export default useAnyModalOpen;
