
# YouTube to Synced Lyrics

A **CLI-based Python program** to convert YouTube video subtitles into synced lyrics (`.lrc`) files. This tool is especially useful for music videos with available subtitles, and it allows you to select the subtitle language of your choice.

---

## Features
- Download synced lyrics from YouTube videos that have subtitles.
- Option to choose the language of the subtitles.
- Save `.lrc` files for easy use with music players that support synced lyrics.

### Tip:
If the official video doesn't have subtitles, you can filter YouTube search results (by Subtitles/CC option) to show only videos with subtitles. To maintain synchronization, try to match the length of the alternative video with the official one.

---

## Requirements
- **Python 3.6+**
- **pytubefix**

Install dependencies using:

```bash
pip install pytubefix
```

> **Note**: I was experiencing `Error 400: Bad Request` with `pytube`. That's why I decided to use `pytubefix`. If  `pytube` works for you, I
> recommend switching to it by changing the import in the code. 
> ```python
> from pytubefix import YouTube
> ```
> to 
> ```python
> from pytube import YouTube
> ```

Tested with Python `3.9.7` and `pytubefix==6.13.1`

---
## Parameters



|  Parameter       | Required | Description                                | Default                                  |
|-------------------------------|----------|--------------------------------------------|------------------------------------------|
| `link`             | Yes      | Link of the YouTube video                  | N/A                                      |
| `-o` or `--output_dir` | No       | Path of the folder to save the `.lrc` file | Current working directory of the program |
| `-f` or `--filename`   | No       | Name of the downloaded `.lrc` file.          | Title of the YouTube video               |

---
## Example Usage

```sh
python main.py "https://www.youtube.com/watch?v=qP-7GNoDJ5c" -f "Sea Shanty.lrc" -o "./lyrics"
```
This will download a file named `Sea Shanty.lrc` inside the `lyrics` folder.

---
## To Do / Future Improvements

 1. Automatically create the output directory if it does not exist.
 2. Deploy as a web application for easier access.
