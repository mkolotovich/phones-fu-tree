import dbConnect from '../lib/dbConnect'
const { Phone } = require('../models/Phone.cjs');
import React, { useState } from 'react';
import UpdateForm from '../components/updateForm'
import AddForm from '../components/addForm'
import AddDepartmentForm from '../components/addDepartmentForm'
import TwoColumnsUpdateForm from '../components/twoColumnsUpdateForm'
import { usePopper } from 'react-popper';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFloppyDisk } from '@fortawesome/free-regular-svg-icons'

const findByName = (state, value) => {
  const accumalator = {
    hidden: true,
    authority: [], 
    management: [
      {
        staff: [
          {
            people: [],
            subdivisions: []
          }
        ]
      }
  ]};
  const employers = state.reduce((acc, administration) => {
    const authority = administration.authority.filter((manager) => {
      if (manager.full_name.includes(value)) {
        return true;
      } else {
        return false;
      }
    });
    const management = administration.management[0].staff[0].people.filter((manager) => {
      if (manager.full_name.includes(value)) {
        return true;
      } else {
        return false;
      }
    });
    const staff = administration.management[0].staff[0].subdivisions.reduce((accum, subdivision) => {
      const people = subdivision.people.filter((employee) => {
        if (employee.full_name.includes(value)) {
          return true;
        } else {
          return false;
        }
      });
      if (people.length !== 0) {
        accum.title = subdivision.title;
        accum.email = subdivision.email;
        accum.people = people;
        accum.id = subdivision.id;
      }
      if (subdivision.subdivisions) {
        const sectors = subdivision.subdivisions.reduce((sectorAcc, sector) => {
          const peopleInSector = sector.people.filter((employee) => {
            if (employee.full_name.includes(value)) {
              return true;
            } else {
              return false;
            }
          });
          if (peopleInSector.length !== 0) {
            accum.title = subdivision.title;
            accum.email = subdivision.email;
            accum.id = subdivision.id;
            sectorAcc.title = sector.title;
            sectorAcc.email = sector.email;
            sectorAcc.people = peopleInSector;
            sectorAcc.id = sector.id;
          } 
          return sectorAcc;
        }, {});
        if (sectors.people && sectors.people.length !== 0) {
          if (!accum.subdivisions) {
            accum.subdivisions = [];
          }
          accum.subdivisions.push(sectors);
        }
      }
      return accum;
    }, {});
    if (authority.length !== 0 ) {
      acc.authority.push(...authority);
    }
    if (management.length !== 0) {
      acc.management[0].staff[0].people.push(...management);
      acc.management[0].title = administration.management[0].title;
      acc.management[0].email = administration.management[0].email;
      acc.management[0].id = administration.management[0].id;
    }
    if (staff.people && staff.people.length !== 0 || staff.subdivisions) {
      acc.management[0].title = administration.management[0].title;
      acc.management[0].email = administration.management[0].email;
      acc.management[0].staff[0].subdivisions.push(staff);
      acc.management[0].id = administration.management[0].id;
    }
    let peopleInSubdivision = 0;
    if (acc.management[0].staff[0].subdivisions.length) {
      if (acc.management[0].staff[0].subdivisions[0].people) {
        if (acc.management[0].staff[0].subdivisions[0].people.length) {
          peopleInSubdivision = acc.management[0].staff[0].subdivisions[0].people.length
        }
      } 
    }
    const subdivisionLength = staff.subdivisions ? staff.subdivisions.length : 0; 
    if (acc.authority.length + acc.management[0].staff[0].people.length + subdivisionLength + peopleInSubdivision === 1) {
      if (!acc.location) {acc.location = administration.location;}
      if (!acc.phone_code) {acc.phone_code = administration.phone_code;}
      if (!acc.email) {acc.email = administration.email;}
      if (!acc._id) { acc._id = administration._id; }
      acc.hidden = false;
    }
    if (acc.authority.length + acc.management[0].staff[0].people.length + subdivisionLength + peopleInSubdivision > 1) {
      if (!acc._id) { acc._id = administration._id; }
      acc.location = administration.location;
      acc.phone_code = administration.phone_code;
      acc.email = administration.email;
      acc.hidden = false;
    }
    acc._id = administration._id; 
    return acc;
  }, accumalator);
  return employers;
};

const deleteById = (state, id) => {
  const accumalator = [state[0]];
  const employers = state.reduce((acc, administration) => {
    const authority = administration.authority.filter((manager) => {
      if (manager.id !== id) {
        return true;
      } else {
        return false;
      }
    });
    if (administration.management.length) {
      const management = administration.management[0].staff[0].people.filter((manager) => {
        if (manager.id !== id) {
          return true;
        } else {
          return false;
        }
      });
      acc[0].management[0].staff[0].people = management;
    }
    if (administration.management.length && administration.management[0].staff[0].subdivisions && administration.management[0].staff[0].subdivisions.length !== 0) {
      const staff = administration.management[0].staff[0].subdivisions.reduce((accum, subdivision) => {
        const people = subdivision.people.filter((employee) => {
          if (employee.id !== id) {
            return true;
          } else {
            return false;
          }
        });
        if (people) {
          accum.title = subdivision.title;
          accum.email = subdivision.email;
          subdivision.people = people;
        }
        if (subdivision.subdivisions) {
          const sectors = subdivision.subdivisions.reduce((sectorAcc, sector) => {
            const peopleInSector = sector.people.filter((employee) => {
              if (employee.id !== id) {
                return true;
              } else {
                return false;
              }
            });
            if (peopleInSector) {
              accum.title = subdivision.title;
              accum.email = subdivision.email;
              sectorAcc.title = sector.title;
              sectorAcc.email = sector.email;
              sector.people = peopleInSector;
            } 
            return sectorAcc;
          }, {});
          if (sectors.people) {
            accum.subdivisions = [];
            accum.subdivisions.push(sectors);
          }
        }
        return accum;
      }, {});
      if (staff.people && staff.people.length !== 0) {
        const [staffUser] = staff.people;
        staffUser.position = position;
        staffUser.full_name = fullName;
        staffUser.work_phone = workPhone;
        staffUser.mobile_phone = mobilePhone;
    }
    }
    if (authority) {
      acc[0].authority = authority;
    }
    return acc;
  }, accumalator);
  return employers;
};

const moveDown = (state, id) => {
  const accumalator = [state[0]];
  const employers = state.reduce((acc, administration) => {
    const index = administration.authority.findIndex((manager) => manager.id === id);
    const authority = administration.authority.reduce((acc, manager, i) => {
      if (index !== administration.authority.length - 1 && index === i) {
        const nextItem = acc[i + 1];
        acc[i + 1] = manager;
        acc[i] = nextItem;
      } 
      return acc;
    }, administration.authority);
    if (administration.management.length) {
      const index = administration.management[0].staff[0].people.findIndex((manager) => manager.id === id);
      const management = administration.management[0].staff[0].people.reduce((acc, manager, i) => {
        if (index !== administration.management[0].staff[0].people.length - 1 && index === i) {
          const nextItem = acc[i + 1];
          acc[i + 1] = manager;
          acc[i] = nextItem;
        } 
        return acc;
      }, administration.management[0].staff[0].people);
      acc[0].management[0].staff[0].people = management;
    }
    if (administration.management.length && administration.management[0].staff[0].subdivisions && administration.management[0].staff[0].subdivisions.length !== 0) {
      const staff = administration.management[0].staff[0].subdivisions.reduce((accum, subdivision) => {
        const index = subdivision.people.findIndex((manager) => manager.id === id);
        const people = subdivision.people.reduce((acc, employee, i) => {
          if (index !== subdivision.people.length - 1 && index === i) {
            const nextItem = acc[i + 1];
            acc[i + 1] = employee;
            acc[i] = nextItem;
          } 
          return acc;
        }, subdivision.people);
        if (people) {
          accum.title = subdivision.title;
          accum.email = subdivision.email;
          subdivision.people = people;
        }
        if (subdivision.subdivisions) {
          const sectors = subdivision.subdivisions.reduce((sectorAcc, sector) => {
            const index = sector.people.findIndex((manager) => manager.id === id);
            const peopleInSector = sector.people.reduce((acc, employee, i) => {
              if (index !== sector.people.length - 1 && index === i) {
                const nextItem = acc[i + 1];
                acc[i + 1] = employee;
                acc[i] = nextItem;
              } 
              return acc;
            }, sector.people);
            if (peopleInSector) {
              accum.title = subdivision.title;
              accum.email = subdivision.email;
              sectorAcc.title = sector.title;
              sectorAcc.email = sector.email;
              sector.people = peopleInSector;
            } 
            return sectorAcc;
          }, {});
          if (sectors.people) {
            accum.subdivisions = [];
            accum.subdivisions.push(sectors);
          }
        }
        return accum;
      }, {});
      if (staff.people && staff.people.length !== 0) {
        const [staffUser] = staff.people;
        staffUser.position = position;
        staffUser.full_name = fullName;
        staffUser.work_phone = workPhone;
        staffUser.mobile_phone = mobilePhone;
    }
    }
    if (authority) {
      acc[0].authority = authority;
    }
    return acc;
  }, accumalator);
  return employers;
};

const moveUp = (state, id) => {
  const accumalator = [state[0]];
  const employers = state.reduce((acc, administration) => {
    const index = administration.authority.findIndex((manager) => manager.id === id);
    administration.authority.reduce((acc, manager, i) => {
      if (index !== 0 && index === i) {
        const prevItem = acc[i - 1];
        acc[i - 1] = manager;
        acc[i] = prevItem;
      }
      return acc;
    }, administration.authority);
    if (administration.management.length) {
      const index = administration.management[0].staff[0].people.findIndex((manager) => manager.id === id);
      const management = administration.management[0].staff[0].people.reduce((acc, manager, i) => {
        if (index !== 0 && index === i) {
          const prevItem = acc[i - 1];
          acc[i - 1] = manager;
          acc[i] = prevItem;
        }
        return acc;
      }, administration.management[0].staff[0].people);
      acc[0].management[0].staff[0].people = management;
    }
    if (administration.management.length && administration.management[0].staff[0].subdivisions && administration.management[0].staff[0].subdivisions.length !== 0) {
      const staff = administration.management[0].staff[0].subdivisions.reduce((accum, subdivision) => {
        const index = subdivision.people.findIndex((manager) => manager.id === id);
        const people = subdivision.people.reduce((acc, employee, i) => {
          if (index !== 0 && index === i) {
            const prevItem = acc[i - 1];
            acc[i - 1] = employee;
            acc[i] = prevItem;
          }
          return acc;
        }, subdivision.people);
        if (people) {
          accum.title = subdivision.title;
          accum.email = subdivision.email;
          subdivision.people = people;
        }
        if (subdivision.subdivisions) {
          const sectors = subdivision.subdivisions.reduce((sectorAcc, sector) => {
            const index = sector.people.findIndex((manager) => manager.id === id);
            const peopleInSector = sector.people.reduce((acc, employee, i) => {
              if (index !== 0 && index === i) {
                const prevItem = acc[i - 1];
                acc[i - 1] = employee;
                acc[i] = prevItem;
              }
              return acc;
            }, sector.people);
            if (peopleInSector) {
              accum.title = subdivision.title;
              accum.email = subdivision.email;
              sectorAcc.title = sector.title;
              sectorAcc.email = sector.email;
              sector.people = peopleInSector;
            } 
            return sectorAcc;
          }, {});
          if (sectors.people) {
            accum.subdivisions = [];
            accum.subdivisions.push(sectors);
          }
        }
        return accum;
      }, {});
      if (staff.people && staff.people.length !== 0) {
        const [staffUser] = staff.people;
        staffUser.position = position;
        staffUser.full_name = fullName;
        staffUser.work_phone = workPhone;
        staffUser.mobile_phone = mobilePhone;
    }
    }
    return acc;
  }, accumalator);
  return employers;
};

const deleteDepartmentById = (state, id) => {
  const accumalator = [state[0]];
  if (accumalator[0].management[0].id === id) {
    accumalator[0].management = [];
  } else {
    const employers = state.reduce((acc, administration) => {
      const staff = administration.management[0].staff[0].subdivisions.filter((subdivision) => {
        if (subdivision.id !== id) {
          return true;
        } else {
          return false;
        }
      });
      if (staff.length !== 0) {
        staff.map((subdivision) => {
          if (subdivision.subdivisions.length) {
            const sectors = subdivision.subdivisions.filter((sector) => {
              if (sector.id !== id) {
                return true;
              } else {
                return false;
              }
            });
            subdivision.subdivisions = sectors;
          }
        });
      }
      acc[0].management[0].staff[0].subdivisions = staff;
      return acc;
      }, accumalator);
    return employers;
  }
  return accumalator;
};

const Modal = ({setShowModal, setUiState, administrations, userId, type}) => {
  const deleteHandler = () => {
    let employers;
    if (type === 'removeDeparment') {
      employers = deleteDepartmentById(administrations, userId);
    } else {
      employers = deleteById(administrations, userId);
    }
    setUiState(employers); 
    const [administration] = administrations;
    const {_id} = administration;
    const token = localStorage.getItem("user");
    fetch('/api/save', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({_id, administration}),
      }).then((res) => {
      console.log('Response received')
      if (res.status !== 400) {
        toast("Данные успешно сохранены!");
        setShowModal(false);
      }
    });
  };
  return (
    <div className='modal'>
      <div className='modal-dialog-centered'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h4>Удалить запись</h4>
            <button onClick={() => setShowModal(false)}>X</button>
          </div>
          <div className='modal-body'>
            <p>Уверены?</p>
            <div className='flex justify-content-end'>
              <button className='btn mr-10' onClick={() => setShowModal(false)}>Отменить</button>
              <button className='btn btn-danger' onClick={() => deleteHandler()}>Удалить</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PhonesFu = ({ registered, administrations }) => {
  const [uIstate, setUiState] = useState(administrations);
  const [submitted, setSubmitted] = useState(false);
  const [unSaved, setUnSaved] = useState(false);
  const [id, setId] = useState('');
  const [userId, setUserId] = useState('');
  const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState('');
  window.addEventListener('beforeunload', function (event) {
    // Отменяем поведение по умолчанию
    event.preventDefault()
    // Chrome требует наличия returnValue
    event.returnValue = ''
  });
  const handleOnChange = (e, value) => {
    e.preventDefault();
    setSubmitted(false);
    setCount(e.target.value);
    setId('');
    value = e.target.value;
    const employers = findByName(administrations, value);
    if (value.length !== 0) {
      setUiState([employers]);   
    } else {
      setUiState(administrations);
    }
    console.log(uIstate);
  };
  const cb = ([employers, hasMoreThanOneManagment]) => {
    if (hasMoreThanOneManagment) {
      toast("Перед добавлением управления, удалите предыдущее!");
    } else {
      setUiState(employers); 
      setId('');
      setUnSaved(true);
    }
  };
  const handleOnClick = (userId, type) => {    
    setVisible(false)
    setSubmitted(false);
    if (id === userId || type) {
      setId('');
    } else {
      setId(userId);
    }
    if (type) {
      let employers;
      if (type === 'moveDown') {
        employers = moveDown(administrations, userId);
      } else if (type === 'moveUp') {
        employers = moveUp(administrations, userId)
      }
      else {
        setShowModal(true);
        employers = administrations;
        setUserId(userId);
        setType(type);
      } 
      setUiState(employers);
      if (type !== 'removeDeparment') {
        if (type !== "remove") {
          setUnSaved(true);
        }
      }
    }
  };
  const handleOnSubmit = () => {
    const token = localStorage.getItem("user");
    const [administration] = administrations;
    const {_id} = administration;
    fetch('/api/save', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({_id, administration}),
    }).then((res) => {
      console.log('Response received')
      if (res.status !== 400) {
        toast("Данные успешно сохранены!");
      }
    });
  };
  const [inputValue, setCount] = useState('');
  const ids = [-1, 0];
  const [locationId, phoneId] = ids;
  function tree_toggle(event) {
    event = event || window.event
    var clickedElem = event.target || event.srcElement
    if (!hasClass(clickedElem, 'Expand')) {
      return // клик не там
    }
    // Node, на который кликнули
    var node = clickedElem.parentNode
    if (hasClass(node, 'ExpandLeaf')) {
      return // клик на листе
    }
    // определить новый класс для узла
    var newClass = hasClass(node, 'ExpandOpen') ? 'ExpandClosed' : 'ExpandOpen'
    // заменить текущий класс на newClass
    // регексп находит отдельно стоящий open|close и меняет на newClass
    var re =  /(^|\s)(ExpandOpen|ExpandClosed)(\s|$)/
    node.className = node.className.replace(re, '$1'+newClass+'$3')
  }
  function hasClass(elem, className) {
    return new RegExp("(^|\\s)"+className+"(\\s|$)").test(elem.className)
  }
  const getClassName = (arr, i) => {
    let className = '';
    if (i !== arr.length - 1) {
      className = 'Node ExpandLeaf';
    } else {
      className = 'Node ExpandLeaf IsLast';
    }
    return className;
  }
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const [arrowElement, setArrowElement] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [{ name: 'arrow', options: { element: arrowElement } }],
  });
  return(
    <>
      <div className="container pl-0 pt-0 flex">
        <form className='input' onSubmit={(e) => e.preventDefault()}>
          <input placeholder="Поиск" name="name" value={inputValue} onChange={(e)=>handleOnChange(e, inputValue)}></input>
        </form>
        <div>
          {unSaved && <button className="btn save-btn" onClick={(e) => handleOnSubmit(e)} title='Сохранить'>
          <FontAwesomeIcon icon={faFloppyDisk} size="lg" />
          </button>}
        </div>
        {submitted && <h1 className='table-wrapper w-100-percents'>Данные успешно сохранены!</h1>}
      </div>
      {uIstate.map((administration) => (
        <React.Fragment key={administration._id}>
          {!administration.hidden ? <div className='table-wrapper'>
            <table className="table">
              <caption>
                {id !== locationId ? 
                  <div id={locationId} className='justify-content-space-around flex'>
                    <p className='grid-column-1-4'>{administration.location && administration.location}</p>
                    <button className='btn' onClick={() => handleOnClick(locationId)} title="Изменить">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                      </svg>
                    </button>
                  </div>
                  :
                  <TwoColumnsUpdateForm cb={cb} id={id} uIstate={uIstate} type='location' setId={setId}/>
                }
                <p>{administration.email && administration.email}</p>
                {id !== phoneId ? 
                  <div id={phoneId} className='justify-content-space-around flex'>
                    <p className='grid-column-1-4'>{administration.phone_code && `Код города: ${administration.phone_code}`}</p>
                    <button className='btn' onClick={() => handleOnClick(phoneId)} title="Изменить">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                      </svg>
                    </button>
                  </div> 
                  : 
                  <TwoColumnsUpdateForm cb={cb} id={id} uIstate={uIstate} type='phone_code' setId={setId}/>
                }
              </caption>
              <thead>
                <tr>
                  <th>Должность</th>
                  <th>Фамилия, имя, отчество</th>
                  <th>Рабочий телефон</th>
                  <th>Мобильный телефон</th>
                  {registered ? <th></th> : <></>}
                  {registered ? <th></th> : <></>}
                  {registered ? <th></th> : <></>}
                  {registered ? <th></th> : <></>}
                </tr>
              </thead>
            </table>
            <div onClick={(e) => tree_toggle(e)}>
              <ul className="Container tree">
                <li className="Node IsRoot ExpandOpen">
                  <div className="Expand"></div>
                  <div className="Content">
                    <table className='table-bg'>
                      <tbody>
                        {registered ? administration.authority ? 
                        <React.Fragment>
                          <tr className='group' id={administration._id}>
                            <td className='border-radius-0 text-left'>
                              <strong>Администрация</strong>
                            </td>
                            <td className='border-radius-0 p-0' colSpan="2">
                              <button className='btn ml-auto' onClick={() => handleOnClick(administration._id)} title='Добавить сотрудника'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
                                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                </svg>
                              </button>
                            </td>
                          </tr>
                          {id === administration._id && <AddForm cb={cb} id={administration._id} uIstate={uIstate} setId={setId}/>}
                        </React.Fragment>
                        : <></>
                          :
                            administration.authority.length ? <tr className='group'>
                              <td colSpan="4">
                                <strong>Администрация</strong>
                              </td>
                            </tr> : <></>
                          }
                        </tbody>
                      </table>
                  </div>
                  <ul className="Container">
                    {administration.authority && administration.authority.map((manager, i) => (
                      <li key={manager.id} className={getClassName(administration.authority, i)}>
                        <div className="Expand"></div>
                        <div className="Content">
                        <table> 
                          <tbody>
                            {id !== manager.id ?
                              <tr id={manager.id} className='grid-7 p-8'>
                                <td>{manager.position}</td> 
                                <td>{manager.full_name}</td>
                                <td>{manager.work_phone}</td>
                                <td>{manager.mobile_phone}</td>
                                <td>
                                  {inputValue ==='' && <button className='btn' onClick={() => handleOnClick(manager.id)} title="Изменить">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                                      <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                    </svg>
                                  </button>}
                                </td>
                                <td>
                                  {inputValue ==='' &&<button className='btn' onClick={() => handleOnClick(manager.id, 'remove')} title="Удалить">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                                      <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                    </svg>
                                  </button>}
                                </td>
                                <td className='btn-group'>
                                  {inputValue ==='' && <button className='btn border-0 border-radius-left' onClick={() => handleOnClick(manager.id, 'moveDown')} title="Опустить вниз">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down-circle" viewBox="0 0 16 16">
                                      <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
                                    </svg>
                                  </button>}
                                  {inputValue ===''&& <button className='btn border-0 b-right' onClick={() => handleOnClick(manager.id, 'moveUp')} title="Поднять вверх">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up-circle" viewBox="0 0 16 16">
                                      <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"/>
                                    </svg>
                                  </button>}
                                </td>
                              </tr> :
                              <UpdateForm cb={cb} id={id} uIstate={uIstate} setId={setId}/>
                            }
                          </tbody>
                        </table>  
                        </div>
                      </li>
                      ))}
                    </ul>
                </li>
              </ul>
            </div>
            <div onClick={(e) => tree_toggle(e)}>
              <ul className="Container tree">
                <li className="Node IsRoot ExpandOpen">
                  <div className="Expand"></div>
                  <div className="Content">
                    {administration.management[0] && administration.management[0].title && registered
                      ? 
                      <table className='table-layout-fixed p-12'>
                        <tbody>
                          {id !== administration.management[0].id + 1 ?
                            <tr id={administration.management[0].id + 1}>
                              <td className='w-1056'>
                                <em>
                                  <strong>{administration.management[0].title}</strong>
                                </em>
                              </td>
                              <td className='w-44'>
                                {inputValue ==='' && <button className='btn' onClick={() => handleOnClick(administration.management[0].id + 1)} title="Изменить">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                  </svg>
                                </button>}
                              </td>
                              <td className='w-44'>
                                {inputValue ==='' && <button className='btn' onClick={() => handleOnClick(administration.management[0].id, 'removeDeparment')} title="Удалить">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                  </svg>
                                </button>}
                              </td>
                              <td className='w-44'>
                                {inputValue ==='' && <button className='btn' onClick={() => setVisible(!visible)} ref={setReferenceElement} title="Добавить">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                  </svg>
                                </button>}
                                {visible && <div className='tooltip' ref={setPopperElement} style={styles.popper} {...attributes.popper}>
                                  <button className='btn' onClick={() => handleOnClick(administration._id + 3)}>Добавить структурное подразделение</button>
                                  <button className='btn m-8' onClick={() => handleOnClick(administration.management[0].id)}>Добавить сотрудника</button>
                                  <div className="arrow" ref={setArrowElement} style={styles.arrow}></div>
                                </div>}
                              </td>
                            </tr>
                            :
                            <TwoColumnsUpdateForm cb={cb} id={administration.management[0].id + 1} uIstate={uIstate} type='management' setId={setId}/>
                          }
                          {id === administration._id + 3 && <AddDepartmentForm cb={cb} id={administration._id + 3} uIstate={uIstate} setId={setId}/>}
                          {administration.management[0] && administration.management[0].title && registered ? 
                            <>
                              {id !== administration.management[0].id + 2 ?
                                <tr id={administration.management[0].id + 2}>
                                <td className='w-1056'>
                                  <strong>{administration.management[0].email}</strong>
                                </td>
                                <td className='w-44'>
                                  <button className='btn' onClick={() => handleOnClick(administration.management[0].id + 2)} title="Изменить">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                                      <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                              :
                              <TwoColumnsUpdateForm cb={cb} id={administration.management[0].id + 2} uIstate={uIstate} type='management' setId={setId}/>
                              }
                              {id === administration.management[0].id && <AddForm cb={cb} id={administration.management[0].id} uIstate={uIstate} type='addManager' setId={setId}/>}
                            </> 
                            :
                            <tr>
                              <td colSpan="4" className='text-center'>
                                <strong>{administration.management[0] && administration.management[0].email}</strong>
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                      : 
                      <table>
                        <tbody>
                          <tr>
                            <td colSpan="4" className='text-center'>
                              <strong>{administration.management[0] && administration.management[0].title}</strong>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    }
                  </div>
                  <ul className="Container">
                    {administration.management[0] && administration.management[0].staff && administration.management[0].staff[0].people && administration.management[0].staff[0].people.map((employee, i) => (
                      <li key={employee.id} className={getClassName(administration.management[0].staff[0].people, i)}>
                        <div className="Expand"></div>
                        <div className="Content">
                          <table> 
                            <tbody>
                              {id !== employee.id ?
                                <tr id={employee.id} className='grid-7 p-8'>
                                  <td>{employee.position}</td> 
                                  <td>{employee.full_name}</td>
                                  <td>{employee.work_phone}</td>
                                  <td>{employee.mobile_phone}</td>
                                  <td>
                                    {inputValue ==='' && <button className='btn' onClick={() => handleOnClick(employee.id)} title="Изменить">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                      </svg>
                                    </button>}
                                  </td>
                                  <td>
                                    {inputValue ==='' && <button className='btn' onClick={() => handleOnClick(employee.id, 'remove')} title="Удалить">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                      </svg>
                                    </button>}
                                  </td>
                                  <td className='btn-group'>
                                    {inputValue ==='' && <button className='btn border-0 border-radius-left' onClick={() => handleOnClick(employee.id, 'moveDown')} title="Опустить вниз">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down-circle" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
                                      </svg>
                                    </button>}
                                    {inputValue ==='' && <button className='btn border-0 b-right' onClick={() => handleOnClick(employee.id, 'moveUp')} title="Поднять вверх">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up-circle" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"/>
                                      </svg>
                                    </button>}
                                  </td>
                                </tr>
                                :
                                <UpdateForm cb={cb} id={id} uIstate={uIstate} setId={setId}/>
                              }
                            </tbody>
                          </table>
                        </div>
                      </li>
                    ))}
                    {administration.management[0] && administration.management[0].staff && administration.management[0].staff[0].subdivisions && administration.management[0].staff[0].subdivisions.map((subdivision, i) => (
                      <li key={subdivision.id} className="Node ExpandOpen">
                        <div className="Expand"></div>
                        <div className="Content">
                          {registered ? 
                            <table className='table-layout-fixed p-12'>
                              <tbody>
                                {id !== subdivision.id + 1 ?
                                  <tr id={String(subdivision.id) + 1}>
                                    <td className='w-1056'>
                                      <em>
                                        <strong>{subdivision.title && subdivision.title}</strong>
                                      </em>
                                    </td>
                                    <td className='w-44'>
                                      {inputValue ==='' && <button className='btn' onClick={() => handleOnClick(subdivision.id + 1)} title="Изменить">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                                          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                        </svg>
                                      </button>}
                                    </td>
                                    <td className='w-44'>
                                      {inputValue ==='' && <button className='btn' onClick={() => handleOnClick(subdivision.id, 'removeDeparment')} title="Удалить">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                                          <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                        </svg>
                                      </button>}
                                    </td>
                                    <td className='relative w-44'>
                                      {inputValue ==='' && <button className='btn' onClick={() => handleOnClick(subdivision.id + 4)} title="Добавить">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
                                          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                        </svg>
                                      </button>}
                                      {id === subdivision.id + 4 && <div className='tooltip'>
                                        <button className='btn' onClick={() => handleOnClick(subdivision.id + 3)}>Добавить структурное подразделение</button>
                                        <button className='btn m-8' onClick={() => handleOnClick(subdivision.id)}>Добавить сотрудника</button>
                                        <div className="arrow"></div>
                                      </div>}
                                    </td>
                                  </tr>
                                  :
                                  <TwoColumnsUpdateForm cb={cb} id={String(subdivision.id) + 1} uIstate={uIstate} setId={setId}/>
                                }
                                {id === subdivision.id + 3 && <AddDepartmentForm cb={cb} id={subdivision.id + 3} uIstate={uIstate} setId={setId}/>}
                                {registered ? 
                                  <>
                                    {id !== subdivision.id + 2 ?
                                      <tr id={String(subdivision.id) + 2}>
                                        <td className='w-1056'>
                                          <strong>{subdivision.email && subdivision.email}</strong>
                                        </td>
                                        <td className='w-44'>
                                          <button className='btn' onClick={() => handleOnClick(subdivision.id + 2)} title="Изменить">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                                              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                            </svg>
                                          </button>
                                        </td>
                                      </tr>
                                      :
                                      <TwoColumnsUpdateForm cb={cb} id={String(subdivision.id) + 2} uIstate={uIstate} setId={setId}/>
                                    }
                                    {id === subdivision.id && <AddForm cb={cb} id={subdivision.id} uIstate={uIstate} type='add' setId={setId}/>}
                                  </> 
                                  :
                                  <tr>
                                    <td colSpan="4" className='text-center'>
                                      <strong>{subdivision.email && subdivision.email}</strong>
                                    </td>
                                  </tr>
                                }
                              </tbody>
                            </table>
                            : 
                            <tr>                  
                              <td colSpan="4" className='text-center'>
                                <em>
                                  <strong>{subdivision.title && subdivision.title}</strong>
                                </em>
                              </td>
                            </tr>
                          }
                        </div>
                        <ul className="Container">
                          {subdivision.people && subdivision.people.map((employee, i) => (
                            <li key={employee.id} className={getClassName(subdivision.people, i)}>
                              <div className="Expand"></div>
                              <div className="Content">
                                <table key={employee.id}>
                                  <tbody>
                                    {id !== employee.id ?
                                      <tr id={employee.id} className='grid-7 p-8'>
                                        <td>{employee.position}</td> 
                                        <td>{employee.full_name}</td>
                                        <td>{employee.work_phone}</td>
                                        <td>{employee.mobile_phone}</td>
                                        <td>
                                          {inputValue ==='' && <button className='btn' onClick={() => handleOnClick(employee.id)} title="Изменить">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                                              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                            </svg>
                                          </button>}
                                        </td> 
                                        <td>
                                          {inputValue ==='' && <button className='btn' onClick={() => handleOnClick(employee.id, 'remove')} title="Удалить">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                                              <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                            </svg>
                                          </button>}
                                        </td> 
                                        <td className='btn-group'>
                                          {inputValue ==='' && <button className='btn border-0 border-radius-left' onClick={() => handleOnClick(employee.id, 'moveDown')} title="Опустить вниз">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down-circle" viewBox="0 0 16 16">
                                              <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
                                            </svg>
                                          </button>}
                                            {inputValue ==='' && <button className='btn border-0 b-right' onClick={() => handleOnClick(employee.id, 'moveUp')} title="Поднять вверх">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up-circle" viewBox="0 0 16 16">
                                              <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"/>
                                            </svg>
                                          </button>}
                                        </td>
                                      </tr>
                                      :
                                      <UpdateForm cb={cb} id={id} uIstate={uIstate} setId={setId}/>
                                    }
                                  </tbody>
                                </table>
                              </div>
                            </li>
                          ))}
                          {subdivision.subdivisions && subdivision.subdivisions.map((subdivision) => (
                            <li key={subdivision.id} className="Node ExpandOpen">
                              <div className="Expand"></div>
                              <div className="Content">
                                {registered ? 
                                <table className='table-layout-fixed p-12'>
                                  <tbody>
                                    {id !== subdivision.id + 1 ?
                                      <tr id={subdivision.id + 1}>
                                        <td className='w-1056'>
                                          <em>
                                            <strong>{subdivision.title && subdivision.title}</strong>
                                          </em>
                                        </td>
                                        <td className='w-44'>
                                          {inputValue ==='' && <button className='btn' onClick={() => handleOnClick(subdivision.id + 1)} title="Изменить">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                                              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                            </svg>
                                          </button>}      
                                        </td>
                                        <td className='w-44'>
                                          {inputValue ==='' && <button className='btn' onClick={() => handleOnClick(subdivision.id, 'removeDeparment')} title="Удалить">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                                              <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                            </svg>
                                          </button>}
                                        </td>
                                        <td className='relative w-44'>
                                          {inputValue ==='' && <button className='btn' onClick={() => handleOnClick(subdivision.id + 4)} title="Добавить">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
                                              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                            </svg>
                                          </button>}
                                          {id === subdivision.id + 4 && <div className='tooltip'>
                                            <button className='btn' onClick={() => handleOnClick(subdivision.id + 3)}>Добавить структурное подразделение</button>
                                            <button className='btn m-8' onClick={() => handleOnClick(subdivision.id)}>Добавить сотрудника</button>
                                            <div className="arrow"></div>
                                          </div>
                                          }
                                        </td>
                                      </tr>
                                      :
                                      <TwoColumnsUpdateForm cb={cb} id={subdivision.id + 1} uIstate={uIstate} setId={setId}/>
                                    }
                                    {id === subdivision.id + 3 && <AddDepartmentForm cb={cb} id={subdivision.id + 3} uIstate={uIstate} setId={setId}/>}
                                    {registered ? 
                                    <>
                                      {id !== subdivision.id + 2 ?
                                        <tr id={subdivision.id + 2}>
                                          <td className='w-1056'>
                                            <strong>{subdivision.email && subdivision.email}</strong>
                                          </td>
                                          <td className='w-44'>
                                            <button className='btn' onClick={() => handleOnClick(subdivision.id + 2)} title="Изменить">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                                                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                              </svg>
                                            </button>
                                          </td>
                                          <td></td>
                                        </tr>
                                        :
                                        <TwoColumnsUpdateForm cb={cb} id={subdivision.id + 2} uIstate={uIstate} setId={setId}/>
                                      }
                                      {id === subdivision.id && <AddForm cb={cb} id={subdivision.id} uIstate={uIstate} type='add' setId={setId}/>}
                                    </> 
                                    :
                                    <tr>
                                      <td colSpan="4" className='text-center'>
                                        <strong>{subdivision.email && subdivision.email}</strong>
                                      </td>
                                    </tr> 
                                    }
                                  </tbody>
                                </table>
                                : 
                                <tr>
                                  <td colSpan="4" className='text-center'>
                                    <em>
                                      <strong>{subdivision.title && subdivision.title}</strong>
                                    </em>
                                  </td>
                                </tr>
                                }
                              </div>
                              <ul className="Container">
                                {subdivision.people.map((employee, i) => (
                                  <li key={employee.id} className={getClassName(subdivision.people, i)}>
                                    <div className="Expand"></div>
                                    <div className="Content">
                                      <table>
                                        <tbody>
                                          {id !== employee.id ?
                                            <tr id={employee.id} className='grid-7 p-8'>
                                              <td>{employee.position}</td> 
                                              <td>{employee.full_name}</td>
                                              <td>{employee.work_phone}</td>
                                              <td>{employee.mobile_phone}</td>
                                              <td>
                                                {inputValue ==='' && <button className='btn' onClick={() => handleOnClick(employee.id)} title="Изменить">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                                  </svg>
                                                </button>}
                                              </td> 
                                              <td>
                                                {inputValue ==='' && <button className='btn' onClick={() => handleOnClick(employee.id, 'remove')} title="Удалить">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                                                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                                  </svg>
                                                </button>}
                                              </td> 
                                              <td className='btn-group'>
                                                {inputValue ==='' && <button className='btn border-0 border-radius-left' onClick={() => handleOnClick(employee.id, 'moveDown')} title="Опустить вниз">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down-circle" viewBox="0 0 16 16">
                                                    <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
                                                  </svg>
                                                </button>}
                                                {inputValue ==='' && <button className='btn border-0 b-right' onClick={() => handleOnClick(employee.id, 'moveUp')} title="Поднять вверх">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up-circle" viewBox="0 0 16 16">
                                                    <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"/>
                                                  </svg>
                                                </button>}
                                              </td>
                                            </tr>
                                            :
                                            <UpdateForm cb={cb} id={id} uIstate={uIstate} setId={setId}/>
                                          }
                                        </tbody>
                                      </table>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </div>
          </div> : <div className='table-wrapper'><h1>По Вашему запросу ничего не найдено</h1></div>}
        </React.Fragment >
      ))
      }
      <ToastContainer />
      {showModal && <Modal setUiState={setUiState} setShowModal= {setShowModal} userId={userId} administrations={administrations} type={type}></Modal>}
    </> 
)}

 export async function getServerSideProps() {
   await dbConnect()

  const result = await Phone.find({})
  const administrations = result.map((doc) => {
    const administration = doc.toObject();
    administration._id = administration._id.toString();
    return administration;
  })

  return { props: { administrations } }
}

export default PhonesFu
