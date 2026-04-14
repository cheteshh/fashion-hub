"use client";

import { motion } from "framer-motion";

/* ─── FadeIn wrapper ─── */
export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── StaggerContainer ─── */
export function StaggerContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── StaggerItem ─── */
export function StaggerItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── PremiumButton ─── */
export function PremiumButton({
  children,
  onClick,
  href,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-semibold text-white transition-all hover:scale-105 active:scale-95 hover:shadow-xl";
  const style = {
    background: "linear-gradient(135deg, var(--brand-from), var(--brand-to))",
  };

  if (href) {
    return (
      <a href={href} className={`${base} ${className}`} style={style}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={`${base} ${className}`} style={style}>
      {children}
    </button>
  );
}
