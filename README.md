# e.router
Easy routing in Koajs ES7

### Installation
~~~sh
$ npm install e.router
~~~

### Examples
~~~javascript
const koa = require('koa');
const app = new koa();
const Route = require('e.router')();

Route.get('/', async(ctx, next) => {
    ctx.set('test', 'ok');
    await next();
}, async ctx => {
    ctx.body = '/';
});

Route.head('/', async ctx => {
    // Sending headers
    ctx.set('test', 'true');
});

Route.get('/user/:id/:photo', async(ctx, next) => {
    ctx.body = 'params id: ';
    await next();
});

Route.get('/user/:id/:photo', async(ctx) => {
    ctx.body += ctx.params.id;
});

app.use(Route.R());
app.listen(3000);
~~~

Run Node.js >= 7.0.0

~~~sh
$ node --harmony index
~~~

### All methods
~~~javascript
Route.get('/', ...middleware);
Route.post('/', ...middleware);
Route.put('/', ...middleware);
Route.delete('/', ...middleware);
Route.head('/', ...middleware);
Route.other('options', '/', ...middleware);
~~~

### Adding routing

index.js

~~~javascript
...
const users = require('./routes/users');

Route.add('/users/', users);
//or
//Route.add(users); // without a prefix

app.use(Route.R());
app.listen(3000);
~~~

routes/users.js

~~~javascript
const routes = require('../lib/e.router')();

routes.get('/', async ctx => {
    ctx.body = '/users/';
});

routes.get('/:id', async ctx => {
    ctx.body = '/users/' + ctx.params.id;
});

routes.get('/:id/photos', async ctx => { // /users/:id/photos
    ctx.body = '/users/' + ctx.params.id;
});

module.exports = routes;
~~~

### CORS
~~~javascript
app.use(Route.R({cors:{}})); // activate
// or
app.use(Route.R({cors: {Origin: 'example.com', Methods: 'GET', Headers: 'Origin'}}));
~~~

Default value
- Access-Control-Allow-Origin: *
- Access-Control-Allow-Methods: GET, POST, PUT, DELETE, HEAD
- Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept