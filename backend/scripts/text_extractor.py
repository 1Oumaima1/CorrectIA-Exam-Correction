import os
import pdfplumber
import pytesseract
from PIL import Image
import cv2

# Chemin vers tesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
                else:
                    image = page.to_image(resolution=300).original
                    text += pytesseract.image_to_string(image)
        return text.strip()

    elif ext in [".png", ".jpg", ".jpeg"]:
        img = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
        img = cv2.threshold(img, 150, 255, cv2.THRESH_BINARY)[1]
        return pytesseract.image_to_string(img).strip()

    return ""
