require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const clientId = process.env.GG_CLIENT_ID;
const client = new OAuth2Client(clientId);
const User = require("../models/UserModel");

async function verifyToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: client_id,
  });
  const payload = ticket.getPayload();
  //Xử lý payload, lưu tt ng dùng vào database
  return payload;
}

module.exports = {
  googleLogin: async (req, res) => {
    const { token } = req.body;
    const payload = await verifyToken(token);

    const { email, name, sub } = payload;
    let account = await User.findOne({ email, googleId: sub });
    if (!account) {
      account = await User.create({
        name: name,
        email: email,
        googleId: sub,
      });
    }
    return res.status(200).json(account);
  },
};
