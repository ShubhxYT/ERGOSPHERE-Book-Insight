import { Link } from "react-router-dom"
import RatingStars from "./RatingStars"

export default function BookCard({ book }) {
  return (
    <Link
      to={`/books/${book.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
    >
      <div className="aspect-[2/3] bg-gray-100">
        <img
          src={book.cover_image_url}
          alt={book.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
          {book.title}
        </h3>
        <div className="flex items-center justify-between">
          <RatingStars rating={book.rating} />
          <span className="text-xs text-gray-500">{book.rating}/5</span>
        </div>
        <p className="text-xs text-gray-600 mt-2">{book.genre}</p>
        <p className="text-sm font-semibold text-gray-900 mt-2">{book.price}</p>
      </div>
    </Link>
  )
}
