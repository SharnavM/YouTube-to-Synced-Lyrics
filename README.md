# YouTube to Synced Lyrics

A **CLI and webapp-based program** to convert YouTube video subtitles into synced lyrics (`.lrc`) files. This tool is especially useful for music videos with available subtitles, and it allows you to select the subtitle language of your choice.

---

## Features

- Download synced lyrics from YouTube videos that have subtitles.
- Option to choose the language of the subtitles.
- Save `.lrc` files for easy use with music players that support synced lyrics.

### Tip:

If the official video doesn't have subtitles, you can filter YouTube search results (by Subtitles/CC option) to show only videos with subtitles. To maintain synchronization, try to match the length of the alternative video with the official one.

---

## Requirements

- **Python 3.11+**
- **pytubefix**
- **Flask**

Install dependencies using:

```batch
pip install -r backend/requirements.txt
```

Tested with Python `3.11.9` and `pytubefix==10.10.1`

---

## CLI Parameters

| Parameter              | Required | Description                                                     | Default                                  |
| ---------------------- | -------- | --------------------------------------------------------------- | ---------------------------------------- |
| `link`                 | Yes      | Link of the YouTube video                                       | N/A                                      |
| `-o` or `--output_dir` | No       | Path of the folder to save the `.lrc` file                      | Current working directory of the program |
| `-f` or `--filename`   | No       | Name of the downloaded `.lrc` file.                             | Title of the YouTube video               |
| `-c` or `--caption`    | No       | Caption number. If omitted, you will be prompted interactively. | N/A                                      |

---

## Example Usage

### CLI

```bash
python cli.py "https://www.youtube.com/watch?v=qP-7GNoDJ5c" -f "Sea Shanty.lrc" -o "./lyrics"
```

This will download a file named `Sea Shanty.lrc` inside the `lyrics` folder.

### Web App

1. Start Frontend

```bash
cd frontend
yarn # or npm install
yarn dev # or npm run dev
```

2. Start Backend

```
python main.py
```

3. Head to `http://127.0.0.1:5173/` to open the web-app and use it.

---

## To Do / Future Improvements

1. ~~Automatically create the output directory if it does not exist.~~
2. ~~Deploy as a web application for easier access.~~
