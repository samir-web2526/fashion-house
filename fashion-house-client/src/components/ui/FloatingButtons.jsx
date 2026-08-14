import { useState, useEffect } from "react";
import { FaWhatsapp, FaArrowUp } from "react-icons/fa";

export default function FloatingButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const mainEl = document.getElementById("main-scroll");
    if (!mainEl) return;

    const handleScroll = () => {
      setShowScrollTop(mainEl.scrollTop > 200);
    };

    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const mainEl = document.getElementById("main-scroll");
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <a
        href="https://wa.me/+8801940005000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-6 z-9999 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-lg transition-transform hover:scale-110 sm:h-14 sm:w-14"
      >
        <FaWhatsapp className="text-lg sm:text-2xl" />
      </a>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-36 right-6 z-9999 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-lg transition-transform hover:scale-110 sm:h-14 sm:w-14"
        >
          <FaArrowUp className="text-lg sm:text-2xl" />
        </button>
      )}
    </>
  );
}
