import requests
import os
from dotenv import load_dotenv
load_dotenv()

API_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2"




headers = {
    "Authorization": f"Bearer {os.getenv('HF_TOKEN')}"
}

def calcul_similarite(rep_correcte: str, rep_etudiant: str):
    """
    Retourne un score de similarité entre 0 et 1.
    """
    if not rep_etudiant.strip() or not rep_correcte.strip():
        return [0.0]  # réponse vide → similarité 0

    payload = {
        "inputs": {
            "source_sentence": rep_correcte,
            "sentences": [rep_etudiant]
        }
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        # Hugging Face retourne une liste avec un score
        return result  # [score]
    except Exception as e:
        print(f" Erreur API Hugging Face : {e}")
        return [0.0]