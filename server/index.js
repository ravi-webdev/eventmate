// server.js
const next = require('next')
require('dotenv').config();
const port = parseInt(process.env.PORT, 10) || 2929;
const routes = require('../router');
const path = require('path');
const { parse } = require('url');
const { join } = require('path');
const root = process.cwd();
const app = next({dev: process.env.NODE_ENV !== 'production'})
const handler = routes.getRequestHandler(app)
 

console.log("my focus is here");
// With express
const express = require('express')
app.prepare().then(() => {
	const server = express();
	server.get('*', (req, res) => {
		const { pathname } = parse(req.url, true);
		if (req.url.startsWith('/static/')) {
			res.setHeader('Service-Worker-Allowed', '/');
			app.serveStatic(req, res, join(root, `.next/${req.url}`));
		} else if (pathname === '/service-worker.js') {
			const filePath = join(root, 'public', pathname);

			app.serveStatic(req, res, filePath);
			// express.static(req, res, filePath);
		} else {
			return handler(req, res);
		}
	});
	server.listen(process.env.PORT, (err) => {
		if (err) throw err;
		console.log(`> Ready on http://localhost:${port}`);
	});
})
.catch((ex) => {
	console.error(ex.stack);
	process.exit(1);
});
