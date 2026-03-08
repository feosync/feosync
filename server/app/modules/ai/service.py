from google import genai
from app.core.config import settings
from google.genai import types


client = genai.Client(api_key=settings.GEMINI_API_KEY)

def generate_ai_response(prompt: str) -> str:
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        config=types.GenerateContentConfig(
        system_instruction="You are a exeprt in marketing digital. Your name is Neko."
        ),
        contents=prompt
    )
    return response.text