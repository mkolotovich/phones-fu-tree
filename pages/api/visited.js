import dbConnect from '../../lib/dbConnect'
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
        const user = await User.findById(req.body._id) /* find all the data in our database */
        user.visited = true;
        await user.save();
        res.status(201).json({ success: true, userData: user._doc })
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}
