import jwt from "jsonwebtoken";

export function auth(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}
