import React, { useState, useRef, useEffect } from 'react';

const AddForm = ({id, uIstate, cb, type, setId}) => {
  const [positionValue, setPosition] = useState('');
  const [fullNameValue, setFullName] = useState('');
  const [workPhoneValue, setWorkPhone] = useState('');
  const [mobilePhoneValue, setMobilePhone] = useState('');
  const inputEl = useRef(null);
  const values = [positionValue, fullNameValue, workPhoneValue, mobilePhoneValue];  
  useEffect(() => {
    inputEl.current.focus();
  },[]);
  const handleSubmit = (e, id) => {
    e.preventDefault();
    const employers = addAuthorityUser(uIstate, values, id, type);
    cb(employers);
  };
  return(
    <tr>
      <td className='p-0' colSpan={4}>
        <form className='input w-100' onSubmit={(e) => handleSubmit(e, id)}>
          <table>
            <tbody>
              <tr>
                <td className='vertical-align-middle'>
                  <input className='min-w-0' ref={inputEl} placeholder='Должность' onChange={(e) => setPosition(e.target.value)} value={positionValue} required></input>
                </td>
                <td className='vertical-align-middle'>
                  <input className='min-w-0' placeholder='Фамилия, имя, отчество' onChange={(e) => setFullName(e.target.value)} value={fullNameValue} required></input>
                </td>
                <td className='vertical-align-middle'>
                  <input className='min-w-0' placeholder='Рабочий телефон' onChange={(e) => setWorkPhone(e.target.value)} value={workPhoneValue}></input>
                </td>
                <td className='vertical-align-middle'>
                  <input className='min-w-0' placeholder='Мобильный телефон' onChange={(e) => setMobilePhone(e.target.value)} value={mobilePhoneValue}></input>
                </td>
                <td className='vertical-align-middle'>
                  <button className='btn m-0 ml-auto'>Сохранить</button>
                </td>
                <td className='vertical-align-middle'>
                  <button type='reset' className='btn m-0 ml-auto' onClick={() =>setId('')}>Отменить</button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </td>
    </tr>
  )
};

const findMaxIndex = (uIstate) => {
  let index = 0;
  const administration = uIstate[0];
  const ids = administration.authority.map((el) => Number(el.id));
  const biggestId = Math.max(...ids);
  if (index < biggestId) {
    index = biggestId;
  }
  const managmentIds = administration.management[0].staff[0].people.map((el) => Number(el.id));
  const managmentBiggestId = Math.max(...managmentIds);
  if (index < managmentBiggestId) {
    index = managmentBiggestId;
  }
  administration.management[0].staff[0].subdivisions.map((subdivision) => {
    const employersIds = subdivision.people.map((el) => Number(el.id));
    const employersBiggestId = Math.max(...employersIds);
    if (index < employersBiggestId) {
      index = employersBiggestId;
    }
    if (subdivision.subdivisions.length) {
      subdivision.subdivisions.map((sector) => {
        if (sector.people.length) {
          const employersIds = sector.people.map((el) => Number(el.id));
          const employersBiggestId = Math.max(...employersIds);
          if (index < employersBiggestId) {
            index = employersBiggestId;
          }
        }
      })
    }
  });
  return index + 1;
};

const addAuthorityUser = (uIstate, values, id, type) => {
  const [position, fullName, workPhone, mobilePhone] = values;
  const accumalator = [uIstate[0]];
  const index = findMaxIndex(uIstate);
  if (type) {
    uIstate.reduce((acc, administration) => {
      if (type === 'addManager') {
        if (accumalator[0].management[0].id === id) {
          let lastChild = 0;
          if (administration.management[0].staff[0].people.length) {
            lastChild = _.last(administration.management[0].staff[0].people)
          }
          else if (administration.management[0].staff[0].subdivisions.length) {
            lastChild = _.last(administration.management[0].staff[0].subdivisions)
            if (lastChild.people.length) {
              lastChild = _.last(lastChild.people);
            }
          }  
          const index = lastChild !== 0 ? Number(lastChild.id) + 1 : 2;
          const user = {
            id: index,
            position : position,
            full_name : fullName,
            work_phone : workPhone,
            mobile_phone : mobilePhone,
          }
          administration.management[0].staff[0].people.push(user)
        }
      }
      else {
        const staff = administration.management[0].staff[0].subdivisions.reduce((accum, subdivision, i) => {
          if (subdivision.id === id) {
            const user = {
              id: index,
              position : position,
              full_name : fullName,
              work_phone : workPhone,
              mobile_phone : mobilePhone,
            }
            subdivision.people.push(user);
          }
          if (subdivision.subdivisions) {
            const sectors = subdivision.subdivisions.reduce((sectorAcc, sector) => {
              if (sector.id === id) {
                const user = {
                  id: index,
                  position : position,
                  full_name : fullName,
                  work_phone : workPhone,
                  mobile_phone : mobilePhone,
                }
                sector.people.push(user);
              }
              return sectorAcc;
            }, {});
            if (sectors.people && sectors.people.length !== 0) {
              accum.subdivisions = [];
              accum.subdivisions.push(sectors);
            }
          }
          return accum;
        }, {});
        if (staff.people && staff.people.length !== 0) {
          staff.title = administration.management[0].title;
          staff.email = administration.management[0].email;
          const [staffUser] = staff.people;
          staffUser.position = position;
          staffUser.full_name = fullName;
          staffUser.work_phone = workPhone;
          staffUser.mobile_phone = mobilePhone;
        }
      }
    }, accumalator);
  } else {
    const authorityUser = {
      id: String(index),
      position : position,
      full_name : fullName,
      work_phone : workPhone,
      mobile_phone : mobilePhone,
    }
    accumalator[0].authority.push(authorityUser);
  }
  return [accumalator];
};

export default AddForm