const { flatToNested } = require('../utils/dotNotation');

const flat = {
  "a.b.c": 1,
  "a.b.d": 2,
  "x": "y",
  "arr.0": "first",
  "arr.1": "second",
  "": "ignored"
};

console.log(JSON.stringify(flatToNested(flat), null, 2));