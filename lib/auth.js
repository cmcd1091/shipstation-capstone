import jwt from "jsonwebtoken";

export function getUserFromRequest(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return null;

    const token = authHeader.replace("Bearer ", "");

    const user = jwt.verify(token, process.env.JWT_SECRET);
    return user;
  } catch (err) {
    return null;
  }
}
