import mongoose from 'mongoose';
import { IOrderMessage, IRatingTypes, IReviewMessageDetails, ISellerDocument } from '@dtlee2k1/jobber-shared';
import { SellerModel } from '@users/models/seller.schema';
import { updateBuyerIsSellerProp } from '@users/services/buyer.service';

export async function getSellerById(sellerId: string) {
  const seller: ISellerDocument | null = await SellerModel.findOne({ _id: new mongoose.Types.ObjectId(sellerId) }).exec();
  return seller;
}

export async function getSellerByEmail(email: string) {
  const seller: ISellerDocument | null = await SellerModel.findOne({ email }).exec();
  return seller;
}

export async function getSellerByUsername(username: string) {
  const seller: ISellerDocument | null = await SellerModel.findOne({ username }).exec();
  return seller;
}

export async function getRandomSellers(size: number) {
  const sellers: ISellerDocument[] | null = await SellerModel.aggregate([{ $sample: { size } }]);
  return sellers;
}

export async function createSeller(sellerData: ISellerDocument) {
  const createdSeller: ISellerDocument = await SellerModel.create(sellerData);

  await updateBuyerIsSellerProp(`${createdSeller.email}`);

  return createdSeller;
}

export async function updateSeller(sellerId: string, sellerData: ISellerDocument) {
  const updatedSeller: ISellerDocument = (await SellerModel.findOneAndUpdate(
    { _id: sellerId },
    {
      $set: {
        fullName: sellerData.fullName,
        profilePicture: sellerData.profilePicture,
        profilePublicId: sellerData.profilePublicId,
        description: sellerData.description,
        country: sellerData.country,
        oneliner: sellerData.oneliner,
        skills: sellerData.skills,
        languages: sellerData.languages,
        responseTime: sellerData.responseTime,
        experience: sellerData.experience,
        education: sellerData.education,
        socialLinks: sellerData.socialLinks,
        certificates: sellerData.certificates
      }
    },
    {
      new: true
    }
  ).exec()) as ISellerDocument;

  return updatedSeller;
}

export async function updateTotalGigsCount(sellerId: string, count: number) {
  await SellerModel.updateOne({ _id: sellerId }, { $inc: { totalGigs: count } }).exec();
}

export async function updateSellerOngoingJobsProp(sellerId: string, ongoingJobs: number) {
  await SellerModel.updateOne({ _id: sellerId }, { $inc: { ongoingJobs } }).exec();
}

export async function updateSellerCancelledJobsProp(sellerId: string) {
  await SellerModel.updateOne({ _id: sellerId }, { $inc: { ongoingJobs: -1, cancelledJobs: 1 } }).exec();
}

// Consume data from Order service
export async function updateSellerCompletedJobsProp(data: IOrderMessage) {
  const { sellerId, ongoingJobs, completedJobs, totalEarnings, recentDelivery } = data;
  await SellerModel.updateOne(
    { _id: sellerId },
    {
      $inc: {
        ongoingJobs,
        completedJobs,
        totalEarnings
      },
      $set: { recentDelivery: new Date(recentDelivery!) }
    }
  ).exec();
}

// Consume data from Review service
export async function updateSellerReview(data: IReviewMessageDetails) {
  const ratingTypes: IRatingTypes = {
    '1': 'one',
    '2': 'two',
    '3': 'three',
    '4': 'four',
    '5': 'five'
  };
  const ratingKey = ratingTypes[`${data.rating}`];

  await SellerModel.updateOne(
    { _id: data.sellerId },
    {
      $inc: {
        ratingsCount: 1,
        ratingSum: data.rating,
        [`ratingCategories.${ratingKey}.value`]: data.rating,
        [`ratingCategories.${ratingKey}.count`]: 1
      }
    }
  ).exec();
}
