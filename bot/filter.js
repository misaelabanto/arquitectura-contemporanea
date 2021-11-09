const { writeFileSync } = require('fs');
const places = require('../client/data.json');

const filteredPlaces = places.filter(places => !!places);

writeFileSync('client/data.json', JSON.stringify(filteredPlaces, null, 2), { encoding: 'utf-8', flag: 'w' });