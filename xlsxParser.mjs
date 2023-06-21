import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import xlsx from 'node-xlsx';
import { Phone } from './models/Phone.cjs';
import mongoose from 'mongoose';
import _ from 'lodash';

const parseDocx = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/phones');
  await Phone.deleteMany();
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const getFixturePath = () => path.join(__dirname, '__fixtures__', '2022');
  const directories = fs.readdirSync(getFixturePath());
  directories.map(async (city, i) => {
    const folder = fs.readdirSync(path.join(getFixturePath(), city));
    const xlsxItem = folder.filter((city) => {
      if (path.extname(city) === '.xlsx' || path.extname(city) === '.xls') {
        return true;
      };
    });
    const [xlsxFile] = xlsxItem; 
    if (xlsxFile) {
    const workSheetsFromFile = xlsx.parse(path.join(getFixturePath(), city, xlsxFile));
    const entitie = {};
    const managmentSheet = workSheetsFromFile.filter((el) => el.name.includes('Руководство'));
    const personalSheet = workSheetsFromFile.filter((el) => el.name.includes('Управлени'));
    managmentSheet[0].data.map((el) => {
      if (el.length === 2) {
        const [name, value] = el;
        if (name === 'Адрес:') {
          entitie.address = value;
        }
        if (name === 'Телефонный код города:') {
          entitie.code = value.match(/[^(].+[^)]/)[0];
        }
        if (name === 'Адрес электронной почты администрации:') {
          entitie.email = value.match(/\w+\.?-?\w+@\w+\.?-?\.?\w+\.?\w+/)[0];
        }
      }
    });
    const startIndex = personalSheet[0].data.reduce((acc, el, i) => {
      if (el[0] === 'Управление') {
        acc = i;
      }
      return acc;
    }, 0);
    const personals = [];
    for(let i = startIndex + 2; i < personalSheet[0].data.length; i++) {
      if (personalSheet[0].data[i].length !== 0) {
        personals.push(personalSheet[0].data[i]);
      } else if (personalSheet[0].data[i].length === 0 && personalSheet[0].data[i + 1]) {
        if (personalSheet[0].data[i + 1].length === 0) {
          break;
        }
        continue;
      } else {
        break;
      }
    };
    const filteredPersonal = personals.filter((el) => {
      if (el.length > 8) {
        return true;
      }
      return false;
    });
    const filteredSheet = managmentSheet[0].data.filter((el, index) => {
      const [position, full_name, city_phone, mobile_phone] = el;
      if (index >= 6 && index <= 11) {
        if (el.length !== 0) {
          const double = filteredPersonal.filter(([direction, direction_email, department, department_email, sector, sector_email, position, personalFull_name]) => personalFull_name === full_name);
          if (double.length === 0) {
            return true;
          }
        }
      }
      return false;
    });
    const administration = new Phone({
      location: entitie.address, 
      phone_code: entitie.code, 
      email: entitie.email, 
    });
    await administration.save();
    const administrationId = administration._id;
    console.log(administrationId);
    filteredSheet.map(async(el) => {
      const [position, full_name, city_phone, mobile_phone] = el;
      const positionFormatted = position.trim().match(/[А-Яа-я]+/g).join(' ');
      const full_nameFormatted = full_name.match(/([А-Яа-я]{1,})./g).join(' ');
      let mobile_phoneFormatted;
      if (mobile_phone) {
        const mobile_phoneTrimmed = mobile_phone.trim();
        const userNumber = mobile_phoneTrimmed.match(/(\d{1,3}\b-+\d{1,2}\b-?\d{1,2}|\d{7}\b)/g);
        const userNumberArrayWithoutDashes = userNumber[0].match(/\d/g);
        const userNumberWithoutDashes = userNumberArrayWithoutDashes.join('');
        const firstThreeDigit = userNumberWithoutDashes.slice(0,3);
        const secondTwoDigit = userNumberWithoutDashes.slice(3,5);
        const thirdTwoDigit = userNumberWithoutDashes.slice(5,7);
        const userNumberFormatted = `${firstThreeDigit}-${secondTwoDigit}-${thirdTwoDigit}`;
        mobile_phoneFormatted = mobile_phoneTrimmed.length === 13 && !mobile_phoneTrimmed.includes('072') ? `+380(${mobile_phone.match(/[^0]\d/)})${mobile_phone.match(/\d{1,3}-?\d{1,2}-?\d{1,2}$/g)}` : `+7(959)${userNumberFormatted}`;
      }
      let city_phoneFormatted;
      if (city_phone) {
        [city_phoneFormatted] = city_phone.match(/\d+-\d+-\d+/g);
      }
      const manager = {
        id: _.uniqueId(),
        position: positionFormatted, 
        full_name: full_nameFormatted, 
        work_phone: city_phoneFormatted, 
        mobile_phone: mobile_phoneFormatted
      };
      const item = await Phone.findById(administrationId);
      item.authority.push(manager);
      await item.save();
    });
    const managementDescription = {
      staff: [{
        people: [],
        subdivisions: []
      }]
    };
    const item = await Phone.findById(administrationId);
    item.management.push(managementDescription);
    const formateSectorName = (sector) => {
      let formattedName = sector;
      if (!sector.includes('Сектор')) {
        formattedName = `Сектор ${sector.toLowerCase()}`;
      }
      return formattedName;
    };
    const formateDepartmentName = (department) => {
      const indexOfAdministration = department.indexOf('Администрации');
      let departmentFormatted = department.match(/\S+/g).join(' ');
      if (indexOfAdministration !== -1) {
        departmentFormatted = department.match(/\S+/g).join(' ').slice(0, indexOfAdministration - 1);
      }
      if (!departmentFormatted.includes('Отдел')) {
        departmentFormatted = `Отдел ${departmentFormatted.toLowerCase()}`;
      }
      return departmentFormatted;
    };
    const createDepartment = (department, department_email) => {
      const departmentFormatted = formateDepartmentName(department);
      const departmentObject = {
        "type" : "DEPARTMENT",
        people : [],
        subdivisions: [],
        id: _.uniqueId(),
      };
      departmentObject.title = departmentFormatted;
      departmentObject.email = department_email;
      managementDescription.staff[0].subdivisions.push(departmentObject);
    };
    const createSector = (sector, sector_email, newIndex, department) => {
      const sectotObject = {
        "type": "SECTOR",
        people : [],
        id: _.uniqueId(),
      };
      sectotObject.title = formateSectorName(sector);
      sectotObject.email = sector_email;
      if (department) {
        managementDescription.staff[0].subdivisions[newIndex].subdivisions.push(sectotObject);  
      } else {
        managementDescription.staff[0].subdivisions.push(sectotObject);
        newIndex ++;
      }
      return newIndex;
    };
    const buildTree = (staff, index = 0, subIndex = 0) => {
      const [head, ...tail] = staff;
      if (staff.length === 0) {
        item.save()
          .then(doc => {
            console.log(doc);
            if (i === directories.length - 1) {
              Phone.find().then(doc => {
                }).then(() => {
                  mongoose.connection.close();
                });
            }
          })
          .catch(e => {
            console.log(e);
          })
      } else {
        const [direction, direction_email, department, department_email, sector, sector_email, position, full_name, ...phones] = head;
        const [city_phone, mobile_phone] = phones.length === 2 ? phones : [, phones[0]];
        const full_nameFormatted = full_name.match(/([А-Яа-я]{1,})([А-Яа-я])([А-Яа-я])/g).join(' ');
        const positionFormatted = position.match(/([А-Яа-я]{1,})([А-Яа-я])([А-Яа-я])/g).join(' ');
        const mobile_phoneTrimmed = mobile_phone.trim();
        let directionTrimmed;
        if (direction) {
          const indexOfAdministration = direction.indexOf('Администрации');
          directionTrimmed = direction.match(/[А-Яа-я]+/g).join(' ');
          if (indexOfAdministration !== -1) {
            directionTrimmed = direction.match(/[А-Яа-я]+/g).join(' ').slice(0, indexOfAdministration - 1);
          }
        }
        const direction_emailFormatted = direction_email ? direction_email.match(/\w+\.?\w+@\w+\.?-?\.?\w+\.?\w+/)[0] : undefined;
        const userNumber = mobile_phoneTrimmed.match(/(\d{1,3}\b-+\d{1,2}\b-?\d{1,2}|\d{7}\b)/g);
        const userNumberArrayWithoutDashes = userNumber[0].match(/\d/g);
        const userNumberWithoutDashes = userNumberArrayWithoutDashes.join('');
        const firstThreeDigit = userNumberWithoutDashes.slice(0,3);
        const secondTwoDigit = userNumberWithoutDashes.slice(3,5);
        const thirdTwoDigit = userNumberWithoutDashes.slice(5,7);
        const userNumberFormatted = `${firstThreeDigit}-${secondTwoDigit}-${thirdTwoDigit}`;
        const mobile_phoneFormatted = mobile_phoneTrimmed.length === 13 && !mobile_phoneTrimmed.includes('072') ? `+380(${mobile_phone.match(/[^0]\d/)})${mobile_phone.match(/\d{1,3}-?\d{1,2}-?\d{1,2}$/g)}` : `+7(959)${userNumberFormatted}`;
        let city_phoneFormatted;
        if (city_phone) {
          city_phoneFormatted = city_phone.match(/\d{1,2}-\d{1,2}-.\d{1,2}/g)[0].match(/\d{1,2}/g).join('-');
        }
        managementDescription.title = directionTrimmed;
        managementDescription.id = _.uniqueId();
        const employee = {
          id: _.uniqueId(),
          position: positionFormatted, 
          full_name: full_nameFormatted, 
          work_phone: city_phoneFormatted, 
          mobile_phone: mobile_phoneFormatted
        };
        let newIndex = index;
        let newSubIndex = subIndex;
        if (department || sector) {
          if (managementDescription.staff[0].subdivisions.length === 0) {
            createDepartment(department, department_email);
          }
          if (department && managementDescription.staff[0].subdivisions[newIndex].title !== formateDepartmentName(department)) {
            createDepartment(department, department_email);
            newIndex ++;
            newSubIndex = 0;
          }
          if (sector && managementDescription.staff[0].subdivisions[newIndex].subdivisions) {
            if (managementDescription.staff[0].subdivisions[newIndex].subdivisions.length === 0) {
              newIndex = createSector(sector, sector_email, newIndex, department);
            } 
          }
          if (sector && managementDescription.staff[0].subdivisions[newIndex].subdivisions) {
            if (managementDescription.staff[0].subdivisions[newIndex].subdivisions[subIndex].title !== formateSectorName(sector)) {
              createSector(sector, sector_email, newIndex, department);
              newSubIndex ++;
            }
          }
          if (sector && !department && managementDescription.staff[0].subdivisions[newIndex].title !== formateSectorName(sector)) {
            newIndex = createSector(sector, sector_email, newIndex, department);
          }
          if (department && sector) {
            managementDescription.staff[0].subdivisions[newIndex].subdivisions[newSubIndex].people.push(employee);
          }
          else {
            managementDescription.staff[0].subdivisions[newIndex].people.push(employee);
          }
          if (direction_email) {
            managementDescription.email = direction_emailFormatted;
          }
          buildTree(tail, newIndex, newSubIndex);
        }
        else {
          managementDescription.staff[0].people.push(employee);
          managementDescription.email = direction_emailFormatted;
          buildTree(tail);
        }
      }
    };
    buildTree(filteredPersonal);
    }
  });
};

parseDocx();