import React, { useState  } from 'react';
import dbConnect from '../lib/dbConnect'
const { Phone } = require('../models/Phone.cjs');
import useSpinner from 'use-spinner';
import 'use-spinner/assets/use-spinner.css';
import Link from 'next/link'

const Registration = ({ administrations }) => {
  const [login, setLogin] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState('false');
  const [loading, setLoading] = useState('false');
  let result;
  if (submitted === 'true' && !error) {
    result = <p>Вы успешно авторизированы. Проверьте Ваш email!</p>;
  } else if (submitted === 'false') {
    result = <></>
  }
  else {
    if (error === 'denied') {
      result = <p>Авторизация по указанному email запрещена!</p>;
    } else {
      result = <p>Данный email уже зарегистрирован!</p>;
    }
  }
  const handleSubmit = async(e, login) => {
    e.preventDefault(); 
    const values = {login};
    const filteredEmails = administrations.filter((el) => el.email === login);
    if (filteredEmails.length) {
      const [administration] = filteredEmails;
      values.id = administration._id;
      setLoading(true);
      const mySlowCall = async () => {
        const res = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values),
        }).then((responce) => {
          return responce.json();
        });
        if (res.success !== false) {
          values.token = res.data.token;
          const responce = await fetch('/api/email', {
            method: 'POST',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(values),
          })
          if (responce.status === 200) {
            console.log('Response succeeded!');
            setSubmitted('true');
            setLogin('');
            setError('');
          }
        } else {
          setError('exist');
          setSubmitted('error');
        }
      }
      const spinned = useSpinner(mySlowCall);
      await spinned();
      setLoading(false);
    } else {
      setError('denied');
      setSubmitted('true');
    }
  };
  return(
    <>
      <div className="container pl-0">
        <Link className="btn nav bg-transparent" href="/">Главная</Link>
      </div>
      <form className='input bg-transparent pl-0' onSubmit={(e) => handleSubmit(e, login)}>
        <label htmlFor="email">Введите Вашу электронную почту</label>
        <input id="email" placeholder="email" name="name" value={login} onChange={(e)=>setLogin(e.target.value)} required type="email"></input>
        <button className='btn'>Авторизироваться</button>
      </form>
      {submitted !== 'false' && <div className='table-wrapper'>
        {result}
      </div>}
      {loading === true && <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>}
    </>
  )
}

export async function getServerSideProps() {
  await dbConnect()

  const result = await Phone.find({})
  const administrations = result.map((doc) => {
    const administration = doc.toObject()
    administration._id = administration._id.toString();
    return administration
  })

  return { props: { administrations: administrations } }
}

export default Registration