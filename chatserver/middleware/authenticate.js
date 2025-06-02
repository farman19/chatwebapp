import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies.token;
    // console.log(" Token from cookie:", token);

    if (!token) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // console.log(" Decoded token:", decode);

    if (!decode || !decode.userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.id = decode.userId; 
    next();
  } catch (error) {
    console.error(" JWT Error:", error.message);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

export default isAuthenticated;
