import os
import asyncio
from dotenv import load_dotenv
from groq import Groq, AsyncGroq  

load_dotenv()

# Client asynchrone Groq
async_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

# Liste des modèles avec fallback (du meilleur au plus léger/rapide)
MODELS = [
    "llama-3.3-70b-versatile",   # Modèle principal (meilleure qualité)
    "llama-3.1-8b-instant",      # Fallback ultra-rapide
]

# 1. TEST TEXTE avec fallback sur plusieurs modèles
async def generate_text_with_fallback(prompt: str):
    print("Génération de texte avec Groq (fallback activé)...\n")
    
    for model in MODELS:
        try:
            print(f"→ Tentative avec le modèle : {model}")
            
            response = await async_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "Tu es un assistant technique utile et concis."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=800,
            )
            
            text = response.choices[0].message.content
            print(f"✅ Réponse obtenue avec {model} :\n")
            print(text)
            return text  # On s'arrête au premier succès
            
        except Exception as e:
            print(f"❌ Erreur avec {model} : {e}")
            print("→ Passage au modèle suivant...\n")
            continue
    
    print("❌ Tous les modèles ont échoué.")
    return None


# --- Exécution ---
async def main():
    prompt = "Explique-moi l'intérêt du framework Odoo en 3 points."
    
    await generate_text_with_fallback(prompt)


if __name__ == "__main__":
    asyncio.run(main())