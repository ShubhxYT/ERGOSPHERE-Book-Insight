export default function RatingStars({ rating }) {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.5

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <span key={i} className="text-yellow-400">
          ★
        </span>
      )
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <span key={i} className="text-yellow-400">
          ★
        </span>
      )
    } else {
      stars.push(
        <span key={i} className="text-gray-300">
          ★
        </span>
      )
    }
  }

  return <span className="inline-flex">{stars}</span>
}
