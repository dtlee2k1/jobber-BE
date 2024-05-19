import { ConversationModel } from '@chat/models/conversation.schema';
import { MessageModel } from '@chat/models/message.schema';
import { publishDirectMessage } from '@chat/queues/message.producer';
import { chatChannel, socketIOChatObject } from '@chat/server';
import { IConversationDocument, IMessageDocument, lowerCase } from '@dtlee2k1/jobber-shared';

export async function createConversation(conversationId: string, sender: string, receiver: string) {
  await ConversationModel.create({
    conversationId,
    senderUsername: sender,
    receiverUsername: receiver
  });
}

export async function addMessage(data: IMessageDocument) {
  const message: IMessageDocument = (await MessageModel.create(data)) as IMessageDocument;

  if (message.hasOffer) {
    const emailMessageDetails = {
      sender: data.senderUsername,
      amount: data.offer?.price,
      buyerUsername: lowerCase(`${data.receiverUsername}`),
      sellerUsername: lowerCase(`${data.senderUsername}`),
      title: data.offer?.gigTitle,
      description: data.offer?.description,
      deliveryInDays: data.offer?.deliveryInDays,
      template: 'offer'
    };
    // send email
    await publishDirectMessage(
      chatChannel,
      'jobber-order-notification',
      'order-email',
      JSON.stringify(emailMessageDetails),
      'Order email sent to notification service'
    );
  }

  socketIOChatObject.emit('message_received', message);
  return message;
}

export async function getConversation(sender: string, receiver: string) {
  const query = {
    $or: [
      { senderUsername: sender, receiverUsername: receiver },
      { senderUsername: receiver, receiverUsername: sender }
    ]
  };

  const conversation: IConversationDocument[] = (await ConversationModel.aggregate([{ $match: query }])) as IConversationDocument[];
  return conversation;
}

export async function getUserConversationList(username: string) {
  const query = {
    $or: [{ senderUsername: username }, { receiverUsername: username }]
  };
  const messages: IMessageDocument[] = await MessageModel.aggregate([
    { $match: query },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $group: {
        _id: '$conversationId',
        result: { $first: '$$ROOT' }
      }
    },
    {
      $sort: {
        'result.createdAt': -1
      }
    },
    {
      $project: {
        _id: '$result._id',
        conversationId: '$result.conversationId',
        sellerId: '$result.sellerId',
        buyerId: '$result.buyerId',
        receiverUsername: '$result.receiverUsername',
        receiverPicture: '$result.receiverPicture',
        senderUsername: '$result.senderUsername',
        senderPicture: '$result.senderPicture',
        body: '$result.body',
        file: '$result.file',
        gigId: '$result.gigId',
        isRead: '$result.isRead',
        hasOffer: '$result.hasOffer',
        createdAt: '$result.createdAt'
      }
    }
  ]);
  return messages;
}

export async function getMessages(sender: string, receiver: string) {
  const query = {
    $or: [
      { senderUsername: sender, receiverUsername: receiver },
      { senderUsername: receiver, receiverUsername: sender }
    ]
  };

  const messages: IMessageDocument[] = await MessageModel.aggregate([
    {
      $match: query
    },
    { $sort: { createdAt: 1 } }
  ]);
  return messages;
}

export async function getUserMessages(messageConversationId: string) {
  const messages: IMessageDocument[] = await MessageModel.aggregate([
    {
      $match: { conversationId: messageConversationId }
    },
    { $sort: { createdAt: 1 } }
  ]);
  return messages;
}

export async function updateOffer(messageId: string, type: string) {
  const message: IMessageDocument = (await MessageModel.findOneAndUpdate(
    { _id: messageId },
    {
      $set: {
        [`offer.${type}`]: true // type = "accepted" | "canceled"
      }
    },
    { new: true }
  )) as IMessageDocument;
  return message;
}

export async function markMessageAsRead(messageId: string) {
  const message: IMessageDocument = (await MessageModel.findOneAndUpdate(
    { _id: messageId },
    {
      $set: { isRead: true }
    },
    { new: true }
  )) as IMessageDocument;

  socketIOChatObject.emit('message_updated', message);
  return message;
}

export async function markMultipleMessagesAsRead(receiver: string, sender: string, messageId: string) {
  await MessageModel.updateMany(
    { senderUsername: sender, receiverUsername: receiver, isRead: false },
    {
      $set: { isRead: true }
    }
  );

  const message: IMessageDocument = (await MessageModel.findOne({ _id: messageId }).exec()) as IMessageDocument;

  socketIOChatObject.emit('message_updated', message);
  return message;
}
