import { motion, useReducedMotion } from "motion/react";

const ICONS = {
  error: "×",
  empty: "—",
  info: "i",
};

export default function StatusMessage({ tone = "info", title, children }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="status-message"
      data-tone={tone}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.16, ease: [0.16, 1, 0.3, 1] }}
      role={tone === "error" ? "alert" : "status"}
    >
      <span className="status-message__mark" aria-hidden="true">
        {ICONS[tone] || ICONS.info}
      </span>
      <div>
        <h2>{title}</h2>
        <p>{children}</p>
      </div>
    </motion.section>
  );
}
