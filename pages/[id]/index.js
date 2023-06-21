import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import dbConnect from '../../lib/dbConnect'
const { User } = require('../../models/Email.cjs');
import jwt from 'jsonwebtoken'

const AdministrationPage = ({ user, token }) => {
  const [accessEnable, setAccessEnable] = useState('');
  useEffect(() => {
    if (user !== null) {
      fetch('/api/expired', {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({user, token}),
      }).then((responce) => {
        return responce.json();
      }).then((data) => {
        if (Date.now() - user.created_on < 7200000) {
          if (data.data.visited === false) {
            const userInfo = { token, id: user.id };
            localStorage.setItem('user', JSON.stringify(userInfo));
          }
        }
        if (JSON.parse(localStorage.getItem('user')).token === token && data.data.visited === true) {
          setAccessEnable('visited');
        }
        else if (JSON.parse(localStorage.getItem('user')).token === token) { 
          setAccessEnable(true);
        }
        else {
          setAccessEnable(false);
        }
        fetch('/api/visited', {
          method: 'POST',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(user),
        });
      })
    } else {
      setAccessEnable(false);
    }
  });
  const router = useRouter();
  let result;
  if (accessEnable === true) {
    router.push('/');
  } else if (accessEnable === false) {
    result = <h1 className='table-wrapper'>Аутентификация не произведена: неверный или просроченный токен</h1>
  } else if (accessEnable === 'visited') {
    result = <h1 className='table-wrapper'>Аутентификация не подтверждена</h1>
  } else {
    result = <></>
  }
  return (
    <> {result} </>
  )
}

export async function getServerSideProps(context) {
  await dbConnect()
  console.log(context);
  const {id} = context.query;
  const regexp = new RegExp(id);
  const user = await User.findOne({link: regexp}).lean();
  const ENC_KEY = process.env.ENC_KEY;
  var token = jwt.sign({id}, ENC_KEY,  {
    expiresIn: '7d'
  });
  if (user !== null) {
    user._id = user._id.toString();
  }
  return { props: { user, token } }
}

export default AdministrationPage
