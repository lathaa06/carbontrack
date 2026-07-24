import { motion } from "framer-motion";

export default function BadgeCard({ badge }) {
  return (
    <motion.div
        whileHover={{
            scale: 1.04,
            y: -10,
            rotateX: 6,
            rotateY: -6,
        }}
        transition={{
            type: "spring",
            stiffness: 250,
            damping: 18,
        }}

      className={`relative overflow-hidden rounded-3xl border p-2 text-center
      transition-all duration-500
      backdrop-blur-xl

      ${
        badge.unlocked
          ? "bg-green-500/5 border-green-500/40 backdrop-blur-xl shadow-[0_0_20px_rgba(34,197,94,0.18)]"
              : "bg-white/5 border-white/10 backdrop-blur-xl"

      }`}
    >
      <div className="relative mx-auto w-40 h-40 overflow-hidden">

        <img
          src={badge.image}
          alt={badge.title}
          className={`w-full h-full object-contain transition duration-300 ${
            badge.unlocked
              ? "drop-shadow-[0_0_18px_rgba(34,197,94,0.45)]"
              : "opacity-80"
          }`}
        />

        <div className="badge-shine"></div>
         {/* Chain Overlay */}
        {!badge.unlocked && (
          <img
            src="/badges/chain.png"
            alt="Locked Chain"
            className="
              absolute
              inset-0
              w-full
              h-full
              object-contain
              pointer-events-none
              select-none
              opacity-90
              z-10
            "
          />
        )}

      </div>

      <h3 className="mt-5 text-lg font-bold">
        {badge.title}
      </h3>

      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        {badge.description}
      </p>

      <div
        className={`mt-4 inline-block rounded-full px-4 py-1 text-xs font-bold
        ${
          badge.unlocked
            ? "bg-green-500 text-white"
            : "bg-gray-700 text-gray-300"
        }`}
      >
        {badge.unlocked ? "UNLOCKED" : "LOCKED"}
      </div>
    </motion.div>
  );
}