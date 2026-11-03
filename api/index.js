process.env.VERCEL = '1';

// Import compiled backend server
const { server, configureApp } = require('../backend/dist/server.js');

let readyPromise = null;

async function getReadyServer() {
  if (!readyPromise) {
    readyPromise = (async () => {
      await configureApp();
      await server.ready();
      return server;
    })();
  }
  return readyPromise;
}

module.exports = async (req, res) => {
  try {
    const app = await getReadyServer();
    app.server.emit('request', req, res);
  } catch (err) {
    console.error('Vercel Serverless Function Error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
  }
};

