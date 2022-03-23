const radngen = require('mersenne-twister');

const generator = new radngen(456);

for (let x=1; x<10; x++){
  console.log(generator.random_int());
}
