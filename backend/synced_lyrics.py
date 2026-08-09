import re
from pathlib import Path

from pytubefix import YouTube


class SyncedLyricsError(Exception):
    """Base exception for SyncedLyrics."""


class NoCaptionsError(SyncedLyricsError):
    """Raised when a video has no captions."""


class InvalidCaptionError(SyncedLyricsError):
    """Raised when an invalid caption is selected."""


class SyncedLyrics:
    def __init__(self, link, output_dir=".", filename=None):
        self.link = link
        self.output_dir = output_dir
        self.filename = filename

        try:
            self.youtube = YouTube(link)
        except Exception as exc:
            raise SyncedLyricsError(f"Failed to fetch YouTube video: {exc}") from exc

    @property
    def captions(self):
        """Return all available captions."""
        captions = list(self.youtube.captions)

        if not captions:
            raise NoCaptionsError("No captions found for this video.")

        return captions

    def get_caption_options(self):
        """
        Return caption metadata suitable for CLI and HTTP responses.
        """
        return [
            {
                "index": index,
                "name": str(caption.name),
                "code": getattr(caption, "code", None),
            }
            for index, caption in enumerate(self.captions)
        ]

    def get_caption_by_index(self, index=0):
        """
        Return a caption by zero-based index.
        """
        captions = self.captions

        if index < 0 or index >= len(captions):
            raise InvalidCaptionError(
                f"Invalid caption index {index}. "
                f"Available indexes: 0-{len(captions) - 1}"
            )

        return captions[index]

    def get_caption_by_code(self, caption_code=None):
        if caption_code is None:
            return None

        captions = self.captions
        for caption in captions:
            if getattr(caption, "code", "") == caption_code:
                return caption

        return None

    def generate_lrc(self, caption):
        """
        Convert a caption track into LRC and return it as a string.

        Does not write anything to disk.
        """
        try:
            srt = caption.generate_srt_captions()
        except Exception as exc:
            raise SyncedLyricsError(f"Failed to generate subtitles: {exc}") from exc

        blocks = re.split(r"(?:\r?\n){2,}", srt.strip())

        result = [f"[length:{self.get_video_length_in_str()}]"]

        for block in blocks:
            lines = block.splitlines()

            # Expected:
            # 1
            # 00:00:12,300 --> 00:00:14,500
            # lyric text
            if len(lines) < 3:
                continue

            timeframe = lines[1]
            lyric = " ".join(lines[2:]).strip()

            try:
                start, _ = timeframe.split(" --> ", 1)
            except ValueError:
                continue

            timestamp = self.srt_timestamp_to_lrc(start)

            result.append(f"[{timestamp}]{lyric}")

        return "\n".join(result) + "\n"

    @staticmethod
    def srt_timestamp_to_lrc(timestamp):
        """
        Convert SRT timestamp:
            01:02:03,450 -> 01:02:03.45
            00:02:03,450 -> 02:03.45
        """
        hours, minutes, rest = timestamp.split(":")
        seconds, milliseconds = rest.split(",")

        hours = int(hours)
        minutes = int(minutes)
        seconds = int(seconds)
        hundredths = int(milliseconds) // 10

        if hours > 0:
            return f"{hours:02d}:{minutes:02d}:{seconds:02d}.{hundredths:02d}"

        return f"{minutes:02d}:{seconds:02d}.{hundredths:02d}"

    def save_to_file(self, lrc):
        """
        Save generated LRC to disk.

        This is useful for CLI usage, but Flask doesn't need to call it.
        """
        filename = self.get_filename()
        path = Path(self.output_dir) / filename

        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(lrc, encoding="utf-8")
        except OSError as exc:
            raise SyncedLyricsError(f"Failed to save '{path}': {exc}") from exc

        return path

    def get_filename(self):
        filename = self.filename or self.youtube.title

        if not filename.lower().endswith(".lrc"):
            filename += ".lrc"

        return filename

    def get_video_length_in_str(self):
        return self.convert_seconds_to_time(self.youtube.length)

    @staticmethod
    def convert_seconds_to_time(seconds):
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        hundredths = int((seconds - int(seconds)) * 100)

        if hours > 0:
            return f"{hours:02d}:{minutes:02d}:{secs:02d}.{hundredths:02d}"

        return f"{minutes:02d}:{secs:02d}.{hundredths:02d}"
