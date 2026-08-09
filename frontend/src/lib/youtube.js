const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
]);

export function getYouTubeVideoId(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  let url;

  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return null;
  }

  const hostname = url.hostname.toLowerCase();
  let videoId = null;

  if (hostname === "youtu.be" || hostname === "www.youtu.be") {
    videoId = url.pathname.split("/").filter(Boolean)[0] || null;
  } else if (YOUTUBE_HOSTS.has(hostname)) {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v");
    } else {
      const [route, id] = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(route)) {
        videoId = id || null;
      }
    }
  } else if (
    hostname === "youtube-nocookie.com" ||
    hostname === "www.youtube-nocookie.com"
  ) {
    const [route, id] = url.pathname.split("/").filter(Boolean);
    if (route === "embed") {
      videoId = id || null;
    }
  }

  return VIDEO_ID_PATTERN.test(videoId || "") ? videoId : null;
}

export function isValidYouTubeUrl(value) {
  return getYouTubeVideoId(value) !== null;
}

export function createLrcFilename(title) {
  if (typeof title !== "string" || !title.trim()) {
    return "synced-lyrics.lrc";
  }

  let safeName = title
    .normalize("NFKC")
    .replace(/[<>:"/\\|?*\p{Cc}]/gu, "-")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "")
    .trim();

  if (!safeName || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(safeName)) {
    return "synced-lyrics.lrc";
  }

  safeName = safeName.slice(0, 180).replace(/[. ]+$/g, "");

  return safeName.toLowerCase().endsWith(".lrc")
    ? safeName
    : `${safeName}.lrc`;
}

export function downloadLrc(lyrics, title) {
  const blob = new Blob([lyrics], { type: "text/plain;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = createLrcFilename(title);
  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}
