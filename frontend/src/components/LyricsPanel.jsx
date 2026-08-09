import { motion, useReducedMotion } from "motion/react";
import { downloadLrc } from "../lib/youtube";

export default function LyricsPanel({ sectionRef, onReady, title, lyrics }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      ref={sectionRef}
      className="lyrics-stage"
      aria-labelledby="lyrics-stage-title"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={onReady}
    >
      <div className="lyrics-stage__heading">
        <div>
          <p className="stage-index">03 / OUTPUT</p>
          <h2 id="lyrics-stage-title">Synced. Line by line.</h2>
          {title ? <p className="lyrics-stage__title">{title}</p> : null}
        </div>
        <button
          className="button button--download"
          type="button"
          onClick={() => downloadLrc(lyrics, title)}
          data-state="success"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14" />
          </svg>
          Download .LRC
        </button>
      </div>
      <pre className="lyrics-output" tabIndex="0" aria-label="Generated synced lyrics">
        {lyrics}
      </pre>
    </motion.section>
  );
}
