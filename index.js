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

Router.prototype.get = function (path, ...cb) {
    _path = genPath(path);
    this.routes.GET[_path.path] = {reg: new RegExp(_path.path, 'i'), params: _path.params, cb: cb};
    return this;
};

Router.prototype.post = function (path, ...cb) {
    _path = genPath(path);
    this.routes.POST[_path.path] = {reg: new RegExp(_path.path, 'i'), params: _path.params, cb: cb};
    return this;
};

Router.prototype.put = function (path, ...cb) {
    _path = genPath(path);
    this.routes.PUT[_path.path] = {reg: new RegExp(_path.path, 'i'), params: _path.params, cb: cb};
    return this;
};

Router.prototype.delete = function (path, ...cb) {
    _path = genPath(path);
    this.routes.DELETE[_path.path] = {reg: new RegExp(_path.path, 'i'), params: _path.params, cb: cb};
    return this;
};

Router.prototype.head = function (path, ...cb) {
    _path = genPath(path);
    this.routes.HEAD[_path.path] = {reg: new RegExp(_path.path, 'i'), params: _path.params, cb: cb};
    return this;
};

Router.prototype.other = function (method, path, ...cb) {
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
    return async(ctx, next)=> {
        let r = chPath(routes, ctx.method, ctx.path);
        if (r) {
            if (ctx.method == 'HEAD') ctx.body = '';
            ctx.params = r.params;
            for (let a = 0, l = r.cb.length; a < l; a++) {
                await r.cb[a](ctx, next);
            }
            await routeParams(params)(ctx);
            await next();
        } else {
            ctx.body = 'Not found';
            ctx.status = 404;
            await routeParams(params)(ctx);
            await next();
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
    return async(ctx) => {
        if (params.cors) {
            ctx.set('Access-Control-Allow-Origin', params.cors.Origin ? params.cors.Origin : '*');
            ctx.set('Access-Control-Allow-Methods', params.cors.Methods ? params.cors.Methods : 'GET, POST, PUT, DELETE, HEAD');
            ctx.set('Access-Control-Allow-Headers', params.cors.Headers ? params.cors.Headers : 'Origin, X-Requested-With, Content-Type, Accept');
        }
    };
}