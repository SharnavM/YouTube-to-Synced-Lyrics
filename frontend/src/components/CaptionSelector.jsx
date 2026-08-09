import { motion, useReducedMotion } from "motion/react";
import LoadingIndicator from "./LoadingIndicator";

export default function CaptionSelector({
  sectionRef,
  onReady,
  title,
  captions,
  selectedCode,
  onSelect,
  onGenerate,
  isLoading,
}) {
  const reduceMotion = useReducedMotion();
  const selectableCount = captions.filter(
    (caption) => typeof caption.code === "string" && caption.code,
  ).length;

  return (
    <motion.section
      ref={sectionRef}
      className="caption-stage"
      aria-labelledby="caption-stage-title"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={onReady}
    >
      <div className="stage-heading">
        <div>
          <p className="stage-index">02 / TRACK</p>
          <h2 id="caption-stage-title">Choose the words.</h2>
        </div>
        {title ? <p className="stage-title">{title}</p> : null}
      </div>

      <fieldset className="caption-list" disabled={isLoading} aria-busy={isLoading}>
        <legend className="sr-only">Choose one caption track</legend>
        {captions.map((caption) => {
          const canSelect = typeof caption.code === "string" && caption.code;
          const isSelected = canSelect && selectedCode === caption.code;

          return (
            <label
              className="caption-option"
              data-selected={isSelected}
              data-disabled={!canSelect}
              key={`${caption.index}-${caption.code || caption.name}`}
            >
              <input
                type="radio"
                name="caption-track"
                value={caption.code || ""}
                checked={isSelected}
                onChange={() => onSelect(caption.code)}
                disabled={!canSelect || isLoading}
              />
              <span className="caption-option__marker" aria-hidden="true">
                <span />
              </span>
              <span className="caption-option__body">
                <strong>{caption.name}</strong>
                <span>
                  {canSelect ? caption.code : "Caption code unavailable"}
                </span>
              </span>
              <span className="caption-option__index" aria-hidden="true">
                {String(caption.index + 1).padStart(2, "0")}
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="caption-stage__action">
        <p>
          {selectableCount} selectable {selectableCount === 1 ? "track" : "tracks"}
        </p>
        <motion.button
          className="button button--primary"
          type="button"
          onClick={onGenerate}
          disabled={!selectedCode || isLoading}
          aria-disabled={!selectedCode || isLoading}
          data-state={isLoading ? "loading" : selectedCode ? "success" : "disabled"}
          whileTap={selectedCode && !isLoading ? { y: 1 } : undefined}
        >
          {isLoading ? (
            <>
              <LoadingIndicator label="Generating synced lyrics" />
              Generating…
            </>
          ) : (
            "Generate synced lyrics"
          )}
        </motion.button>
      </div>
    </motion.section>
  );
}
