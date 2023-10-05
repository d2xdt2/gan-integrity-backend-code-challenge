import express from 'express';

import router from './src/router.js';

const port = 8080;
const app = express();

const authtenticate = hardcodedToken => {
   return (req, res, next) => {
      const token = req.headers['authorization']?.split(' ')[1];
      if (token == null) res.sendStatus(401);
      token === hardcodedToken ? next() : res.sendStatus(403);
   };
};

// Authtenticate on every request
app.use(authtenticate('dGhlc2VjcmV0dG9rZW4='));

app.use(router);

app.listen(port, () => {
   console.log(`Example app listening on port ${port}`);
});
