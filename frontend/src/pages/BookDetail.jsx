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
    try {
      await generateInsights(book.id)
      const res = await getBook(id)
      setBook(res.data)
    } catch (err) {
      console.error("Insight generation failed:", err)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-500">Book not found.</p>
        <Link to="/" className="text-blue-600 hover:underline">
          ← Back to all books
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
        ← Back to all books
      </Link>

      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-1">
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full rounded-lg shadow-lg mb-4"
          />
          <button
            onClick={handleGenerate}
            disabled={generating || book.insights_generated}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {generating ? "Generating..." : book.insights_generated ? "Insights Generated" : "Generate AI Insights"}
          </button>
        </div>
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
          <div className="flex items-center gap-4 mb-4">
            <RatingStars rating={book.rating} />
            <span className="text-lg text-gray-600">{book.rating}/5</span>
            <span className="text-gray-500">({book.num_reviews} reviews)</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Genre</p>
              <p className="font-semibold">{book.genre || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Price</p>
              <p className="font-semibold">{book.price || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Availability</p>
              <p className="font-semibold">{book.availability || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Author</p>
              <p className="font-semibold">{book.author}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Description</p>
            <p className="text-gray-700">{book.description}</p>
          </div>
        </div>
      </div>

      {book.insights_generated && <InsightPanel book={book} />}

      {similarBooks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Similar Books</h2>
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
