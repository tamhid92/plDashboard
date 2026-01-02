import os

class Config:
    # Existing API URL (matches the port of the main service)
    BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
    
    # Feature flags
    CHAT_ENABLED_DEFAULT = os.getenv("CHAT_ENABLED_DEFAULT", "false").lower() == "true"
    
    # Caching
    CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "300"))
    
    # Model config (for later)
    MODEL_PATH = os.getenv("MODEL_PATH", "models/llama-2-7b-chat.gguf")
