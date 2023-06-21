import dbConnect from '../../lib/dbConnect'
import jwt from 'jsonwebtoken'
const { User } = require('../../models/Email.cjs');

export default async (req, res) => {
  const { method } = req

  await dbConnect()

  switch (method) {
    case 'GET':
      try {
        const users = await User.find({}) /* find all the data in our database */
        res.status(200).json({ success: true, data: users })
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break
    case 'POST':
      try {
        const ENC_KEY = process.env.ENC_KEY;
        const user = await User.findById(req.body.user._id) /* find all the data in our database */
        jwt.verify(req.body.token, ENC_KEY, function(err, decoded) {
          if (err) {
            user.expired = true;
          } else {
            user.expired = false;
          }
        });
        await user.save();
        res.status(201).json({ success: true, data: user._doc })
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}
