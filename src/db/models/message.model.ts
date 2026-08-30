import Mongoose from "mongoose";

const messageSchema = new Mongoose.Schema(
  {
    content: {
      type: String,
      minLength: [3, "Content must be at least 3 characters long"],
      maxLength: [20000, "Content must be less than 20000 characters long"],
      required: function (this: { attachments?: { length: number }[] }) {
        return !this.attachments?.length;
      },
    },
    attachments: [
      {
        imageUrl: String,
        asset_id: String,
      },
    ],
    senderId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiverId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentMessageId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

messageSchema.virtual("sender", {
  ref: "User",
  localField: "senderId",
  foreignField: "_id",
  justOne: true,
  select: "-password -confirmEmailOtpAttempts -oldPasswords",
});
messageSchema.virtual("receiver", {
  ref: "User",
  localField: "receiverId",
  foreignField: "_id",
  select: "-password -confirmEmailOtpAttempts -oldPasswords",
  justOne: true,
});

messageSchema.virtual("parentMessage", {
  ref: "Message",
  localField: "parentMessageId",
  foreignField: "_id",
  justOne: true,
});

messageSchema.virtual("replies", {
  ref: "Message",
  localField: "_id",
  foreignField: "parentMessageId",
});

messageSchema.index({ parentMessageId: 1 });
messageSchema.index({ receiverId: 1, createdAt: -1 });

const MessageModel =
  Mongoose.models.Message || Mongoose.model("Message", messageSchema);

MessageModel.syncIndexes();

export default MessageModel;
