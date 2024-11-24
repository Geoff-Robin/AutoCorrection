from flask import Flask, request, jsonify
from ocrspace import API, OCREngine_VAL
from flask_cors import CORS
import torch
from torch import nn
from sentence_transformers import SentenceTransformer
import re
import os

# Initialize OCR API
ocr_api = API(ocrengine=OCREngine_VAL.engine_2)

# Flask app setup
app = Flask(__name__)
CORS(app)

# Define a temporary upload folder
UPLOAD_FOLDER = os.path.join(os.getcwd(), "temp_uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


class SiameseNetwork(nn.Module):
    def __init__(self, embedding_dim, hidden_dim):
        super(SiameseNetwork, self).__init__()
        self.fc1 = nn.Linear(embedding_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, 1)
        self.relu = nn.ReLU()
        self.sigmoid = nn.Sigmoid()

    def forward(self, x1, x2):
        x1 = self.relu(self.fc1(x1))
        x2 = self.relu(self.fc1(x2))
        diff = torch.abs(x1 - x2)
        similarity = self.sigmoid(self.fc2(diff))
        return similarity


def clean_text(text):
    """Clean and normalize the input text."""
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s]", "", text)
    return text.lower().strip()


embedding_model = SentenceTransformer("paraphrase-MiniLM-L6-v2")

# Load the pre-trained Siamese model
embedding_dim = 384
hidden_dim = 128
siamese_model = torch.load("siamese_model.pth")
siamese_model.eval()


@app.route("/api/calculate", methods=["POST"])

def calculate_ocr():
    
    """
    Calculate OCR for a single file and return scaled similarity score.

    Expects the following in the request:
    - file: The file to process.
    - text: The reference text.
    - marks: The maximum marks for the question.
    """

    if "file" not in request.files or "text" not in request.form or "marks" not in request.form:
        return jsonify({"error": "File, text, or marks not provided"}), 400

    file = request.files["file"]
    input_text = request.form["text"]
    marks = request.form.get("marks", type=float)

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        temp_file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(temp_file_path)

        ocr_result = ocr_api.ocr_file(temp_file_path)
        os.remove(temp_file_path)

        ocr_result_cleaned = clean_text(ocr_result)
        input_text_cleaned = clean_text(input_text)

        embedding_ocr = embedding_model.encode(ocr_result_cleaned)
        embedding_input = embedding_model.encode(input_text_cleaned)

        embedding_ocr_tensor = torch.tensor(embedding_ocr, dtype=torch.float32)
        embedding_input_tensor = torch.tensor(embedding_input, dtype=torch.float32)

        with torch.no_grad():
            similarity_score = siamese_model(embedding_ocr_tensor, embedding_input_tensor)
            similarity_score_value = similarity_score.item() * marks

        return jsonify({"ocr_text": ocr_result, "scaled_score": similarity_score_value}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
