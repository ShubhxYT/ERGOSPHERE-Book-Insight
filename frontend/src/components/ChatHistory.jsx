export default function ChatHistory({ messages }) {
  if (!messages.length) {
    return (
      <p className="text-gray-500 text-sm italic">No conversation yet. Ask a question to get started!</p>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((msg, idx) => (
        <div key={idx} className="border-b border-gray-100 pb-4">
          <p className="font-semibold text-blue-600 text-sm mb-2">Your Question:</p>
          <p className="text-gray-900 mb-3">{msg.question}</p>
          <p className="font-semibold text-green-600 text-sm mb-2">Answer:</p>
          <p className="text-gray-700 mb-2">{msg.answer}</p>
          {msg.sources && msg.sources.length > 0 && (
            <div className="text-xs text-gray-500 mt-2">
              <p className="font-semibold">Sources:</p>
              {msg.sources.map((source, i) => (
                <p key={i}>• {source.book_title}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
