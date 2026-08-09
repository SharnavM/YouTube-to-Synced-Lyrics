import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import LoadingIndicator from "./LoadingIndicator";

export default function YouTubeUrlForm({
  url,
  onChange,
  onSubmit,
  isValid,
  isLoading,
}) {
  const [touched, setTouched] = useState(false);
  const hasValue = url.trim().length > 0;
  const showInvalid = touched && !isValid;

  useEffect(() => {
    if (!hasValue) {
      setTouched(false);
    }
  }, [hasValue]);

  const message = showInvalid
    ? hasValue
      ? "Use a YouTube watch, short, live, embed, or youtu.be link with a valid video ID."
      : "Paste a YouTube video URL to continue."
    : isValid
      ? "YouTube link recognised. Ready to read caption tracks."
      : "Accepted: youtube.com/watch and youtu.be links.";

  function handleSubmit(event) {
    event.preventDefault();
    setTouched(true);

    if (isValid && !isLoading) {
      onSubmit();
    }
  }

  return (
    <form className="url-form" onSubmit={handleSubmit} noValidate>
      <label className="url-form__label" htmlFor="youtube-url">
        YouTube video URL
      </label>
      <div className="url-form__control">
        <input
          id="youtube-url"
          name="youtube-url"
          type="url"
          inputMode="url"
          autoComplete="url"
          spellCheck="false"
          value={url}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="https://www.youtube.com/watch?v=…"
          aria-invalid={showInvalid}
          aria-describedby="youtube-url-message"
          data-state={
            isLoading ? "loading" : showInvalid ? "error" : isValid ? "success" : "default"
          }
        />
        <span className="url-form__state" aria-hidden="true">
          {isLoading ? <LoadingIndicator /> : isValid ? "↗" : ""}
        </span>
      </div>
      <motion.button
        className="button button--primary url-form__button"
        type="submit"
        disabled={!isValid || isLoading}
        aria-disabled={!isValid || isLoading}
        data-state={isLoading ? "loading" : isValid ? "success" : "disabled"}
        whileTap={isValid && !isLoading ? { y: 1 } : undefined}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isLoading ? "loading" : "ready"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {isLoading ? "Fetching captions…" : "Fetch captions"}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      <p
        id="youtube-url-message"
        className="url-form__message"
        data-tone={showInvalid ? "error" : isValid ? "success" : "muted"}
        aria-live="polite"
      >
        {message}
      </p>
    </form>
  );
}

