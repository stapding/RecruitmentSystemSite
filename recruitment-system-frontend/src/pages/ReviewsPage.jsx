import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";

const ReviewsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortType, setSortType] = useState("newest");
  const [showModal, setShowModal] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загрузка всех отзывов
        const reviewsResponse = await fetch(
          "http://localhost:5000/api/reviews"
        );
        if (!reviewsResponse.ok) throw new Error("Ошибка загрузки отзывов");
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData);

        // Проверка существующего отзыва
        if (user?.id) {
          const checkResponse = await fetch(
            `http://localhost:5000/api/reviews/user/${user.id}`
          );
          if (!checkResponse.ok) throw new Error("Ошибка проверки отзыва");
          const checkData = await checkResponse.json();
          setExistingReview(checkData.exists ? checkData.review : null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const StarRating = ({ rating, onRate }) => {
    return (
      <div className='star-rating'>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? "filled" : ""}`}
            onClick={() => onRate(star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const sortedReviews = useMemo(() => {
    const sortFunctions = {
      newest: (a, b) => new Date(b.review_date) - new Date(a.review_date),
      oldest: (a, b) => new Date(a.review_date) - new Date(b.review_date),
      highest: (a, b) => b.rating - a.rating,
      lowest: (a, b) => a.rating - b.rating,
    };
    return [...reviews].sort(sortFunctions[sortType]);
  }, [reviews, sortType]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubmitReview = async () => {
    if (!user?.id) {
      setFormError("Требуется авторизация");
      return;
    }

    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setFormError("Выберите рейтинг от 1 до 5");
      return;
    }

    if (!reviewText.trim() || reviewText.trim().length < 10) {
      setFormError("Отзыв должен содержать минимум 10 символов");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: reviewText.trim(),
          rating: selectedRating,
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.validation?.[0]?.message || "Ошибка сервера"
        );
      }

      setReviews([data.review, ...reviews]);
      setExistingReview(data.review);
      setShowModal(false);
      setReviewText("");
      setSelectedRating(0);
      setFormError("");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!existingReview) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/reviews/${existingReview.review_id}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Ошибка удаления отзыва");

      setReviews(
        reviews.filter((r) => r.review_id !== existingReview.review_id)
      );
      setExistingReview(null);
    } catch (err) {
      setFormError(err.message);
    }
  };

  if (loading) return <div className='loading'>Загрузка отзывов...</div>;
  if (error) return <div className='error'>Ошибка: {error}</div>;

  return (
    <div className='reviews-page'>
      <div className='reviews-header'>
        <h2>Отзывы пользователей</h2>
        <div className='reviews-controls'>
          {isAuthenticated && (
            <div className='review-actions'>
              {existingReview ? (
                <button
                  onClick={handleDeleteReview}
                  className='delete-review-btn'
                >
                  Удалить отзыв
                </button>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className='add-review-btn'
                >
                  Написать отзыв
                </button>
              )}
            </div>
          )}

          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className='sort-select'
          >
            <option value='newest'>Сначала новые</option>
            <option value='oldest'>Сначала старые</option>
            <option value='highest'>Высокий рейтинг</option>
            <option value='lowest'>Низкий рейтинг</option>
          </select>
        </div>
      </div>

      <div className='reviews-container'>
        <table className='reviews-table'>
          <thead>
            <tr>
              <th>Отзыв</th>
              <th>Рейтинг</th>
              <th>Дата</th>
              <th>Пользователь</th>
            </tr>
          </thead>
          <tbody>
            {sortedReviews.map((review) => (
              <tr key={review.review_id}>
                <td className='review-text'>{review.text}</td>
                <td className='review-rating'>
                  <span className='stars'>
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                  <span className='numeric'>({review.rating}/5)</span>
                </td>
                <td className='review-date'>
                  {formatDate(review.review_date)}
                </td>
                <td className='username'>@{review.username}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className='reviews-stats'>
          <div className='stat-item'>
            <span className='stat-label'>Всего отзывов:</span>
            <span className='stat-value'>{reviews.length}</span>
          </div>
          <div className='stat-item'>
            <span className='stat-label'>Средний рейтинг:</span>
            <span className='stat-value'>
              {reviews.length > 0
                ? (
                    reviews.reduce((sum, review) => sum + review.rating, 0) /
                    reviews.length
                  ).toFixed(1)
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {showModal && (
        <div className='modal-overlay'>
          <div className='review-modal'>
            <h3>Ваш отзыв</h3>

            <div className='form-group'>
              <label>Рейтинг:</label>
              <StarRating
                rating={selectedRating}
                onRate={(rating) => {
                  setSelectedRating(rating);
                  setFormError("");
                }}
              />
              {!selectedRating && (
                <div className='form-error'>Укажите рейтинг</div>
              )}
            </div>

            <div className='form-group'>
              <label>Текст отзыва:</label>
              <textarea
                value={reviewText}
                onChange={(e) => {
                  setReviewText(e.target.value);
                  setFormError("");
                }}
                rows='5'
                placeholder='Напишите ваш отзыв...'
                minLength='10'
              />
              {reviewText.trim().length < 10 && (
                <div className='form-error'>Минимум 10 символов</div>
              )}
            </div>

            {formError && <div className='form-error'>{formError}</div>}

            <div className='modal-actions'>
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className='submit-btn'
              >
                {submitting ? "Сохранение..." : "Сохранить"}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormError("");
                }}
                className='cancel-btn'
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
