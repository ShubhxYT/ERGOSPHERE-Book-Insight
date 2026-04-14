import { useState, useEffect, useCallback } from "react"
import { getBooks, triggerScrape } from "../api/client"
import BookCard from "../components/BookCard"

export default function BookList() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [genre, setGenre] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [scraping, setScraping] = useState(false)

  const genres = [
    "", "Fiction", "Mystery", "Romance", "Science Fiction", "Fantasy",
    "Thriller", "Historical Fiction", "Non-Fiction", "Biography",
    "Self-Help", "Philosophy", "Poetry", "Horror", "Adventure",
    "Young Adult", "Children", "Humor", "Travel", "Music", "Art", "Default",
  ]

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page }
      if (search) params.search = search
      if (genre) params.genre = genre
      const res = await getBooks(params)
      setBooks(res.data.results)
      setTotalPages(Math.ceil(res.data.count / 20))
    } catch (err) {
      console.error("Failed to fetch books:", err)
    } finally {
      setLoading(false)
    }
  }, [page, search, genre])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchBooks()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, genre])

  const handleScrape = async () => {
    setScraping(true)
    try {
      await triggerScrape(5)
      alert("Scraping started in background! Refresh in a few minutes.")
    } catch (err) {
      console.error("Scrape failed:", err)
    } finally {
      setScraping(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Book Insights</h1>
        <button
          onClick={handleScrape}
          disabled={scraping}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {scraping ? "Scraping..." : "Scrape Books"}
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {genres.map((g) => (
            <option key={g} value={g}>
              {g || "All Genres"}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="bg-gray-200 h-64 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
          {books.length === 0 && (
            <p className="text-center text-gray-500 py-8">No books found.</p>
          )}
        </>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 rounded-lg ${
                page === i + 1
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
