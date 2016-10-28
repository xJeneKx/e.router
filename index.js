var _path;

module.exports = Router;

function Router() {
    if (!(this instanceof Router)) return new Router();

    this.routes = {
        GET: {},
        POST: {},
        PUT: {},
        DELETE: {},
        HEAD: {}
    };
}

Router.prototype.get = function (path, cb) {
    _path = genPath(path);
    this.routes.GET[_path.path] = {reg: new RegExp(_path.path, 'i'), params: _path.params, cb: cb};
    return this;
};

Router.prototype.post = function (path, cb) {
    _path = genPath(path);
    this.routes.POST[_path.path] = {reg: new RegExp(_path.path, 'i'), params: _path.params, cb: cb};
    return this;
};

Router.prototype.put = function (path, cb) {
    _path = genPath(path);
    this.routes.PUT[_path.path] = {reg: new RegExp(_path.path, 'i'), params: _path.params, cb: cb};
    return this;
};

Router.prototype.delete = function (path, cb) {
    _path = genPath(path);
    this.routes.DELETE[_path.path] = {reg: new RegExp(_path.path, 'i'), params: _path.params, cb: cb};
    return this;
};

Router.prototype.head = function (path, cb) {
    _path = genPath(path);
    this.routes.HEAD[_path.path] = {reg: new RegExp(_path.path, 'i'), params: _path.params, cb: cb};
    return this;
};

Router.prototype.other = function (method, path, cb) {
    _path = genPath(path);
    method = method.toUpperCase();
    if (!this.routes[method]) this.routes[method] = {};
    this.routes[method][_path.path] = {reg: new RegExp(_path.path, 'i'), params: _path.params, cb: cb};
    return this;
};


Router.prototype.add = function (path, routes) {
    let fPath;
    if (!routes && path && typeof path == 'object') {
        routes = path;
        path = '';
    }
    if (path[path.length - 1] == '/') path = path.substr(0, path.length - 1);
    path = '^' + path.replace(/\//g, '\\/');
    routes = routes.routes;
    for (let method in routes) {
        if (routes.hasOwnProperty(method)) {
            if (!this.routes[method]) this.routes[method] = {};
            for (let _path in routes[method]) {
                if (routes[method].hasOwnProperty(_path)) {
                    fPath = path + (_path.substr(1));
                    this.routes[method][fPath] = routes[method][_path];
                    this.routes[method][fPath].reg = new RegExp(fPath, 'i');
                }
            }
        }
    }
};

Router.prototype.R = function (params = {}) {
    let routes = this.routes;
    return function *(next) {
        let r = chPath(routes, this.method, this.path);
        yield routeParams(params);
        if (r) {
            if (this.method == 'HEAD') this.body = '';
            this.params = r.params;
            yield r.cb;
            yield next;
        } else {
            this.body = 'Not found';
            this.status = 404;
            yield next;
        }
    }
};

//Generation path
function genPath(path) {
    let p = path.match(/(:[a-z0-9_]+)/gi);
    if (!p) return {path: '^' + (path == '/' ? '\\/?' : path.replace(/\//g, '\\/')) + '$', params: {}};
    let l = p.length, params = [];
    path = path.replace(/\//g, '\\/');
    for (let a = 0; a < l; a++) {
        params[a] = p[a].substr(1);
        path = path.replace(p[a], '([^\\/]+?)\\/?');
    }
    return {path: '^' + path + '$', params: params};
}

//Check path
function chPath(routes, method, path) {
    let params = {}, r, l;
    for (let k in routes[method]) {
        if (routes[method].hasOwnProperty(k)) {
            r = path.match(routes[method][k].reg);
            if (r) {
                l = Object.keys(routes[method][k].params).length;
                for (let a = 0; a < l; a++) {
                    if (r[a + 1]) {
                        params[routes[method][k].params[a]] = r[a + 1];
                    }
                }
                return {params: params, cb: routes[method][k].cb};
            }
        }
    }
    return false;
}

function routeParams(params) {
    return function *() {
        if (params.cors) {
            this.cors = {};
            this.set('Access-Control-Allow-Origin', params.cors.Origin ? params.cors.Origin : '*');
            this.set('Access-Control-Allow-Methods', params.cors.Methods ? params.cors.Methods : 'GET, POST, PUT, DELETE, HEAD');
            this.set('Access-Control-Allow-Headers', params.cors.Headers ? params.cors.Headers : 'Origin, X-Requested-With, Content-Type, Accept');
        }
    };
}