import Link from 'next/link'
import dbConnect from '../lib/dbConnect'
const { Phone } = require('../models/Phone.cjs');
const { User } = require('../models/Email.cjs');
import React, { useState, useEffect } from 'react';
import PhonesFu from './phones-fu'

const Index = ({ Administrations, users }) => {
  const [accessEnable, setAccessEnable] = useState('');
  const [administration, setAdministration] = useState('');
  useEffect(() => {
    if (localStorage.getItem("user")) {
      const {id, token} = JSON.parse(localStorage.getItem('user'));
      const [user] = users.filter((el) => el.id === id);
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
        if (data.data.expired === false) {
          const [administration] = Administrations.filter((el) => el._id === user.id);
          setAdministration(administration);
          setAccessEnable(true);
        } else {
          setAccessEnable(false);
        }
      })
    }
    else {
      setAccessEnable(false);
    }
  });
  const administrations = [administration];
  const registered = true;
  const props = { administrations, registered };
  let result;
  if (accessEnable === true) {
    result = <PhonesFu {...props} />
  } else if (accessEnable === false) {
    result = <>
      <p className='table-wrapper'>Добро пожаловать на сайт телефонной книги Минфина ЛНР.</p>
      <p className='table-wrapper'>Для входа на сайт телефонной книги Минфина ЛНР нажмите на ссылку авторизация.</p>
      <div className="container pl-0">
        <Link className="btn nav bg-transparent" href="/registration">Авторизация</Link>
      </div>
    </>
  } else if (accessEnable === 'checkEmail') {
    result = <>
    <p className='table-wrapper'>Добро пожаловать на сайт телефонной книги Минфина ЛНР.</p>
    <p className='table-wrapper'>Для входа на сайт телефонной книги Минфина ЛНР перейдите по ссылке в письме направленном на адрес электронной почты с которого была произведена авторизация.</p>
    <div className="container pl-0">
      <Link className="btn nav" href="/registration">Авторизация</Link>
    </div>
  </>
  }
  else {
    result = <></>
  }
  return(
    <>
      {result}
    </> 
)}

  export async function getServerSideProps() {
    await dbConnect()
    const Users = await User.find({});

    const users = Users.map((doc) => {
     const administration = doc.toObject();
     administration._id = administration._id.toString();
     return administration;
    });

    const result = await Phone.find({})
    const Administrations = result.map((doc) => {
      const administration = doc.toObject();
      administration._id = administration._id.toString();
      return administration;
    })

  return { props: { Administrations, users } }
}

export default Index
