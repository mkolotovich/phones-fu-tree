import React, { useState, useRef, useEffect  } from 'react';

const UpdateForm = ({id, uIstate, cb, setId}) => {
  const parentNode = document.querySelector(`[id='${id}']`);
  const children = parentNode.children;
  const [initialPosition, initialFullName, initialWorkPhone, initialMobilePhone] = children;
  const [positionValue, setPosition] = useState(initialPosition.textContent);
  const [fullNameValue, setFullName] = useState(initialFullName.textContent);
  const [workPhoneValue, setWorkPhone] = useState(initialWorkPhone.textContent);
  const [mobilePhoneValue, setMobilePhone] = useState(initialMobilePhone.textContent);
  const values = [positionValue, fullNameValue, workPhoneValue, mobilePhoneValue];  
  const inputEl = useRef(null);
  useEffect(() => {
    inputEl.current.focus();
  }, []);
  const handleSubmit = (e, id) => {
    e.preventDefault();
    const employers = updateById(uIstate, id, values);
    cb(employers);
  };
  return(
    <tr>
      <td className='p-0' colSpan={8}>
        <form className='input w-100' onSubmit={(e) => handleSubmit(e, id)}>
          <table>
            <tbody>
              <tr id={id}>
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

const updateById = (state, id, values) => {
  const [position, fullName, workPhone, mobilePhone] = values;
  const accumalator = [state[0]];
  const employers = state.reduce((acc, administration) => {
    const authority = administration.authority.filter((manager) => {
      if (manager.id === id) {
        return true;
      } else {
        return false;
      }
    });
    const management = administration.management[0].staff[0].people.filter((manager) => {
      if (manager.id === id) {
        return true;
      } else {
        return false;
      }
    });
    const staff = administration.management[0].staff[0].subdivisions.reduce((accum, subdivision) => {
      const people = subdivision.people.filter((employee) => {
        if (employee.id === id) {
          return true;
        } else {
          return false;
        }
      });
      if (people.length !== 0) {
        accum.title = subdivision.title;
        accum.email = subdivision.email;
        accum.people = people;
      }
      if (subdivision.subdivisions) {
        const sectors = subdivision.subdivisions.reduce((sectorAcc, sector) => {
          const peopleInSector = sector.people.filter((employee) => {
            if (employee.id === id) {
              return true;
            } else {
              return false;
            }
          });
          if (peopleInSector.length !== 0) {
            accum.title = subdivision.title;
            accum.email = subdivision.email;
            sectorAcc.title = sector.title;
            sectorAcc.email = sector.email;
            sectorAcc.people = peopleInSector;
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
    if (authority.length !== 0 ) {
      const [authorityUser] = authority;
      authorityUser.position = position;
      authorityUser.full_name = fullName;
      authorityUser.work_phone = workPhone;
      authorityUser.mobile_phone = mobilePhone;
    }
    if (management.length !== 0) {
      const [managementUser] = management;
      managementUser.position = position;
      managementUser.full_name = fullName;
      managementUser.work_phone = workPhone;
      managementUser.mobile_phone = mobilePhone;
    }
    if (staff.people && staff.people.length !== 0) {
      staff.title = administration.management[0].title;
      staff.email = administration.management[0].email;
      const [staffUser] = staff.people;
      staffUser.position = position;
      staffUser.full_name = fullName;
      staffUser.work_phone = workPhone;
      staffUser.mobile_phone = mobilePhone;
    }
    if (staff.subdivisions) {
      const [staffUser] = staff.subdivisions[0].people;
      staffUser.position = position;
      staffUser.full_name = fullName;
      staffUser.work_phone = workPhone;
      staffUser.mobile_phone = mobilePhone;
    }
    return acc;
  }, accumalator);
  return [employers];
};

export default UpdateForm