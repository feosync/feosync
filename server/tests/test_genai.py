import os
import asyncio
from google import genai
from dotenv import load_dotenv
from PIL import Image
import io
import base64

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# 1. TEST TEXTE (Gemini 3 Flash)
async def generate_text():
    try:
        print("Génération de texte en cours...")
        response = await client.aio.models.generate_content(
            model="gemini-3-flash-preview",
            contents="Explique-moi l'intérêt du framework Odoo en 3 points."
        )
        print("Réponse Texte :", response.text)
    except Exception as e:
        print(f"Erreur Texte : {e}")

# 2. TEST IMAGE (Gemini 3 Flash Image)
async def generate_image():
    try:
        print("\nGénération d'image en cours...")
        response = await client.aio.models.generate_content(
            model="gemini-3.1-flash-image-preview",
            contents="Un développeur Python travaillant sur un serveur dans un style cyberpunk",
            config=genai.types.GenerateContentConfig(
                response_modalities=["IMAGE"],
            ),  
        )
        # Si les images sont en base64
        for i, img_b64 in enumerate(response.images):
            img_bytes = base64.b64decode(img_b64)
            img = Image.open(io.BytesIO(img_bytes))
            img.save(f"resultat_image_{i}.png")
            print(f"Image sauvegardée : resultat_image_{i}.png")
    except Exception as e:
        print(f"Erreur Image : {e}")

# --- Exécution ---
async def main():
    # await generate_text()
    await generate_image()

asyncio.run(main())