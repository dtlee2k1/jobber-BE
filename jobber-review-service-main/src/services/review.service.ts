import { IReviewDocument, IReviewMessageDetails } from '@dtlee2k1/jobber-shared';
import { pool } from '@review/database';
import { publishFanoutMessage } from '@review/queues/review.producer';
import { reviewChannel } from '@review/server';

export async function addReview(data: IReviewDocument) {
  const { gigId, reviewerId, reviewerImage, sellerId, review, rating, orderId, reviewType, reviewerUsername, country } = data;
  const createdAtDate = new Date();
  const { rows } = await pool.query(
    `INSERT INTO reviews("gigId", "reviewerId", "reviewerImage", "sellerId", "review", "rating", "orderId", "reviewType", "reviewerUsername", "country", "createdAt")
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `,
    [gigId, reviewerId, reviewerImage, sellerId, review, rating, orderId, reviewType, reviewerUsername, country, createdAtDate as unknown]
  );
  const messageDetails: IReviewMessageDetails = {
    gigId: data.gigId,
    reviewerId: data.reviewerId,
    sellerId: data.sellerId,
    review: data.review,
    rating: data.rating,
    orderId: data.orderId,
    createdAt: `${createdAtDate}`,
    type: `${reviewType}` // buyer-review || seller-review
  };
  await publishFanoutMessage(
    reviewChannel,
    'jobber-review',
    JSON.stringify(messageDetails),
    'Review details sent to order and users services'
  );
  return rows[0] as IReviewDocument;
}

export async function getReviewsById(gigId: string) {
  const reviews = await pool.query('SELECT * FROM reviews WHERE reviews."gigId" = $1', [gigId]);

  return reviews.rows as IReviewDocument[];
}

export async function getReviewsBySellerId(sellerId: string) {
  const reviews = await pool.query('SELECT * FROM reviews WHERE reviews."sellerId" = $1 AND reviews."reviewType" = $2', [
    sellerId,
    'seller-review'
  ]);

  return reviews.rows as IReviewDocument[];
}
