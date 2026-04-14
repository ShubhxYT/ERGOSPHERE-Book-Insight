import { useState } from "react"
import { queryRAG } from "../api/client"

export default function ChatBox({ sessionId, onNewMessage }) {
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!question.trim() || loading) return

    setLoading(true)
    try {
      const res = await queryRAG(question, sessionId)
      onNewMessage({
        question,
        answer: res.data.answer,
        sources: res.data.sources,
      })
      setQuestion("")
    } catch (err) {
      console.error("RAG query failed:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question about books..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Asking...
          </span>
        ) : (
          "Ask"
        )}
      </button>
    </form>
  )
}
