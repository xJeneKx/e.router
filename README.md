# e.router
Easy routing in Koajs

### Installation
~~~sh
$ npm install e.router
~~~

### Examples
~~~javascript
const koa = require('koa');
const app = koa();
const Route = require('e.router')();

Route.get('/', function *() {
    this.body = '/';
});

Route.head('/', function *() {
    // Sending headers
    this.set('test','true');
});

Route.get('/user/:id/:photo', function *() {
    this.body = this.params;
    // or
    // this.body = this.params.id;
});

app.use(Route.R());
app.listen(3000);
~~~

### All methods
~~~javascript
Route.get('/', middleware);
Route.post('/', middleware);
Route.put('/', middleware);
Route.delete('/', middleware);
Route.head('/', middleware);
Route.other('options', '/', middleware);
~~~

### Adding routing

index.js

~~~javascript
...
const users = require('./routes/users');

Route.add('/users/', users);

app.use(Route.R());
app.listen(3000);
~~~

routes/users.js

~~~javascript
const routes = require('e.router')();

routes.get('/', function *() { // /users/
    this.body = '/users/';
});

routes.get('/:id', function *() { // /users/:id
    this.body = '/users/' + this.params.id;
});

routes.get('/:id/photos', function *() { // /users/:id/photos
    this.body = '/users/' + this.params.id;
});

module.exports = routes;
~~~
