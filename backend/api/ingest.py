import time
from flask import Blueprint, request, jsonify

ingest_bp = Blueprint('ingest', __name__)


@ingest_bp.route('/ingest/pdf', methods=['POST'])
def ingest_pdf():
    """Stub endpoint to accept PDF uploads and return a document id.
    This is a basic placeholder – will be replaced/augmented by MinerU/PyMuPDF.
    """
    try:
        if 'file' not in request.files:
            return jsonify({"ok": False, "message": "No file provided"}), 400
        file = request.files['file']
        if not file or not file.filename:
            return jsonify({"ok": False, "message": "Empty file"}), 400

        # Generate a stub document id (epoch ms) – in future, persist in DB
        doc_id = int(time.time() * 1000)
        return jsonify({"ok": True, "data": {"doc_id": doc_id}})
    except Exception as e:
        return jsonify({"ok": False, "message": str(e)}), 500


@ingest_bp.route('/documents/<int:doc_id>/extract', methods=['POST'])
def extract_document(doc_id: int):
    """Stub extraction – returns example chunks and assets.
    Replace with MinerU/PyMuPDF pipeline later.
    """
    try:
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
    """Return the last stub extraction. In real impl, read from DB."""
    try:
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


