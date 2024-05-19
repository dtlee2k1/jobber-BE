import { IConversationDocument } from '@dtlee2k1/jobber-shared';
import { Model, Schema, model } from 'mongoose';

const conversationSchema: Schema = new Schema(
  {
    conversationId: { type: String, required: true, unique: true, index: true },
    senderUsername: { type: String, required: true, index: true },
    receiverUsername: { type: String, required: true, index: true }
  },
  {
    versionKey: false
  }
);

const ConversationModel: Model<IConversationDocument> = model<IConversationDocument>('Conversation', conversationSchema);
export { ConversationModel };
