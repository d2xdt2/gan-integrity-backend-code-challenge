import geolib from 'geolib';
import geodist from 'geodist';

export const getCity = (guid, addresses) => {
   const city = addresses.find(city => city.guid === guid);

   if (!city) throw new Error('City does not exist.');
   return city;
};

export const getWithinDistance = (distance, from, addresses) => {
   const fromCoordinates = getByCoordinate(from, addresses);

   addresses = addresses.filter(city => city.guid !== from);

   const citiesInDistance = [];

   addresses.map(city => {
      geolib.isPointWithinRadius(
         fromCoordinates,
         { latitude: city.latitude, longitude: city.longitude },
         distance * 1000
      ) && citiesInDistance.push(city);
   });

   return citiesInDistance;
};

export const getDistance = (fromCityGuid, toCityGuid, addresses) => {
   // TODO
   // Had to introduce geodist, as geolib doesn't give the value that is exspected in the test.
   // TASK
   // Investigate where the bug is.Is it the test / geodist or geodist.

   return Number(
      geodist(getByCoordinate(fromCityGuid, addresses), getByCoordinate(toCityGuid, addresses), {
         exact: true,
         unit: 'km',
      }).toFixed(2)
   );
};

export const getByTag = (tag, isActive, addresses) => {
   return addresses.filter(city => city.isActive === !!isActive && city.tags.includes(tag));
};

const getByCoordinate = (guid, addresses) => {
   const city = getCity(guid, addresses);

   return {
      latitude: city.latitude,
      longitude: city.longitude,
   };
};
