import hashlib
import logging

from django.core.cache import cache
from groq import Groq
from django.conf import settings

from .embeddings import embed_text
from .vector_store import query as vector_query
from insights.models import InsightCache

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a helpful book expert assistant. Answer the user's question based on the provided context about books. 
If the context doesn't contain enough information, say so honestly. 
Always cite which books your answer references."""


class RAGPipeline:
    def __init__(self):
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY)

    def query(self, question, session_id=None):
        # Check cache
        cache_key = hashlib.sha256(question.strip().lower().encode()).hexdigest()

        # Check Django cache first
        cached = cache.get(cache_key)
        if cached:
            logger.info(f"Cache hit for question: {question[:50]}...")
            return cached

        # Check DB cache
        db_cached = InsightCache.objects.filter(cache_key=cache_key).first()
        if db_cached:
            result = {"answer": db_cached.answer, "sources": db_cached.sources}
            cache.set(cache_key, result)
            return result

        # Embed the question
        question_embedding = embed_text(question)

        # Search ChromaDB
        chunks, metadatas = vector_query(question_embedding, top_k=5)

        if not chunks:
            return {
                "answer": "I couldn't find any relevant information in the book database to answer your question.",
                "sources": [],
            }

        # Build context
        context_parts = []
        seen_titles = set()
        sources = []
        for chunk, meta in zip(chunks, metadatas):
            title = meta.get("book_title", "Unknown")
            context_parts.append(f"[From '{title}']: {chunk}")
            if title not in seen_titles:
                seen_titles.add(title)
                sources.append({
                    "book_id": meta.get("book_id"),
                    "book_title": title,
                })

        context = "\n\n".join(context_parts)
        user_prompt = f"Context:\n{context}\n\nQuestion: {question}"

        # Call Groq
        response = self.groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=1024,
            temperature=0.7,
        )
        answer = response.choices[0].message.content

        result = {"answer": answer, "sources": sources}

        # Cache the result
        cache.set(cache_key, result)
        InsightCache.objects.update_or_create(
            cache_key=cache_key,
            defaults={
                "question": question,
                "answer": answer,
                "sources": sources,
            },
        )

        return result
