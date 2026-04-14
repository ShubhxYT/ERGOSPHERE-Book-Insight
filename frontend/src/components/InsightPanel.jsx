import { useState } from "react"

const TABS = ["Summary", "Genre", "Sentiment", "Recommendation"]

export default function InsightPanel({ book }) {
  const [activeTab, setActiveTab] = useState("Summary")

  const content = {
    Summary: book.ai_summary || "No summary generated yet.",
    Genre: book.ai_genre || "Not classified yet.",
    Sentiment: book.ai_sentiment || "Not analyzed yet.",
    Recommendation: book.ai_recommendation_text || "No recommendation yet.",
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">AI Insights</h2>
      <div className="flex border-b mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <p className="text-gray-700 leading-relaxed">{content[activeTab]}</p>
    </div>
  )
}
