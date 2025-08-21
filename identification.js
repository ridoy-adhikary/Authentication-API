const jwt = require('jsonwebtoken');

exports.identifier = (req, res, next) => {
  let token;

  // Check headers or cookies
  if (req.headers.client === 'not-browser') {
    token = req.headers.authorization;
  } else {
    token = req.cookies['Authorization'];
  }

  if (!token) {
    return res.status(403).json({ success: false, message: 'Unauthorized: No token provided' });
  }

  try {
    // Support "Bearer <token>" format
    const userToken = token.includes(' ') ? token.split(' ')[1] : token;

    // Verify JWT
    const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);

    // Attach payload to request
    req.user = jwtVerified;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};
