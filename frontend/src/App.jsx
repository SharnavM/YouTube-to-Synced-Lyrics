import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import "./App.css";
import BackendStatus from "./components/BackendStatus";
import CaptionSelector from "./components/CaptionSelector";
import LoadingIndicator from "./components/LoadingIndicator";
import LyricsPanel from "./components/LyricsPanel";
import StatusMessage from "./components/StatusMessage";
import YouTubeUrlForm from "./components/YouTubeUrlForm";
import { ApiError, getSyncedLyrics, listCaptions } from "./lib/api";
import { isValidYouTubeUrl } from "./lib/youtube";

function getErrorMessage(error, fallback) {
  return error instanceof ApiError && error.message ? error.message : fallback;
}

function isViewportCenteredOn(element) {
  if (!element) {
    return false;
  }

  const { top, bottom } = element.getBoundingClientRect();
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const viewportCenter = viewportHeight / 2;

  return top <= viewportCenter && bottom >= viewportCenter;
}

function App() {
  const [url, setUrl] = useState("");
  const [captions, setCaptions] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [captionStatus, setCaptionStatus] = useState("idle");
  const [captionError, setCaptionError] = useState("");
  const [lyricsStatus, setLyricsStatus] = useState("idle");
  const [lyricsError, setLyricsError] = useState("");
  const captionRequest = useRef(null);
  const lyricsRequest = useRef(null);
  const captionSection = useRef(null);
  const lyricsSection = useRef(null);
  const captionScrollRequested = useRef(false);
  const lyricsScrollRequested = useRef(false);
  const reduceMotion = useReducedMotion();

  const isUrlValid = isValidYouTubeUrl(url);
  const hasWorkflow = captionStatus !== "idle";

  useEffect(() => {
    return () => {
      captionRequest.current?.abort();
      lyricsRequest.current?.abort();
    };
  }, []);

  function resetGeneratedState() {
    captionRequest.current?.abort();
    lyricsRequest.current?.abort();
    captionScrollRequested.current = false;
    lyricsScrollRequested.current = false;
    setCaptions([]);
    setSelectedCode("");
    setVideoTitle("");
    setLyrics("");
    setCaptionStatus("idle");
    setCaptionError("");
    setLyricsStatus("idle");
    setLyricsError("");
  }

  function scrollToSection(element) {
    element?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  function handleCaptionSectionReady() {
    if (!captionScrollRequested.current) {
      return;
    }

    captionScrollRequested.current = false;
    scrollToSection(captionSection.current);
  }

  function handleLyricsSectionReady() {
    const shouldScroll =
      lyricsScrollRequested.current &&
      isViewportCenteredOn(captionSection.current);

    lyricsScrollRequested.current = false;

    if (shouldScroll) {
      scrollToSection(lyricsSection.current);
    }
  }

  function handleUrlChange(nextUrl) {
    if (nextUrl !== url) {
      resetGeneratedState();
      setUrl(nextUrl);
    }
  }

  async function handleFetchCaptions() {
    if (!isUrlValid || captionStatus === "loading") {
      return;
    }

    captionRequest.current?.abort();
    lyricsRequest.current?.abort();

    const controller = new AbortController();
    captionRequest.current = controller;
    setCaptionStatus("loading");
    setCaptionError("");
    setCaptions([]);
    setSelectedCode("");
    setVideoTitle("");
    setLyrics("");
    setLyricsStatus("idle");
    setLyricsError("");
    captionScrollRequested.current = false;
    lyricsScrollRequested.current = false;

    try {
      const result = await listCaptions(url.trim(), {
        signal: controller.signal,
      });

      if (controller.signal.aborted) {
        return;
      }

      const availableCaptions = Array.isArray(result?.captions)
        ? result.captions
        : [];
      setVideoTitle(typeof result?.title === "string" ? result.title : "");
      setCaptions(availableCaptions);
      captionScrollRequested.current = availableCaptions.length > 0;
      setCaptionStatus(availableCaptions.length > 0 ? "success" : "empty");
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      const noCaptions =
        error instanceof ApiError &&
        error.status === 404 &&
        Array.isArray(error.payload?.captions) &&
        error.payload.captions.length === 0;

      setCaptionStatus(noCaptions ? "empty" : "error");
      captionScrollRequested.current = false;
      setCaptionError(
        getErrorMessage(
          error,
          "Caption tracks could not be loaded. Check the link and try again.",
        ),
      );
    } finally {
      if (captionRequest.current === controller) {
        captionRequest.current = null;
      }
    }
  }

  function handleCaptionSelect(captionCode) {
    if (captionCode === selectedCode) {
      return;
    }

    lyricsRequest.current?.abort();
    setSelectedCode(captionCode);
    setLyrics("");
    setLyricsStatus("idle");
    setLyricsError("");
    lyricsScrollRequested.current = false;
  }

  async function handleGenerateLyrics() {
    if (!selectedCode || lyricsStatus === "loading") {
      return;
    }

    lyricsRequest.current?.abort();
    const controller = new AbortController();
    lyricsRequest.current = controller;
    setLyricsStatus("loading");
    setLyricsError("");
    setLyrics("");
    lyricsScrollRequested.current = false;

    try {
      const result = await getSyncedLyrics(url.trim(), selectedCode, {
        signal: controller.signal,
      });

      if (controller.signal.aborted) {
        return;
      }

      const generatedLyrics = typeof result?.lrc === "string" ? result.lrc : "";

      lyricsScrollRequested.current =
        Boolean(generatedLyrics) &&
        isViewportCenteredOn(captionSection.current);
      setVideoTitle(
        typeof result?.title === "string" ? result.title : videoTitle,
      );
      setLyrics(generatedLyrics);
      setLyricsStatus("success");
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      setLyricsStatus("error");
      lyricsScrollRequested.current = false;
      setLyricsError(
        getErrorMessage(
          error,
          "Synced lyrics could not be generated. Choose another caption track or try again.",
        ),
      );
    } finally {
      if (lyricsRequest.current === controller) {
        lyricsRequest.current = null;
      }
    }
  }

  const entrance = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="app-shell" data-has-workflow={hasWorkflow}>
      <header className="site-header mx-auto flex w-full max-w-page items-center justify-between px-4 sm:px-8 lg:px-12">
        <a
          className="wordmark"
          href="#top"
          aria-label="YouTube to Synced Lyrics home"
        >
          YT<span className="text-(--color-accent)">2</span>LRC
        </a>
        <div className="header-utilities">
          <BackendStatus />
          <a className="header-cta" href="#youtube-url">
            Start <span aria-hidden="true">↘</span>
          </a>
        </div>
      </header>

      <main id="top">
        <motion.section
          className="hero-section mx-auto w-full max-w-page px-4 sm:px-8 lg:px-12"
          {...entrance}
          transition={{
            duration: reduceMotion ? 0.12 : 0.32,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div className="hero-grid grid min-w-0 gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="hero-copy min-w-0 lg:col-span-8">
              <p className="hero-kicker">YouTube captions → synced lyrics</p>
              <h1>
                Video in<span aria-hidden="true">.</span>
                <br />
                Lyrics out<span aria-hidden="true">.</span>
              </h1>
            </div>
            <div className="hero-lede min-w-0 lg:col-span-4 lg:self-end">
              <p>
                Pick a YouTube caption track. Turn it into synchronized{" "}
                <code>.lrc</code> lyrics. Keep every timestamp.
              </p>
              <span>One video · one track · one file</span>
            </div>
          </div>

          <div className="hero-rule" aria-hidden="true" />

          <YouTubeUrlForm
            url={url}
            onChange={handleUrlChange}
            onSubmit={handleFetchCaptions}
            isValid={isUrlValid}
            isLoading={captionStatus === "loading"}
          />
        </motion.section>

        <section
          className="workflow mx-auto flex w-full max-w-page flex-col px-4 sm:px-8 lg:px-12"
          aria-live="polite"
        >
          <AnimatePresence mode="popLayout">
            {captionStatus === "loading" ? (
              <motion.div
                className="stage-loader"
                key="caption-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LoadingIndicator label="Fetching caption tracks" />
                <div>
                  <strong>Reading caption tracks…</strong>
                  <span>Contacting YouTube through the Flask backend.</span>
                </div>
              </motion.div>
            ) : null}

            {captionStatus === "empty" ? (
              <StatusMessage
                key="caption-empty"
                tone="empty"
                title="No captions available"
              >
                {captionError ||
                  "This video has no caption tracks. Try another upload with subtitles or CC."}
              </StatusMessage>
            ) : null}

            {captionStatus === "error" ? (
              <StatusMessage
                key="caption-error"
                tone="error"
                title="Captions could not be fetched"
              >
                {captionError}
              </StatusMessage>
            ) : null}

            {captionStatus === "success" ? (
              <CaptionSelector
                key="captions"
                sectionRef={captionSection}
                onReady={handleCaptionSectionReady}
                title={videoTitle}
                captions={captions}
                selectedCode={selectedCode}
                onSelect={handleCaptionSelect}
                onGenerate={handleGenerateLyrics}
                isLoading={lyricsStatus === "loading"}
              />
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {lyricsStatus === "loading" ? (
              <motion.div
                className="stage-loader stage-loader--lyrics"
                key="lyrics-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LoadingIndicator label="Generating synced lyrics" />
                <div>
                  <strong>Generating synchronized lines…</strong>
                  <span>
                    The selected caption track is being converted to LRC.
                  </span>
                </div>
              </motion.div>
            ) : null}

            {lyricsStatus === "error" ? (
              <StatusMessage
                key="lyrics-error"
                tone="error"
                title="Lyrics were not generated"
              >
                {lyricsError}
              </StatusMessage>
            ) : null}

            {lyricsStatus === "success" && lyrics ? (
              <LyricsPanel
                key="lyrics"
                sectionRef={lyricsSection}
                onReady={handleLyricsSectionReady}
                title={videoTitle}
                lyrics={lyrics}
              />
            ) : null}

            {lyricsStatus === "success" && !lyrics ? (
              <StatusMessage
                key="lyrics-empty"
                tone="empty"
                title="The caption track was empty"
              >
                The service returned no lyric lines. Choose another caption
                track and generate again.
              </StatusMessage>
            ) : null}
          </AnimatePresence>
        </section>
      </main>

      <footer className="site-footer mx-auto flex w-full max-w-page flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p>YT2LRC · captions become synced lyrics</p>
        <p>Output stays in your browser until you download it.</p>
      </footer>
    </div>
  );
}

export default App;
