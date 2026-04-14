# Book Insight Platform

An AI-powered book intelligence platform that scrapes book data, generates AI insights, and provides a RAG-based Q&A interface.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 4.2, Django REST Framework |
| Database | MySQL (metadata), ChromaDB (vectors) |
| AI/LLM | Groq (`llama-3.3-70b-versatile`) |
| Embeddings | Sentence Transformers (`all-MiniLM-L6-v2`) |
| Scraping | Selenium + BeautifulSoup4 |
| Frontend | React 18, Vite, Tailwind CSS |
| API Docs | drf-spectacular (Swagger UI) |

## Setup Instructions

### Prerequisites

- Python 3.12+
- Node.js 18+
- MySQL server
- Google Chrome (for Selenium)
- Groq API key ([console.groq.com](https://console.groq.com))

### 1. Database Setup

```sql
CREATE DATABASE book_insight CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'bookuser'@'localhost' IDENTIFIED BY 'bookpass';
GRANT ALL PRIVILEGES ON book_insight.* TO 'bookuser'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your database credentials and Groq API key

python manage.py migrate
python manage.py runserver
```

### 3. Scrape Books

```bash
cd backend
# Quick test (5 pages, ~100 books, ~3-5 min)
python manage.py scrape_books --max-pages 5

# Full scrape (50 pages, ~1000 books, ~25-35 min)
python manage.py scrape_books
```

### 4. Generate AI Insights

```bash
# For a single book
python manage.py generate_insights --book-id 1

# For all books (takes time due to API rate limits)
python manage.py generate_insights --all
```

### 5. Build Vector Index

```bash
python manage.py build_index --all
```

### 6. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/books/` | List books (paginated, filterable) |
| GET | `/api/books/{id}/` | Book detail with AI insights |
| GET | `/api/books/{id}/recommendations/` | Top-5 similar books |
| POST | `/api/scrape/` | Trigger book scraper |
| POST | `/api/insights/generate/` | Generate AI insights for a book |
| POST | `/api/rag/query/` | RAG-based Q&A |
| GET | `/api/chat/history/?session_id=xxx` | Chat history |
| GET | `/api/docs/` | Swagger UI |
| GET | `/api/schema/` | OpenAPI 3.0 schema |

### Example: List Books

```bash
curl http://localhost:8000/api/books/?genre=Mystery&page=1
```

```json
{
  "count": 12,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Sharp Objects",
      "author": "Unknown",
      "rating": 4.5,
      "genre": "Mystery",
      "price": "£47.82"
    }
  ]
}
```

### Example: RAG Q&A

```bash
curl -X POST http://localhost:8000/api/rag/query/ \
  -H "Content-Type: application/json" \
  -d '{"question": "What mystery books are available?", "session_id": "demo-123"}'
```

```json
{
  "answer": "Based on the collection, there are several mystery books available including...",
  "sources": [
    {"book_id": 1, "book_title": "Sharp Objects"},
    {"book_id": 15, "book_title": "In a Dark, Dark Wood"}
  ]
}
```

## Sample Q&A Pairs

1. **Q:** "What are some highly rated romance novels?"
   **A:** Returns romance books with ratings and descriptions.

2. **Q:** "Recommend a good book for someone who likes thrillers"
   **A:** Provides thriller recommendations with reasoning.

3. **Q:** "What is the most expensive book in the collection?"
   **A:** Identifies the highest-priced book with details.

4. **Q:** "Tell me about books related to travel"
   **A:** Lists travel-related books with summaries.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GROQ_API_KEY` | Groq API key | (required) |
| `DB_NAME` | MySQL database name | `book_insight` |
| `DB_USER` | MySQL user | `bookuser` |
| `DB_PASSWORD` | MySQL password | `bookpass` |
| `DB_HOST` | MySQL host | `127.0.0.1` |
| `DB_PORT` | MySQL port | `3306` |
| `MAX_PAGES` | Default scraper page limit | `50` |
| `CHROMA_PERSIST_DIR` | ChromaDB storage path | `./chroma_db` |
| `DJANGO_SECRET_KEY` | Django secret key | (required) |
| `DEBUG` | Debug mode | `True` |

## Features

### Dashboard
- Browse all scraped books with pagination
- Filter by genre and minimum rating
- Search by title
- View book cover images and prices
- Quick scraper trigger

### Book Detail
- Full book metadata (title, author, rating, genre, price, availability)
- AI-generated insights (summary, genre classification, sentiment analysis, recommendations)
- Similar book recommendations based on vector similarity
- One-click AI insight generation

### Q&A Chat
- Ask natural language questions about books
- RAG-powered answers with source citations
- Chat history persistence (browser localStorage)
- Session-based conversation management

### Backend Features
- Automatic book scraping from books.toscrape.com
- Vector indexing with ChromaDB
- RAG pipeline with Groq LLM
- 24-hour caching layer for queries
- RESTful APIs with comprehensive documentation
- Swagger UI for interactive testing

## Notes

- The `author` field is always "Unknown" because books.toscrape.com does not expose author data.
- AI insight generation requires a valid Groq API key and may take time due to rate limits.
- The RAG pipeline caches responses for 24 hours (both in-memory and database).
- ChromaDB persists vector data locally in `backend/chroma_db/`

## Project Structure

```
.
├── backend/                          # Django backend
│   ├── config/                       # Project settings
│   ├── books/                        # Book app
│   ├── scraper/                      # Web scraper app
│   ├── rag/                          # RAG pipeline app
│   ├── insights/                     # AI insights app
│   ├── chat/                         # Chat history app
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/                         # React Vite frontend
│   ├── src/
│   │   ├── api/                      # API client
│   │   ├── components/               # Reusable components
│   │   ├── pages/                    # Page components
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
└── README.md
```

## Development

### Run Backend
```bash
cd backend
source .venv/bin/activate
python manage.py runserver
```

### Run Frontend
```bash
cd frontend
npm run dev
```

### Access Applications
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:8000/api/](http://localhost:8000/api/)
- API Docs: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
- Admin Panel: [http://localhost:8000/admin/](http://localhost:8000/admin/)

## License

This project is provided as-is for educational and demonstration purposes.
