import { ISellerDocument } from '@dtlee2k1/jobber-shared';
import { BadRequestError } from '@users/error-handler';
import { sellerSchema } from '@users/schemes/seller';
import { createSeller, getSellerByEmail } from '@users/services/seller.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function seller(req: Request, res: Response, _next: NextFunction) {
  const { error } = await Promise.resolve(sellerSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Create seller() method error');
  }

  const checkIfSellerExist = await getSellerByEmail(req.body.email);
  if (checkIfSellerExist) {
    throw new BadRequestError('Seller already exist', 'Create seller() method error');
  }

  const seller: ISellerDocument = {
    email: req.body.email,
    fullName: req.body.fullName,
    profilePicture: req.body.profilePicture,
    profilePublicId: req.body.profilePublicId,
    username: req.currentUser!.username,
    description: req.body.description,
    country: req.body.country,
    oneliner: req.body.oneliner,
    skills: req.body.skills,
    languages: req.body.languages,
    responseTime: req.body.responseTime,
    experience: req.body.experience,
    education: req.body.education,
    socialLinks: req.body.socialLinks,
    certificates: req.body.certificates
  };

  const createdSeller: ISellerDocument = await createSeller(seller);

  res.status(StatusCodes.CREATED).json({
    message: 'Seller created successfully',
    seller: createdSeller
  });
}
