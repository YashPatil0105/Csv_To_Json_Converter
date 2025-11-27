const { parseCsvLine } = require('../utils/csvParser');

const header = 'id,name,meta.age,meta.city';
const line1 = '1,"Alice, A",30,"New York"';
const line2 = '2,"Bob ""The Builder""",25,Paris';

function lineToObject(headerLine, dataLine) {
  const headers = parseCsvLine(headerLine);
  const cols = parseCsvLine(dataLine);
  const obj = {};
  for (let i = 0; i < headers.length; i++) {
    obj[headers[i] || `field${i}`] = cols[i] !== undefined ? cols[i] : '';
  }
  return obj;
}

console.log('headers:', parseCsvLine(header));
console.log('row 1 object:', JSON.stringify(lineToObject(header, line1), null, 2));
console.log('row 2 object:', JSON.stringify(lineToObject(header, line2), null, 2));