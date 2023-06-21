import dbConnect from '../../lib/dbConnect'
import jwt from 'jsonwebtoken'
const { User } = require('../../models/Email.cjs');

export default async (req, res) => {
  const { method } = req

  await dbConnect()

  switch (method) {
    case 'POST':
      try {
        const ENC_KEY = process.env.ENC_KEY;
        const users = await User.find({}) /* find all the data in our database */
        const filteredUsers = users.filter((el) => el.login === req.body.login)
        if (filteredUsers.length === 0) {
          var token = jwt.sign(req.body, ENC_KEY,  {
            expiresIn: '7d'
          });
          req.body.expired = false;
          req.body.visited = false;
          req.body.link = '';
          const user = new User(req.body);
          await user.save();
          res.status(201).json({ success: true, data: {user, token} })
        } 
        const [user] = filteredUsers;
        if (user.expired) {
          var token = jwt.sign(req.body, ENC_KEY,  {
            expiresIn: '7d'
          });
          user.expired = false;
          user.visited = false;
          user.link = '';
          await user.save();
          res.status(201).json({ success: true, data: {user, token} })
        }
        else {
          await User.deleteOne({login: req.body.login});
          var token = jwt.sign(req.body, ENC_KEY,  {
            expiresIn: '7d'
          });
          req.body.expired = false;
          req.body.visited = false;
          req.body.link = '';
          const user = await User.create(
            req.body
          ) /* create a new model in the database */
          res.status(201).json({ success: true, data: {user, token} })
        }
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}
