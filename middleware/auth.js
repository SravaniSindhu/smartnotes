import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ error: "No token, access denied" });
  }

  let token;

  // ✅ Handle BOTH cases
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    token = authHeader; // your current format
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ FIXED

    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT ERROR:", err);
    res.status(401).json({ error: "Invalid token" });
  }
};

export default authMiddleware;
