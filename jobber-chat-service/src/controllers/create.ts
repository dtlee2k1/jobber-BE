import crypto from 'crypto';

import { BadRequestError } from '@chat/error-handler';
import { messageSchema } from '@chat/schemes/message';
import { NextFunction, Request, Response } from 'express';
import { IMessageDocument, uploadImages } from '@dtlee2k1/jobber-shared';
import { UploadApiResponse } from 'cloudinary';
import { addMessage, createConversation } from '@chat/services/message.service';
import { StatusCodes } from 'http-status-codes';

export async function message(req: Request, res: Response, _next: NextFunction) {
  const { error } = await Promise.resolve(messageSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Create message() method error');
  }

  let file: string = req.body.file;

  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters = randomBytes.toString('hex');

  let uploadResult: UploadApiResponse;
  if (file) {
    uploadResult = (
      req.body.fileType === 'zip' ? await uploadImages(file, `${randomCharacters}.zip`) : await uploadImages(file)
    ) as UploadApiResponse;

    if (!uploadResult.public_id) {
      throw new BadRequestError('File upload error. Try again', 'Create message() method error');
    }

    file = uploadResult.secure_url;
  }

  const messageData: IMessageDocument = {
    conversationId: req.body.conversationId,
    body: req.body.body,
    file,
    fileType: req.body.fileType,
    fileSize: req.body.fileSize,
    fileName: req.body.fileName,
    gigId: req.body.gigId,
    buyerId: req.body.buyerId,
    sellerId: req.body.sellerId,
    senderUsername: req.body.senderUsername,
    senderPicture: req.body.senderPicture,
    receiverUsername: req.body.receiverUsername,
    receiverPicture: req.body.receiverPicture,
    isRead: req.body.isRead,
    hasOffer: req.body.hasOffer,
    offer: req.body.offer
  };

  if (!req.body.hasConversationId) {
    await createConversation(`${messageData.conversationId}`, `${messageData.senderUsername}`, `${messageData.receiverUsername}`);
  }
  await addMessage(messageData);
  res.status(StatusCodes.CREATED).json({
    message: 'Message added',
    conversationId: req.body.conversationId,
    messageData
  });
}
