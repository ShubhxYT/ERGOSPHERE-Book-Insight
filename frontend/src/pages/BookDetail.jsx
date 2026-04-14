import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { getBook, getRecommendations, generateInsights } from "../api/client"
import RatingStars from "../components/RatingStars"
import InsightPanel from "../components/InsightPanel"
import BookCard from "../components/BookCard"

export default function BookDetail() {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [similarBooks, setSimilarBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [bookRes, recsRes] = await Promise.all([
          getBook(id),
          getRecommendations(id),
        ])
        setBook(bookRes.data)
        setSimilarBooks(recsRes.data || [])
      } catch (err) {
        console.error("Failed to fetch book:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleGenerate = async () => {
    setGenerating(true)
    setGenerateError(null)
    try {
      await generateInsights(book.id)
      const res = await getBook(id)
      setBook(res.data)
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Insight generation failed. Please try again."
      setGenerateError(msg)
      console.error("Insight generation failed:", err)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-surface-container rounded w-1/4" />
          <div className="h-64 bg-surface-container rounded-xl" />
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <p className="text-on-surface-variant">Book not found.</p>
        <Link to="/" className="text-primary hover:text-primary/80">
          ← Back to all books
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link
        to="/"
        className="text-primary hover:text-primary/80 text-sm inline-flex items-center gap-1 mb-6"
      >
        ← Back to all books
      </Link>

      <div className="grid md:grid-cols-3 gap-8 mb-10">
        <div className="md:col-span-1">
          <div
            className="rounded-xl overflow-hidden -translate-y-2"
            style={{ boxShadow: "0 20px 40px rgba(218, 226, 253, 0.08)" }}
          >
            <img
              src={book.cover_image_url}
              alt={book.title}
              className="w-full"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || book.insights_generated}
            className="mt-4 w-full text-on-primary font-medium px-4 py-3 rounded-xl disabled:opacity-40 transition-opacity"
            style={{
              background: "linear-gradient(135deg, #76d6d5 0%, #008080 100%)",
            }}
          >
            {generating
              ? "Generating..."
              : book.insights_generated
              ? "Insights Generated"
              : "Generate AI Insights"}
          </button>
          {generateError && (
            <p className="mt-2 text-xs text-error leading-snug">{generateError}</p>
          )}
        </div>
        <div className="md:col-span-2 space-y-5">
          <h1
            className="text-4xl font-bold text-on-surface leading-tight"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {book.title}
          </h1>
          <div className="flex items-center gap-3">
            <RatingStars rating={book.rating} />
            <span className="text-secondary-container font-semibold">{book.rating}/5</span>
            <span className="text-on-surface-variant text-sm">({book.num_reviews} reviews)</span>
          </div>
          <div className="grid grid-cols-2 gap-3 bg-surface-container-low rounded-xl p-5">
            {[
              ["Genre", book.genre || "Unknown"],
              ["Price", book.price || "N/A"],
              ["Availability", book.availability || "N/A"],
              ["Author", book.author],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-0.5">{label}</p>
                <p
                  className={`font-semibold text-on-surface ${
                    label === "Price" ? "text-secondary-container" : ""
                  }`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
          <div className="bg-surface-container rounded-xl px-5 py-4">
            <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-2">Description</p>
            <p className="text-on-surface-variant leading-relaxed">{book.description}</p>
          </div>
        </div>
      </div>

      {book.insights_generated && <InsightPanel book={book} />}

      {similarBooks.length > 0 && (
        <div className="mt-10">
          <h2
            className="text-2xl font-bold text-on-surface mb-6"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Similar Books
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {similarBooks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
