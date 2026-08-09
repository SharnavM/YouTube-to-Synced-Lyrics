import { useEffect, useRef, useState } from "react";
import { getBackendHealth } from "../lib/api";

const HEALTH_POLL_INTERVAL = 30_000;

export default function BackendStatus() {
  const [connection, setConnection] = useState({
    state: "checking",
    detail: "Checking the Flask backend.",
  });
  const activeRequest = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function checkHealth() {
      activeRequest.current?.abort();
      const controller = new AbortController();
      activeRequest.current = controller;

      try {
        const result = await getBackendHealth({ signal: controller.signal });

        if (isMounted && !controller.signal.aborted) {
          setConnection({ state: "online", detail: result.status });
        }
      } catch (error) {
        if (error.name !== "AbortError" && isMounted) {
          setConnection({
            state: "offline",
            detail: "The health check did not receive a valid response.",
          });
        }
      } finally {
        if (activeRequest.current === controller) {
          activeRequest.current = null;
        }
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        checkHealth();
      }
    }

    checkHealth();
    const intervalId = window.setInterval(checkHealth, HEALTH_POLL_INTERVAL);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      activeRequest.current?.abort();
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const stateLabel =
    connection.state === "online"
      ? "online"
      : connection.state === "offline"
        ? "offline"
        : "checking";

  return (
    <div
      className="backend-status"
      data-state={connection.state}
      role="status"
      aria-live="polite"
      aria-label={`Backend ${stateLabel}. ${connection.detail}`}
    >
      <span className="backend-status__dot" aria-hidden="true" />
      <span className="backend-status__label">
        <span className="backend-status__prefix">Backend </span>
        {stateLabel}
      </span>
    </div>
  );
}
