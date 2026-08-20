import Mongoose from "mongoose";
import {
  Gender_Enum,
  PROVIDERS_ENUM,
  ROLES_ENUM,
} from "../../lib/constants/constants.js";

const messageSchema = new Mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      minLength: [3, "Content must be at least 3 characters long"],
      maxLength: [20000, "Content must be less than 20000 characters long"],
      required: function () {
        return this.attachments.length === 0;
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
  },

  {
    timestamps: true,
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
const MessageModel =
  Mongoose.models.Message || Mongoose.model("Message", messageSchema);

MessageModel.syncIndexes();

export default MessageModel;
