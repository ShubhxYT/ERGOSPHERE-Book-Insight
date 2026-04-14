import { useState, useEffect } from "react"
import { getChatHistory } from "../api/client"
import ChatBox from "../components/ChatBox"
import ChatHistory from "../components/ChatHistory"

function getSessionId() {
  let sessionId = localStorage.getItem("qa_session_id")
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem("qa_session_id", sessionId)
  }
  return sessionId
}

export default function QAPage() {
  const [sessionId] = useState(getSessionId)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await getChatHistory(sessionId)
        setMessages(res.data.results || res.data || [])
      } catch (err) {
        console.error("Failed to load chat history:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [sessionId])

  const handleNewMessage = (msg) => {
    setMessages((prev) => [msg, ...prev])
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Ask About Books
      </h1>
      <p className="text-gray-500 mb-6">
        Ask questions about any book in our collection. Powered by RAG + Groq AI.
      </p>

      <div className="mb-8">
        <ChatBox sessionId={sessionId} onNewMessage={handleNewMessage} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Conversation History</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <ChatHistory messages={messages} />
        )}
      </div>
    </div>
  )
}
