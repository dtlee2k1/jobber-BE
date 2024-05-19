import { IBuyerDocument } from '@dtlee2k1/jobber-shared';
import { BuyerModel } from '@users/models/buyer.schema';

export async function getBuyerByEmail(email: string) {
  const buyer: IBuyerDocument | null = await BuyerModel.findOne({ email }).exec();
  return buyer;
}

export async function getBuyerByUsername(username: string) {
  const buyer: IBuyerDocument | null = await BuyerModel.findOne({ username }).exec();
  return buyer;
}

export async function getRandomBuyers(size: number) {
  const buyers: IBuyerDocument[] | null = await BuyerModel.aggregate([{ $sample: { size } }]);
  return buyers;
}

export async function createBuyer(buyerData: IBuyerDocument) {
  const checkIfBuyerExists: IBuyerDocument | null = await getBuyerByEmail(`${buyerData.email}`);

  if (!checkIfBuyerExists) {
    await BuyerModel.create(buyerData);
  }
}

export async function updateBuyerIsSellerProp(email: string) {
  await BuyerModel.updateOne(
    { email },
    {
      $set: {
        isSeller: true
      }
    }
  ).exec();
}

export async function updateBuyerPurchasedGigsProp(buyerId: string, purchasedGigId: string, type: string) {
  await BuyerModel.updateOne(
    { _id: buyerId },
    type === 'purchased-gigs'
      ? {
          $push: {
            purchasedGigs: purchasedGigId
          }
        }
      : {
          $pull: {
            purchasedGigs: purchasedGigId
          }
        }
  ).exec();
}
