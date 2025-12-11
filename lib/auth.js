import jwt from "jsonwebtoken";

export function getUserFromRequest(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload; // { id, email, iat, exp }
  } catch (err) {
    console.error("JWT verify error:", err);
    return null;
  }
}
