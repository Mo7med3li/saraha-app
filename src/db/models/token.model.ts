import Mongoose from "mongoose";

const tokenSchema = new Mongoose.Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Number,
      required: true,
    },
    userId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const TokenModel =
  Mongoose.models.Token || Mongoose.model("Token", tokenSchema);

TokenModel.syncIndexes();

export default TokenModel;
