(function (root) {
	Array.prototype.indexOf = Array.prototype.indexOf ||
	function (a, b, c, r) {
		for (b = this, c = b.length, r = -1; ~c; r = b[--c] === a ? c : r);
		return r;
	};
	var _loadQ = [],
	_defineQ = [],
	_loadedFiles = {},
	_modules = {},
	_head,
	_dependencies = {},
	_rem = ["require", "exports", "module"],
	_config = {},
	_baseUrl = "",
	_urlArgs = "",
	_waitSeconds = 10,
	_paths = {};
	
	function _isArray(a) {
		return a instanceof Array;
	}
	function _normalize(path, prevPath) {
		path = path.replace(/(^|[^\.])(\.\/)/g, "$1");
		while (prevPath !== path) {
			prevPath = path;
			path = path.replace(/([\w,\-]*[\/]{1,})([\.]{2,}\/)/g, "");
		}
		return path.replace(/(\/{2,})/g, "/");
	}
	function _getContext(path) {
		return path.substr(0, path.lastIndexOf("/"));
	}
	function _resolve(path, context) {
		context = (path.indexOf(".") < 0) ? "" : context;
		if (~_rem.indexOf(path) || ~path.indexOf("!")) {
			return path.replace(/([\d,\w,\s,\.\/]*)(?=\!)/, function ($0, $1) {
				return _resolve($1, context);
			});
		}
		return _normalize((context ? context + "/" : "") + path);
	}
	function _checkLoadQ(i, j, q, ready) {
		for (i = _loadQ.length - 1; ~i && (q = _loadQ[i]); i--) {
			ready = 1;
			for (j = q.m.length - 1; ~j && ready; j--) {
				ready = _module(q.m[j]);
			}
			if (ready) {
				_loadQ.splice(i, 1);
				require(q.m, q.cb);
			}
		}
	}
	function _invokeAnonymousDefine(id, q) {
		if (_defineQ.length) {
			q = _defineQ.splice(0, 1)[0];
			if (q) {
				q.splice(0, 0, id);
				q.splice(q.length, 0, 1);
				define.apply(root, q);
			}
		}
	}
	function _inject(f, m, script, q, isReady, timeoutID) {
		_head = _head || document.getElementsByTagName('head')[0];
		script = document.createElement("script");
		script.type = 'text/javascript';
		script.src = f;
		script.charset = 'utf-8';
		script.onreadystatechange = script.onload = function () {
			if (!script.readyState || script.readyState === "complete" || script.readyState === "loaded") {
				clearTimeout(timeoutID);
				script.onload = script.onreadystatechange = script.onerror = null;
				_invokeAnonymousDefine(m);
			}
		};
		script.onerror = function (e) {
			clearTimeout(timeoutID);
			script.onload = script.onreadystatechange = script.onerror = null;
			throw new Error(f + " failed to load.");
		};
		timeoutID = setTimeout(script.onerror, _waitSeconds * 1000);
		_head.insertBefore(script, _head.firstChild);
		return 1;
	}
	function _load(modules, callback, context, i, q, m, f) {
		q = {
			m : modules,
			cb : callback
		};
		_loadQ.push(q);
		for (i = 0; i < modules.length; i++) {
			m = modules[i];
			if (~m.indexOf("!")) {
				_loadPluginModule(m, context, q, i);
				continue;
			}
			f = _getURL(m);
			_loadedFiles[f] = (!_module(m) && !_loadedFiles[f]) ? _inject(f, m) : 1;
		}
	}
	//加载插件
	function _loadPluginModule(module, context, q, moduleIndex, definition, plugin, pluginPath) {
		
		pluginPath = (context ? context + "/" : "") + "plugins/" + module.replace(/\//g, "_");
		
		if (q) {
			q.m[moduleIndex] = pluginPath;
		}
		module = module.split("!");
		plugin = module.splice(0, 1)[0];
		module = module.join("!");
		definition = _module(pluginPath);
		if (!q || definition) {
			return definition;
		}
		
		require(plugin, function (pluginModule) {
			module = pluginModule.normalize ? pluginModule.normalize(module, function (path) {
					return _resolve(path, context);
				}) : _normalize(module);
			function load(definition) {
				
				_module(pluginPath, {
					exports : definition
				});
				_checkLoadQ();
			}
			load.fromText = function (name, definition, dqL) {
				q.m[moduleIndex] = pluginPath = name;
				dqL = _defineQ.length;
				/* (function(){
				definition()
				})(); */
				/*这里不得不使用eval来解析脚本*/
				new Function(definition)();
				if (_defineQ.length - dqL) {
					_invokeAnonymousDefine(pluginPath);
				}
			};
			//如果针对该插件的配置没有则共享全局plugin的配置
			return pluginModule.load(module, require.localize(_getContext(plugin)), load, _config[plugin] || _config);
		});
	}
	function _module(id, def, noExports, module) {
		if (~_rem.indexOf(id)) {
			return id;
		}
		module = _modules[id] = def || _modules[id];
		return (module && module.exports) ? (noExports ? module : module.exports) : 0;
	}
	function _getURL(id, prefix) {
		prefix = (!id.indexOf("/") || !id.indexOf("http")) ? "" : _baseUrl;
		for (var p in _paths) {
			id = id.replace(new RegExp("(^" + p + ")", "g"), _paths[p]);
		}
		return prefix + id + (id.indexOf(".") < 0 ? ".js" : "") + _urlArgs;
	}
	function _swapValues(a, s, j) {
		for (var i in s) {
			j = a.indexOf(i);
			if (~j) {
				a[j] = s[i];
			}
		}
		return a;
	}
	function _resolveCircularReferences(id, dependencies, circulars, i, j, d, subDeps, sd, cid) {
		_dependencies[id] = dependencies;
		for (i = 0; i < dependencies.length; i++) {
			d = dependencies[i];
			subDeps = _dependencies[d];
			if (subDeps) {
				for (j = 0; j < subDeps.length; j++) {
					sd = subDeps[j];
					if (dependencies.indexOf(sd) < 0) {
						if (sd !== id) {
							dependencies.push(sd);
						} else {
							_module(d, {
								exports : {}
								
							});
						}
					}
				}
			}
		}
	}
	//定义全局define方法
	function define(id, dependencies, factory, alreadyQed, depsLoaded, module, facArgs, context, ri) {
		if (typeof id !== 'string') {
			factory = dependencies;
			dependencies = id;
			id = 0;
			_defineQ.push([dependencies, factory]);
			return;
		}
		if (!_isArray(dependencies)) {
			factory = dependencies;
			dependencies = [];
		}
		if (!alreadyQed) {
			_defineQ.push(0);
		}
		context = _getContext(id);
		if (!dependencies.length && factory.length && typeof factory === "function") {
			factory.toString().replace(/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, "").replace(/(?:require)\(\s*["']([^'"\s]+)["']\s*\)/g, function ($0, $1) {
				if (dependencies.indexOf($1) < 0) {
					dependencies.push($1);
				}
			});
			dependencies = (_rem.slice(0, factory.length)).concat(dependencies);
		}
		if (dependencies.length && !depsLoaded) {
			_resolveCircularReferences(id, dependencies.slice(0));
			require(dependencies, function () {
				define(id, Array.prototype.slice.call(arguments, 0), factory, 1, 1);
			}, context);
			return;
		}
		module = _module(id, 0, 1);
		module = module || {
			exports : {}
			
		};
		module.id = id;
		module.url = _getURL(id);
		if (typeof factory === "function") {
			facArgs = _swapValues(dependencies.length ? dependencies : (_rem.slice(0, factory.length)), {
					"require" : require.localize(context),
					"module" : module,
					"exports" : module.exports
				});
			ri = facArgs.indexOf(require);
			if (~ri) {
				facArgs[ri] = require.localize(context);
			}
			module.exports = factory.apply(factory, facArgs) || module.exports;
		} else {
			module.exports = factory;
		}
		_module(id, module);
		delete _dependencies[id];
		_checkLoadQ();
	}
	define.amd = {
		//兼容jQuery
		jQuery : true
		
	};
	//全局require方法
	function require(ids, callback, context, plugins, i, modules) {
		if (!callback) {
			ids = _resolve(ids, context);
			callback = _module(ids);
			if (!callback) {
				plugin = _loadPluginModule(ids, context);
				if (plugin) {
					return plugin;
				}
				throw new Error(ids + " is not defined.");
			}
			return callback;
		}
		ids = (!_isArray(ids)) ? [ids] : ids;
		modules = [];
		for (i = 0; i < ids.length; i++) {
			ids[i] = _resolve(ids[i], context);
			modules.push(_module(ids[i]));
		}
		if (~modules.indexOf(0)) {
			_load(ids, callback, context);
			return;
		}
		return callback.apply(root, _swapValues(modules, {
				"require" : require
			}));
	}
	require.config = function (obj) {
		_config = obj || {};
		_baseUrl = _config.baseUrl || _baseUrl;
		_baseUrl += (_baseUrl && _baseUrl.charAt(_baseUrl.length - 1) !== "/") ? "/" : "";
		_urlArgs = _config.urlArgs ? "?" + _config.urlArgs : _urlArgs;
		_waitSeconds = _config.waitSeconds || _waitSeconds;
		for (var p in _config.paths) {
			_paths[p] = _config.paths[p];
		}
	};
	require.toUrl = function (id, context) {
		return _getURL(_resolve(id, context));
	};
	require.localize = function (context) {
		function localRequire(ids, callback) {
			return require(ids, callback, context);
		}
		localRequire.toUrl = function (id) {
			return require.toUrl(id, context);
		};
		return localRequire;
	};
	root.define = root.define || define;
	root.require = root.require || require;
	
})(window || exports);
