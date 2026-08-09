import argparse
import sys

from synced_lyrics import InvalidCaptionError, SyncedLyricsError, SyncedLyrics


def choose_caption_cli(sl):
    options = sl.get_caption_options()

    for option in options:
        print(f"{option['index'] + 1}. {option['name']}")

    try:
        choice = int(input("Choose language of subtitles: "))
    except ValueError:
        raise InvalidCaptionError("Please enter a valid number.")

    # UI is 1-based, internal API is 0-based.
    return sl.get_caption(choice - 1)


def main():
    parser = argparse.ArgumentParser(
        description=("Download synchronized lyrics (.lrc) from a YouTube video.")
    )

    parser.add_argument("link", help="The YouTube video link")

    parser.add_argument(
        "-o",
        "--output-dir",
        default=".",
        help="Output directory for the .lrc file (default: current directory)",
    )

    parser.add_argument(
        "-f",
        "--filename",
        help="Output file name (default: video title)",
    )

    parser.add_argument(
        "-c",
        "--caption",
        type=int,
        help=("Caption number. If omitted, you will be prompted interactively."),
    )

    args = parser.parse_args()

    try:
        sl = SyncedLyrics(
            args.link,
            output_dir=args.output_dir,
            filename=args.filename,
        )

        if args.caption is not None:
            caption = sl.get_caption_by_index(args.caption - 1)
        else:
            caption = choose_caption_cli(sl)

        lrc = sl.generate_lrc(caption)
        path = sl.save_to_file(lrc)

        print(f"Lyrics saved successfully to '{path}'.")

    except SyncedLyricsError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
