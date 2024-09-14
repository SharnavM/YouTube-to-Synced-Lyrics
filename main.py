import argparse
from pytubefix import YouTube
import re
import os
import sys

class SyncedLyrics:
    def __init__(self, link, output_dir=".", filename=None):
        try:
            self.youtube = YouTube(link)
        except Exception as e:
            print(f"Error: Failed to fetch YouTube video. Please check the link. Details: {e}")
            sys.exit(1)

        if not os.path.exists(output_dir):
            print(f"Error: Output directory '{output_dir}' does not exist.")
            sys.exit(1)

        self.output_dir = output_dir
        self.filename = filename
        self.lrc = ""

    def select_caption(self):
        all_subs = [i for i in self.youtube.captions]

        if not all_subs:
            print("Error: No captions found for this video.")
            sys.exit(1)

        for index, i in enumerate(all_subs):
            print(f"{index+1}. {i.name}")

        try:
            choice = int(input("Choose language of subtitles: "))

            if choice < 1 or choice > len(all_subs):
                print("Error: Invalid choice! Please try again with a correct choice.")
                sys.exit(1)
        except ValueError:
            print("Error: Invalid input! Please enter a number.")
            sys.exit(1)

        return all_subs[choice - 1]

    def srt_to_lrc(self, caption):
        try:
            subs = caption.generate_srt_captions()
        except Exception as e:
            print(f"Error: Failed to generate subtitles. Details: {e}")
            sys.exit(1)

        blank_line_regex = r"(?:\r?\n){2,}"
        lines = re.split(blank_line_regex, subs.strip())

        lrc = f"[length:{self.get_video_length_in_str()}]\n"

        for i in lines:
            num, timeframe, lyric = i.split("\n")
            start, end = timeframe.split(" --> ")

            start = start[3::]
            lrc += f"[{start[:len(start)-1].replace(',', '.')}]{lyric}\n"

        self.lrc = lrc

    def save_to_file(self):
        fname = self.filename or self.youtube.title

        if not fname.endswith(".lrc"):
            fname += ".lrc"

        path = os.path.join(self.output_dir, fname)

        try:
            with open(path, "w", encoding='utf-8') as f:
                f.write(self.lrc)
            print(f"Lyrics saved successfully to '{path}'.")
        except Exception as e:
            print(f"Error: Failed to save the file. Details: {e}")
            sys.exit(1)

    def get_video_length_in_str(self):
        length_of_video = self.youtube.length
        return self.convert_seconds_to_time(length_of_video)

    def convert_seconds_to_time(self, seconds):
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        hundredths = int((seconds - int(seconds)) * 100)

        return f"{minutes:02}:{secs:02}.{hundredths:02}"


def main():
    parser = argparse.ArgumentParser(description="Download synchronized lyrics (.lrc) from a YouTube video.")
    parser.add_argument("link", help="The YouTube video link")
    parser.add_argument("-o", "--output_dir", default=".", help="Output directory for the .lrc file (default: current directory)")
    parser.add_argument("-f", "--filename", help="Output file name (default: video title)")

    args = parser.parse_args()

    sl = SyncedLyrics(args.link, args.output_dir, args.filename)
    cap = sl.select_caption()
    sl.srt_to_lrc(cap)
    sl.save_to_file()


if __name__ == "__main__":
    main()
