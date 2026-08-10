import Mongoose from "mongoose";
import {
  Gender_Enum,
  PROVIDERS_ENUM,
  ROLES_ENUM,
} from "../../lib/constants/constants.js";

const userSchema = new Mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: [3, "First name must be at least 3 characters long"],
      maxLength: [20, "First name must be less than 20 characters long"],
    },
    lastName: {
      type: String,
      required: true,
      minLength: [3, "Last name must be at least 3 characters long"],
      maxLength: [20, "Last name must be less than 20 characters long"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: {
        name: "email_index",
        unique: true,
      },
    },
    password: {
      type: String,
      required: function () {
        return this.providers === PROVIDERS_ENUM.SYSTEM;
      },
      minLength: [8, "Password must be at least 8 characters long"],
    },
    oldPasswords: [String],

    gender: {
      type: String,
      enum: {
        values: Object.values(Gender_Enum),
        message: "gender must be a valid gender",
      },
      required: true,
      default: Gender_Enum.MALE,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(ROLES_ENUM),
        message: "role must be a valid role",
      },
      required: true,
      default: ROLES_ENUM.USER,
    },
    phoneNumber: {
      type: String,
      required: function () {
        return this.providers === PROVIDERS_ENUM.SYSTEM;
      },
    },
    changeCredentialsTime: Date,
    confirmEmail: Date,
    confirmEmailOtp: String,
    confirmEmailOtpExpiresAt: Date,
    forgotPasswordOtp: String,
    forgotPasswordOtpExpiresAt: Date,
    forgotPasswordOtpAttempts: Number,
    forgotPasswordOtpBlockedUntil: Date,
    confirmEmailOtpAttempts: { type: Number, default: 0 },
    confirmEmailOtpBlockedUntil: Date,
    picture: String,
    providers: {
      type: String,
      enum: {
        values: Object.values(PROVIDERS_ENUM),
        message: "provider must be a valid provider",
      },
      default: PROVIDERS_ENUM.SYSTEM,
    },
    deletedAt: Date,
    deletedBy: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    restoredAt: Date,
    restoredBy: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    // virtuals: {
    //   fullName: {
    //     set: function () {
    //       const [firstName, lastName] = this.get("fullName").split(" ");
    //       this.firstName = firstName;
    //       this.lastName = lastName;
    //     },
    //   },
    // },
  },
);

userSchema
  .virtual("userName")
  .set(function (value) {
    const [firstName, lastName] = value.split(" ");
    this.firstName = firstName;
    this.lastName = lastName;
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });
userSchema.index(
  { firstName: 1, lastName: 1 },
  { unique: true, name: "fullName_index" },
);
const UserModel = Mongoose.models.User || Mongoose.model("User", userSchema);

UserModel.syncIndexes();

export default UserModel;
