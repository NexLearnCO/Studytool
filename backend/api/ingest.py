import time
from flask import Blueprint, request, jsonify
import requests
from config import Config

ingest_bp = Blueprint('ingest', __name__)


@ingest_bp.route('/ingest/pdf', methods=['POST'])
def ingest_pdf():
    """Accept PDF uploads and return a document id. If MinerU is configured, proxy to it."""
    try:
        if 'file' not in request.files:
            return jsonify({"ok": False, "message": "No file provided"}), 400
        file = request.files['file']
        if not file or not file.filename:
            return jsonify({"ok": False, "message": "Empty file"}), 400

        # Prefer MinerU if configured
        if Config.PREFER_MINERU and Config.MINERU_API_BASE:
            try:
                resp = requests.post(
                    f"{Config.MINERU_API_BASE}/documents",
                    headers={"Authorization": f"Bearer {Config.MINERU_API_KEY}"},
                    files={"file": (file.filename, file.stream.read())}
                )
                resp.raise_for_status()
                data = resp.json()
                return jsonify({"ok": True, "data": {"doc_id": data.get('doc_id') or data.get('id')}})
            except Exception as e:
                return jsonify({"ok": False, "message": f"MinerU ingest failed: {e}"}), 502

        # Fallback: stub document id (epoch ms)
        doc_id = int(time.time() * 1000)
        return jsonify({"ok": True, "data": {"doc_id": doc_id}})
    except Exception as e:
        return jsonify({"ok": False, "message": str(e)}), 500


@ingest_bp.route('/documents/<int:doc_id>/extract', methods=['POST'])
def extract_document(doc_id: int):
    """Extraction – if MinerU configured, proxy; else return example chunks and assets."""
    try:
        if Config.PREFER_MINERU and Config.MINERU_API_BASE:
            try:
                resp = requests.post(
                    f"{Config.MINERU_API_BASE}/documents/{doc_id}/extract",
                    headers={"Authorization": f"Bearer {Config.MINERU_API_KEY}"}
                )
                resp.raise_for_status()
                return jsonify({"ok": True, "data": resp.json()})
            except Exception as e:
                return jsonify({"ok": False, "message": f"MinerU extract failed: {e}"}), 502

        example = {
            "chunks": [
                {"kind": "text", "text": "# 標題\n本文件為示例抽取結果。", "page": 1},
                {"kind": "text", "text": "## 小節\n關鍵概念與定義...", "page": 2},
                {"kind": "table", "text": "| 項 | 值 |\n|---|---|\n|A|1|", "page": 2}
            ],
            "assets": []
        }
        return jsonify({"ok": True, "data": example})
    except Exception as e:
        return jsonify({"ok": False, "message": str(e)}), 500


@ingest_bp.route('/documents/<int:doc_id>/chunks', methods=['GET'])
def get_document_chunks(doc_id: int):
    """Return chunks; if MinerU configured, proxy; else stub."""
    try:
        if Config.PREFER_MINERU and Config.MINERU_API_BASE:
            try:
                resp = requests.get(
                    f"{Config.MINERU_API_BASE}/documents/{doc_id}/chunks",
                    headers={"Authorization": f"Bearer {Config.MINERU_API_KEY}"}
                )
                resp.raise_for_status()
                return jsonify({"ok": True, "data": resp.json()})
            except Exception as e:
                return jsonify({"ok": False, "message": f"MinerU chunks failed: {e}"}), 502

        example = {
            "chunks": [
                {"kind": "text", "text": "# 標題\n本文件為示例抽取結果。", "page": 1},
                {"kind": "text", "text": "## 小節\n關鍵概念與定義...", "page": 2}
            ],
            "assets": []
        }
        return jsonify({"ok": True, "data": example})
    except Exception as e:
        return jsonify({"ok": False, "message": str(e)}), 500


