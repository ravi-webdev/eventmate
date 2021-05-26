const routes = require('next-routes');

const baseRouter = routes();
module.exports = baseRouter
	.add({ name: 'home', pattern: '/', page: 'index' })
	.add({name: 'about', pattern: '/about', page: 'eventmate/about' });