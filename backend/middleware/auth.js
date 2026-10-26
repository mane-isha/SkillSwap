
// const jwt = require("jsonwebtoken");

// function authMiddleware(req, res, next) {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({
//       message: "Please log in first.",
//     });
//   }

//   const token = authHeader.slice(7).trim();

//   if (!token) {
//     return res.status(401).json({
//       message: "Please log in first.",
//     });
//   }

//   try {
//     if (!process.env.JWT_SECRET) {
//       console.error("JWT_SECRET is not configured.");

//       return res.status(500).json({
//         message: "Authentication is not configured correctly.",
//       });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Current tokens use userId. The id fallback preserves
//     // compatibility with tokens issued by older code.
//     const userId = decoded.userId || decoded.id;

//     if (!userId) {
//       return res.status(401).json({
//         message: "Invalid token. Please log in again.",
//       });
//     }

//     req.userId = userId;
//     next();
//   } catch (error) {
//     if (
//       error.name === "TokenExpiredError" ||
//       error.name === "JsonWebTokenError" ||
//       error.name === "NotBeforeError"
//     ) {
//       return res.status(401).json({
//         message: "Your session is invalid or expired. Please log in again.",
//       });
//     }

//     console.error("Authentication error:", error.message);

//     return res.status(500).json({
//       message: "Could not verify your session.",
//     });
//   }
// }

// module.exports = authMiddleware;



//-------------------------
const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please log in to continue." });
  }
  try {
    const decoded = jwt.verify(header.slice(7).trim(), process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    if (!userId) return res.status(401).json({ message: "Invalid session. Please log in again." });
    req.userId = userId;
    next();
  } catch (error) {
    if (["TokenExpiredError", "JsonWebTokenError", "NotBeforeError"].includes(error.name)) {
      return res.status(401).json({ message: "Your session expired. Please log in again." });
    }
    console.error("Authentication error:", error.message);
    return res.status(500).json({ message: "Could not verify your session." });
  }
};
