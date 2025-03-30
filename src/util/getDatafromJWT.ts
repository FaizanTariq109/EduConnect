import jwt from "jsonwebtoken";

export const getDatafromJWT = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded;
  } catch (error) {
    console.error(error);
    throw new Error("Invalid token");
  }
};
