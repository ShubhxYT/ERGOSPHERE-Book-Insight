import logging

from groq import Groq, RateLimitError
from django.conf import settings

logger = logging.getLogger(__name__)


def _get_model_chain():
    """Build the model list from settings: primary first, then fallbacks."""
    primary = settings.GROQ_PRIMARY_MODEL
    fallbacks = [m.strip() for m in settings.GROQ_FALLBACK_MODELS.split(",") if m.strip()]
    # Deduplicate while preserving order
    seen = set()
    chain = []
    for m in [primary] + fallbacks:
        if m not in seen:
            seen.add(m)
            chain.append(m)
    return chain


_groq_client = None


def _get_groq_client():
    global _groq_client
    if _groq_client is None:
        _groq_client = Groq(api_key=settings.GROQ_API_KEY)
    return _groq_client


# Keep the old name as an alias so existing callers don't break
def get_groq_client():
    return _get_groq_client()


def _try_openai(system_prompt, user_prompt, max_tokens):
    """Attempt completion via OpenAI. Returns None if not configured."""
    api_key = getattr(settings, "OPENAI_API_KEY", None)
    if not api_key:
        return None
    try:
        from openai import OpenAI, RateLimitError as OAIRateLimitError
        client = OpenAI(api_key=api_key)
        model = getattr(settings, "OPENAI_FALLBACK_MODEL", "gpt-4o-mini")
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=max_tokens,
            temperature=0.7,
        )
        logger.info("Used OpenAI fallback model: %s", model)
        return response.choices[0].message.content.strip()
    except Exception as exc:
        logger.warning("OpenAI fallback also failed: %s", exc)
        return None


def complete(system_prompt, user_prompt, max_tokens=512):
    client = _get_groq_client()
    last_exc = None

    for model in _get_model_chain():
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=max_tokens,
                temperature=0.7,
            )
            if model != settings.GROQ_PRIMARY_MODEL:
                logger.info("Used Groq fallback model: %s", model)
            return response.choices[0].message.content.strip()
        except RateLimitError as exc:
            logger.warning("Rate limit on Groq/%s, trying next. %s", model, exc)
            last_exc = exc

    # All Groq models exhausted — try OpenAI
    result = _try_openai(system_prompt, user_prompt, max_tokens)
    if result is not None:
        return result

    raise last_exc

