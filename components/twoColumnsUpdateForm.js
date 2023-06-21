import React, { useState, useRef, useEffect } from 'react';

const TwoColumnsUpdateForm = ({id, uIstate, cb, type, setId}) => {
  const parentNode = document.querySelector(`[id='${id}']`);
  const children = parentNode.children;
  const [initialValue] = children;
  const [value, setValue] = useState(initialValue.textContent);
  const inputEl = useRef(null);
  const placeholder = id.toString().endsWith('2') ? 'email' : 'Название структурного подразделения';
  useEffect(() => {
    inputEl.current.focus();
  });
  if (value.includes(':')) {
    const [, phoneCode] = value.split(':');
    setValue(phoneCode.trim());
  }
  const handleSubmit = (e, id) => {
    e.preventDefault();
    const employers = update(uIstate, id, value, type);
    cb(employers);
  };
  return(
    <>
      {type === 'location' || type === 'email' || type === 'phone_code' ? 
        <form className='input w-100' id={id} onSubmit={(e) => handleSubmit(e, id)}>
          <table>
            <tbody>
              <tr>
                <td className='vertical-align-middle w-1056'>
                  <input className='min-w-0' ref={inputEl} onChange={(e) => setValue(e.target.value)} value={value}></input>
                </td>
                <td>
                  <button className='btn m-0 ml-auto'>Сохранить</button>
                </td>
                <td className='vertical-align-middle'>
                  <button type='reset' className='btn m-0 ml-auto' onClick={() =>setId('')}>Отменить</button>
                </td>
              </tr>
            </tbody>
          </table>
        </form> 
        : 
        <tr id={id}>
          <td colSpan="4">
            <form className='input w-100' onSubmit={(e) => handleSubmit(e, id)}>
              <table>
                <tbody>
                  <tr>
                    <td className='vertical-align-middle w-1056'>
                      {id.endsWith('2') ? 
                        <input className='min-w-0' ref={inputEl} placeholder={placeholder} onChange={(e) => setValue(e.target.value)} value={value} type="email"></input> :
                        <input className='min-w-0' ref={inputEl} placeholder={placeholder} onChange={(e) => setValue(e.target.value)} value={value} required></input>
                      }
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
      }
    </>
  )
};

const update = (state, id, value, type) => {
  const searchValue = String(id).endsWith('2') ? 'email' : 'department';
  const accumalator = [state[0]];
  if (type) {
    if (type === 'location') {
      accumalator[0].location = value;
    } else if (type === 'email') {
      accumalator[0].email = value;
    } else if (type === 'phone_code') {
      accumalator[0].phone_code = value;
    } else {
      if (accumalator[0].management[0].id === id.slice(0, id.length - 1)) {
        if (searchValue === 'email') {
          accumalator[0].management[0].email = value;
        } else {
          accumalator[0].management[0].title = value;
        }
      }
    }
    return [accumalator];
  }
  else {  
    const employers = state.reduce((acc, administration) => {
      const staff = administration.management[0].staff[0].subdivisions.reduce((accum, subdivision) => {
        if (String(subdivision.id) === id.slice(0, id.length - 1)) {
          if (searchValue === 'email') {
            subdivision.email = value;
          } else {
            subdivision.title = value;
          }
        }
        if (subdivision.subdivisions) {
          const sectors = subdivision.subdivisions.reduce((sectorAcc, sector) => {
            if (sector.id === id.slice(0, id.length - 1)) {
              if (searchValue === 'email') {
                sector.email = value;
              } else {
                sector.title = value;
              }
            }
          }, {});
        }
        return accum;
      }, {});
      if (staff.subdivisions) {
        acc.management[0].title = administration.management[0].title;
        acc.management[0].email = administration.management[0].email;
        acc.management[0].staff[0].subdivisions.push(staff);
      }
      return acc;
    }, accumalator);
    return [employers];
  }
};

export default TwoColumnsUpdateForm