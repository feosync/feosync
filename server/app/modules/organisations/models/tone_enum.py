from enum import Enum


class tone_enum(str, Enum):
    formal = "formal"
    informal = "informal"
    friendly = "friendly"
    professional = "professional"
    casual = "casual"