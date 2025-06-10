import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log(token)

    if (!token) {
      return res.status(401).json({ message: "User not authenticated. No token found." });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decode || !decode.userId) {
      return res.status(401).json({ message: "Invalid token." });
    }

    req.id = decode.userId;
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);

    // Token expired or invalid signature
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token. Please log in again." });
    }

    return res.status(401).json({ message: "Authentication failed." });
  }
};

export default isAuthenticated;
