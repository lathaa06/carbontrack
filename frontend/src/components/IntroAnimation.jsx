import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import introPlanet from "../assets/intro-planet.json";

export default function IntroAnimation({ show, onComplete }) {
  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--color-bg-primary)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Background Glow */}
          <motion.div
            className="absolute w-80 h-80 rounded-full bg-green-400/20 blur-3xl"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{ duration: 1.5 }}
          />

          {/* Planet Animation */}
          <motion.div
            className="relative z-10"
            initial={{
              scale: 0.4,
              opacity: 0,
              rotate: -20,
            }}
            animate={{
              scale: 1,
              opacity: 1,
              rotate: 0,
              y: -35,
            }}
            transition={{
              duration: 1.4,
              ease: "easeInOut",
            }}
          >
            <Lottie
              animationData={introPlanet}
              loop={false}
              style={{
                width: 190,
                height: 190,
              }}
            />
          </motion.div>

          {/* Logo */}
          <motion.h1
            className="mt-3 text-4xl font-bold tracking-[0.25em] text-[var(--color-text-primary)]"
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.9,
              duration: 0.8,
            }}
          >
            CARBONTRACK
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-3 text-sm tracking-[0.18em] text-[var(--color-text-secondary)]"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 1.5,
              duration: 0.7,
            }}
          >
            Measure • Track • Reduce
          </motion.p>

          {/* Bottom Fade Effect */}
          <motion.div
            className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}