import dbConnect from '../../lib/dbConnect'
import * as yup from 'yup';
const { Phone } = require('../../models/Phone.cjs');
const { User } = require('../../models/Email.cjs');
import jwt from 'jsonwebtoken'

const user = yup.object().shape({
  full_name: yup.string().required(),
  id: yup.string().required(),
  mobile_phone: yup.mixed.nullable,
  position: yup.string().required(),
  work_phone: yup.mixed.nullable
});

const department = yup.object().shape({
  type: yup.string().required(),
  people: yup.array().required(),
  subdivisions: yup.array().required(),
  id: yup.string().required(),
  title: yup.string().required()
});

const sector = yup.object().shape({
  type: yup.string().required(),
  people: yup.array().required(),
  id: yup.string().required(),
  title: yup.string().required()
});

const management = yup.object().shape({
  staff: yup.array().required(),
  id: yup.string().required(),
  title: yup.string().required()
});

const isValidAuthority = (administration) => {
  if (administration.authority.length) {
    const authority = administration.authority.filter((manager) => {
      if (!user.validateSync(manager)) {
        return true;
      } else {
        return false;
      }
    });
    if (administration.management.length) {
      const managements = administration.management.filter((item) => {
        if (!management.validateSync(item)) {
          return true;
        } else {
          return false;
        }
      });
      if (administration.management[0].staff[0].people.length) {
        const management = administration.management[0].staff[0].people.filter((manager) => {
          if (!user.validateSync(manager)) {
            return true;
          } else {
            return false;
          }
        });
        if (management.length === 0) {
          return true;
        } else {
          return false;
        }
      }
      else if (managements.length === 0) {
        return true;
      }
      else {
        return false;
      }
    }
    else if (authority.length === 0) {
      return true;
    } 
    else {
      return false;
    }
  }
};

const isValidManagement = (administration) => {
  if (administration.management.length && administration.management[0].staff[0].subdivisions && administration.management[0].staff[0].subdivisions.length !== 0) {
    const staff = administration.management[0].staff[0].subdivisions.reduce((acc ,subdivision) => {
      if (subdivision.people) {
        const people = subdivision.people.filter((employee) => {
          if (!user.validateSync(employee)) {
            return true;
          } else {
            return false;
          }
        });
        if (people.length === 0) {
          acc.valid = true;
        }
        else {
          acc.valid = false;
        }
      }
      if (subdivision.subdivisions) {
        subdivision.subdivisions.map((subdivision) => {
          if (subdivision.people) {
            const peopleInSector = subdivision.people.filter((employee) => {
              if (!user.validateSync(employee)) {
                return true;
              } else {
                return false;
              }
            });
            if (peopleInSector.length === 0) {
              acc.valid = true;
            }
            else {
              acc.valid = false;
            }
          }
          if (subdivision.type === "SECTOR") {
            if (sector.validateSync(subdivision)) {
              acc.valid = true;
            } else {
              acc.valid = false;
            }
          } else {
            throw new Error('Invalid');
          }
        });
      }
      if (subdivision.type === "DEPARTMENT") {
        if (department.validateSync(subdivision)) {
          acc.valid = true;
        } else {
          acc.valid = false;
        }
      }
      else if (subdivision.type === "SECTOR") {
        if (sector.validateSync(subdivision)) {
          acc.valid = true;
        } else {
          acc.valid = false;
        }
      } else {
        acc.valid = false;
      }
      return acc;
    }, {valid : ''});
    if (staff.valid === true) {
      return true;
    } else {
      return false;
    }
  }
};

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
        const tokenWithBearer = req.headers.authorization.slice(7, req.headers.authorization.length);
        const {token} = JSON.parse(tokenWithBearer);
        const ENC_KEY = process.env.ENC_KEY;
        jwt.verify(token, ENC_KEY, async function(err, decoded) {
          if (err) {
            console.log(err);
            res.status(401).json({ success: false })
          } else {
            if (isValidAuthority(req.body.administration) && isValidManagement(req.body.administration)) {
              const {administration} = req.body;
              const updatedAdministration = await Phone.findByIdAndUpdate(req.body._id, {
                authority: administration.authority, 
                management: administration.management, 
                location: administration.location,
                phone_code: administration.phone_code,
              }, {new: true});
              res.status(201).json({ success: true, data: updatedAdministration._doc });
            }
          }
        });
      } catch (error) {
        res.status(401).json({ success: false })
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}
