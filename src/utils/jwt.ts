import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  role: string;
}

//Sign a token with userId and role embedded
export const signToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");

  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

//Returns the decoded payload or throws if token is bad
export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");

  return jwt.verify(token, secret) as TokenPayload;
};
