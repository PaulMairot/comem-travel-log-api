const cors = require('cors');
const express = require('express');
const { connectLogger } = require('log4js');

// Load database first to make sure all models are registered
const db = require('./db');

const apiRouter = require('./api');
const config = require('./config');

const app = express();
const expressLogger = config.logger('express');

// Log HTTP requests
app.use(connectLogger(expressLogger, { level: 'trace' }));

// Parse the body of JSON requests
app.use(express.json());

var allowedOrigins = ['http://localhost:8100',
                      'capacitor://localhost'];
app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// Plug in the API
app.use('/api', apiRouter);

// Display the documentation if available
app.use(express.static('docs'));

// Redirect root requests to the API
app.use('/', (req, res) => res.redirect('/api'));

/**
 * Starts the application by connecting to the database.
 */
app.start = async function start() {
  await db.connect();
};

module.exports = app;
