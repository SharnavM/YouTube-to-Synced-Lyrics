from flask import Flask, jsonify, request
from synced_lyrics import (
    SyncedLyricsError,
    SyncedLyrics,
    NoCaptionsError,
    InvalidCaptionError,
)


app = Flask(__name__)


@app.post("/captions/list")
def list_captions():
    data = request.get_json(silent=True) or {}
    link = data.get("link")

    if not link:
        return jsonify({"error": "'link' is required"}), 400

    try:
        sl = SyncedLyrics(link)

        return jsonify({
            "error": None,
            "title": sl.youtube.title,
            "captions": sl.get_caption_options(),
        })

    except NoCaptionsError as exc:
        return jsonify({
            "error": str(exc),
            "title": None,
            "captions": [],
        }), 404

    except SyncedLyricsError as exc:
        return jsonify({"error": str(exc)}), 502


@app.post("/captions/get")
def get_captions():
    data = request.get_json(silent=True) or {}
    link = data.get("link")
    caption_code = data.get("captionCode")

    if not link:
        return jsonify({"error": "'link' is required"}), 400

    if not caption_code:
        return jsonify({"error": "'captionCode' is required"}), 400

    for name, value in {
        "link": link,
        "captionCode": caption_code,
    }.items():
        if not isinstance(value, str):
            return jsonify({"error": f"'{name}' must be a string"}), 400

    try:
        sl = SyncedLyrics(link)

        cap = sl.get_caption_by_code(caption_code)

        if cap is None:
            raise InvalidCaptionError("Could not find caption by given code.")

        lrc = sl.generate_lrc(cap)

        return jsonify({
            "error": None,
            "title": sl.youtube.title,
            "lrc": lrc,
        })

    except NoCaptionsError as exc:
        return jsonify({
            "error": str(exc),
            "title": None,
            "lrc": "",
        }), 404

    except InvalidCaptionError as exc:
        return jsonify({
            "error": str(exc),
            "title": None,
            "lrc": "",
        }), 404

    except SyncedLyricsError as exc:
        return jsonify({"error": str(exc)}), 502

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.get("/health")
def health_check():
    return {"status": "awake and ready"}


app.run(debug=True)
