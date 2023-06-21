import React, { useState, useRef, useEffect } from 'react';

const AddDepartmentForm = ({id, uIstate, cb, setId}) => {
  const [typeValue, setType] = useState('department');
  const [kindValue, setKind] = useState('standalone');
  const [parentDepartmentValue, setParentDepartment] = useState('');
  const [nameValue, setName] = useState('');
  const [emailValue, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const selectEl = useRef(null);
  const values = [typeValue, kindValue, parentDepartmentValue, nameValue, emailValue];
  let hasMoreThanOneManagment = false;
  useEffect(() => {
    selectEl.current.focus();
  }, []);
  const handleSubmit = (e, id) => {
    e.preventDefault();
    setSubmitted(true);
    if (typeValue ==='department' || kindValue === 'standalone' || parentDepartmentValue !== '') {
      const employers = addDepartment(uIstate, id, values, hasMoreThanOneManagment);
      const [,newState] = employers;
      hasMoreThanOneManagment = newState;
      if (hasMoreThanOneManagment) {
        setSubmitted(false);
      };
      cb(employers);
    }
  };
  const subdivision = uIstate[0].management[0] ? 
    uIstate[0].management[0].staff[0].subdivisions.length ? true : false
    :
    false
  return(
    <tr>
      <td className='p-0' colSpan={4}>
        <form className='input w-100' onSubmit={(e) => handleSubmit(e, id)}>
          <table>
            <tbody>
              <tr>
                <td className='vertical-align-middle'>
                  <select className="min-w-0 w-100" defaultValue='department' ref={selectEl} onChange={(e) => setType(e.target.value)}>
                    <option value="management">Управление</option>
                    <option value="department">Отдел</option>
                    <option value="sector">Сектор</option>
                  </select>
                </td>
                {typeValue === 'sector' && subdivision && 
                  <td>
                    <select className="min-w-0 w-100" onChange={(e) => setKind(e.target.value)}>
                      <option value="standalone">Самостоятельное с/п</option>
                      <option value="partOfAnother">В составе другого с/п</option>
                    </select>
                  </td>
                }
                {kindValue === 'partOfAnother' && 
                  <td>
                    <select className="min-w-0 w-100" onChange={(e) => setParentDepartment(e.target.value)}>
                      <option>Название родительского с/п</option>
                      {typeValue === 'sector' && uIstate[0].management[0] && uIstate[0].management[0].staff[0].subdivisions.map((department) => 
                        <option key={department.id}>{department.title}</option>
                      )}
                    </select>
                  </td>
                }
                <td className='vertical-align-middle'>
                  <input className='min-w-0' placeholder='Название' required onChange={(e) => setName(e.target.value)} value={nameValue}></input>
                </td>
                <td className='vertical-align-middle'>
                  <input className='min-w-0' placeholder='Email' onChange={(e) => setEmail(e.target.value)} value={emailValue} type='email'></input>
                </td>
                <td className='vertical-align-middle'>
                  <button className='btn m-0 ml-auto'>Сохранить</button>
                </td>
                <td className='vertical-align-middle'>
                  <button type='reset' className='btn m-0 ml-auto' onClick={() =>setId('')}>Отменить</button>
                </td>
              </tr>
              {parentDepartmentValue === '' && submitted && subdivision && <tr>
                <td colSpan={6} className='min-w-0'>Укажите название родительского структурного подразделения!</td>
              </tr>}
            </tbody>
          </table>
        </form>
      </td>
    </tr>
  )
};
const findMaxDepartmentIndex = (uIstate) => {
  let index = 0;
  const administration = uIstate[0];
  const managmentIds = administration.management[0].id;
  if (index < managmentIds) {
    index = managmentIds;
  }
  administration.management[0].staff[0].subdivisions.map((subdivision) => {
    const subdivisionId = subdivision.id;
    if (index < subdivisionId) {
      index = subdivisionId;
    }
    if (subdivision.subdivisions.length) {
      subdivision.subdivisions.map((sector) => {
        const sectorId = sector.id;
        if (index < sectorId) {
          index = sectorId;
        }
      })
    }
  });
  return index + 1;
};
const addDepartment = (state, id, values, hasMoreThanOneManagment) => {
  const [typeValue, kindValue, parentDepartmentValue, nameValue, emailValue] = values;
  const accumalator = [state[0]];
  const employers = state.reduce((acc, administration) => {
    const index = findMaxDepartmentIndex(state);
    if (typeValue === 'department') {
      const departmentObject = {
        "type" : "DEPARTMENT",
        people : [],
        subdivisions: [],
        id: index,
      };
      departmentObject.title = nameValue;
      departmentObject.email = emailValue;
      if (acc[0].management.length) {
        acc[0].management[0].staff[0].subdivisions.push(departmentObject);
      } else {
        const managementDescription = {
          staff: [{
            people: [],
            subdivisions: []
          }]
        };
        managementDescription.id = index;
        acc[0].management.push(managementDescription);
        acc[0].management[0].staff[0].subdivisions.push(departmentObject);
      }
    }
    else if (typeValue === 'sector') {
      const sectotObject = {
        "type": "SECTOR",
        people : [],
        id: index,
      };
      sectotObject.title = nameValue;
      sectotObject.email = emailValue;
      if (kindValue === 'standalone') {
        if (acc[0].management.length) {
          acc[0].management[0].staff[0].subdivisions.push(sectotObject)
        } else {
          const managementDescription = {
            staff: [{
              people: [],
              subdivisions: []
            }]
          };
          managementDescription.id = index;
          acc[0].management.push(managementDescription);
          acc[0].management[0].staff[0].subdivisions.push(sectotObject);
        }
      } else {
        const subdivision = acc[0].management[0].staff[0].subdivisions.find((subdivision) => {
          if (subdivision.title === parentDepartmentValue) {
            return true;
          } else {
            return false;
          }
        });
        subdivision.subdivisions.push(sectotObject);
      }
    } else {
      if (acc[0].management.length === 0) {
        const managementDescription = {
          staff: [{
            people: [],
            subdivisions: []
          }]
        };
        managementDescription.title = nameValue;
        managementDescription.email = emailValue;
        managementDescription.id = index;
        acc[0].management.push(managementDescription);
      } else {
        hasMoreThanOneManagment = true;
      }
    }
    return acc;
  }, accumalator);
  return [employers, hasMoreThanOneManagment];
};

export default AddDepartmentForm