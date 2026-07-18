import UserModel from "../../../db/models/user.model.js";
import { asyncHandler, successResponse } from "../../../lib/utils/response.js";

// Signup service
export const signup = asyncHandler(async (req, res, next) => {
  const { userName, email, password, gender, phoneNumber } = req.body;
  const [firstName, lastName] = userName.split(" ");

  //   Check if user name already exists
  if (await UserModel.findOne({ firstName, lastName })) {
    return next(new Error("user name already exists", { cause: 409 }));
  }

  //   Check if email already exists
  if (await UserModel.findOne({ email })) {
    return next(new Error("email already exists", { cause: 409 }));
  }

  //   Create user
  const [user] = await UserModel.create([
    {
      userName,
      email,
      password,
      gender,
      phoneNumber,
    },
  ]);

  return successResponse({
    res,
    statusCode: 201,
    message: "User created successfully",
    data: { user },
  });
});

// Login service
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email, password });

  if (!user) {
    return next(new Error("invalid email or password", { cause: 409 }));
  }
  return successResponse({
    res,
    statusCode: 200,
    message: "Login successful",
    data: { user },
  });
});
