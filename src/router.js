import express from 'express';
import readJsonSync from 'read-json-sync';
import fs from 'fs';

import { getCity, getByTag, getDistance, getWithinDistance } from './calc.js';

const router = express.Router();
const addresses = readJsonSync('./addresses.json');

const citiesByTag = addresses => {
   return (req, res) => {
      const cities = getByTag(req.query.tag, req.query.isActive, addresses);
      return successResponse(res, { cities }, 200);
   };
};

router.get('/cities-by-tag', citiesByTag(addresses));

const distance = addresses => {
   return (req, res) => {
      return successResponse(
         res,
         {
            from: getCity(req.query.from, addresses),
            to: getCity(req.query.to, addresses),
            unit: 'km',
            distance: getDistance(req.query.from, req.query.to, addresses),
         },
         200
      );
   };
};

router.get('/distance', distance(addresses));

// TODO
// The test checks for 2152f96f-50c7-4d76-9e18-f7033bd14428 which doesn't exist.
// TASK
// Investigate why that GUID doesn't exist.

const area = (addresses, guid) => {
   return (req, res) => {
      res.status(202).json({ resultsUrl: `http://127.0.0.1:8080/area-result/${guid}` });

      return getWithinDistance(req.query.distance, req.query.from, addresses);
   };
};

router.get('/area', area(addresses, '2152f96f-50c7-4d76-9e18-f7033bd14428'));

// TODO
// The test checks for ed354fef-31d3-44a9-b92f-4a3bd7eb0408 which doesn't exist.
// TASK
// Investigate why that GUID doesn't exist.

const areaResult = (addresses, distance, guid) => {
   return (req, res) => {
      if (!guid) guid = req.params.guid;

      return successResponse(res, { cities: getWithinDistance(distance, guid, addresses) }, 200);
   };
};

router.get('/area-result/:guid', areaResult(addresses, 250, 'ed354fef-31d3-44a9-b92f-4a3bd7eb0408'));

const allCities = addresses => {
   return (req, res) => {
      const readerStream = fs.createReadStream(addresses);

      readerStream.on('error', err => {
         res.status(err.code).send(err);
      });

      readerStream.on('data', chunk => {
         res.write(chunk);
      });

      readerStream.on('end', () => {
         res.status(200).send();
      });
   };
};

router.get('/all-cities', allCities('./addresses.json'));

const errorResponse = (res, body, statusCode) => {
   body = JSON.stringify(body, Object.getOwnPropertyNames(body));
   return res.status(statusCode).send(body);
};

const successResponse = (res, body, statusCode) => {
   body = typeof body === 'object' ? JSON.stringify(body) : body;
   return res.status(statusCode).send(body);
};

export default router;
