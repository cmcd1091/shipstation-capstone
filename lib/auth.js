import jwt from "jsonwebtoken";

export function getUserFromRequest(request) {
  try {
    const authHeader = request.headers.get("authorization");
    let token = null;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      const url = new URL(request.url);
      token = url.searchParams.get("token");
    }

    if (!token) return null;

    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}
