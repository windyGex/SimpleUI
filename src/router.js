define(function (require) {
    var $ = require('jquery'),
        Events = require('./events'),
        declare = require('./declare'),
        Attribute = require('./attribute');

    var documentMode = window.document.documentMode,
        oldIE = (!documentMode || documentMode <= 8),
        //IE8 的兼容模式不支持hashchange
        hashChangeSupported = ('onhashchange' in window) && !oldIE,

        pushStateSupported = ('pushState' in window.history);

    //this is hashchange
    var HashChangeHistory = declare(Events, {

        init: function () {
            $(window).on('hashchange', $.proxy(this.change, this));
        },

        getHash: function () {
            return window.location.hash.substring(1);
        },
        change: function () {
            var hash = this.getHash();
            if (this.currentHash != hash) {
                this.trigger('change', hash);
                this.currentHash = hash;
            }
        },
        //options.replace 是否产生历史记录
        //options.disableEvent 是否禁止事件
        navigate: function (url, options) {
            options = options || {};
            var href;
            url = url.replace(/^#*/, '');
            if (options.disableEvent) {
                this.currentHash = url;
            }
            if (options.replace) {
                href = window.location.href.replace(/(javascript:|#).*$/, '');
                window.location.replace(href + '#' + url);
            } else {
                location.hash = url;
            }
        }
    });

    var PushStateHistory = declare(Events, {


        init: function (config) {
            config = config || {};
            //ROOT指站点的根目录,设置了root的绝对路径，其他资源则会相对改路径进行定位
            this.root = config.root || window.location.pathname;
            this.fullUrl = this.getFullUrl() + this.root;
            //这个事件只在前进后退的时候有效好大的坑啊
            //与hashchange事件不一致
            $(window).on('popstate', $.proxy(this.change, this));
        },

        getFullUrl: function () {
            var location = document.location, rootUrl = location.protocol + '//' + (location.hostname || location.host);
            if (location.port || false) {
                rootUrl += ':' + location.port;
            }
            // Return
            return rootUrl;
        },

        getUrl: function () {
            var fullUrl = this.getFullUrl(), root = this.root;
            return window.location.href.replace(fullUrl + root, '');
        },
        change: function () {
            var url = this.getUrl();
            if (this.currentUrl != url) {
                this.trigger('change', url);
                this.currentUrl = url;
            }
        },
        //options.replace 是否产生历史记录
        //options.disableEvent 是否禁止事件
        navigate: function (url, options) {
            options = options || {};
            var fragment = this.root + url;
            if (!options.disableEvent) {
                this.trigger('change', url);
                this.currentUrl = url;
            }
            if (options.replace) {
                window.history.replaceState({}, document.title, fragment);
            } else {
                window.history.pushState({}, document.title, fragment);
            }
        }
    });

    var IframeHistory = declare(Events, {

        init: function () {
            this.lastHash = this.getHash();
            this.create(this.lastHash);
            setInterval($.proxy(this.poll, this), 50);
        },
        create: function (hash) {
            var iframe = '<iframe src="javascript:(function(){document.open(\'text/html\',\'replace\');document.domain =\'' + (document.domain) + '\';document.close();})();" tabindex="-1" />';
            this.iframe = $(iframe).hide().appendTo(document.body);
            this.iframe = this.iframe[0];
            this.lastIframeHash = hash;
            this._updateIframeHash(hash);
        },
        getHash: function () {
            return window.location.hash.substring(1);
        },
        getIframeHash: function () {
            if (!this.iframe || !this.iframe.contentWindow) {
                return '';
            }
            //TODO: add ajax call #!
            var prefix = '', hash = this.iframe.contentWindow.location.hash.substr(1);

            return prefix && hash.indexOf(prefix) === 0 ? hash.replace(prefix, '') : hash;
        },
        _updateIframeHash: function (hash, replace) {
            var iframeDoc = this.iframe && this.iframe.contentWindow && this.iframe.contentWindow.document,
                iframeLocation = iframeDoc && iframeDoc.location;

            if (!iframeDoc || !iframeLocation) {
                return;
            }

            if (replace) {
                iframeLocation.replace(hash.charAt(0) === '#' ? hash : '#' + hash);
            } else {
                iframeDoc.open().close();
                iframeLocation.hash = hash;
            }

        },
        _updateHash: function (hash, replace) {
            var href;
            if (replace) {
                href = window.location.href.replace(/(javascript:|#).*$/, '');
                window.location.replace(href + '#' + hash);
            } else {
                window.location.hash = hash;
            }
        },
        change: function () {
            if (this.currentHash != this.lastHash) {
                this.trigger('change', this.lastHash);
                this.currentHash = this.lastHash;
            }
        },
        poll: function () {
            var iframeHash = this.getIframeHash(),
                hash = this.getHash();
            //back or forward
            if (this.lastIframeHash != iframeHash) {
                this._updateHash(iframeHash);
                this.lastIframeHash = iframeHash;
                this.lastHash = iframeHash;
                this.change();
                //application cause
            } else if (hash != this.lastHash) {
                if (iframeHash != hash) {
                    this._updateIframeHash(hash);
                }
                this.lastHash = hash;
                this.change();
            }
        },
        navigate: function (url, options) {
            options = options || {};
            this._updateHash(url, options.replace);
            if (options.disableEvent) {
                this.currentHash = url;
            }
        }
    });

    var Router = declare('Router', Attribute, {
        routes: {},
        pushState: false,
        root: '',
        init: function (config) {
            this._routes = {};
            $.each(this.get('routes'), $.proxy(function (route, callback) {
                this.add(route, callback);
            }, this));
            if (this.get('pushState') && pushStateSupported) {
                this.history = new PushStateHistory({
                    root: this.get('root')
                });
            } else {
                if (hashChangeSupported) {
                    this.history = new HashChangeHistory();
                } else {
                    this.history = new IframeHistory();
                    //throw new Error('old browser not supported!')
                }
            }
        },
        start: function () {
            if (!this._started) {
                this.history.on('change', $.proxy(this._navigate, this));
                this.history.change();
                this._started = true;
            }
        },
        navigate: function (url, options) {
            this.history.navigate(url, options);
        },
        _navigate: function (url) {
            var route, query = {}, handle, self = this;
            var urlMatches = url.match(/(.*)\?(.*)/);
            if (urlMatches) {
                route = urlMatches[1];
                query = decodeQueryString(urlMatches[2], true);
            } else {
                route = url;
            }
            if (route) {
                var req = {
                    params: {},
                    query: query
                }, res = {}, callback;
                $.each(this._routes, $.proxy(function (i, routeMeta) {
                    var matches = route.match(routeMeta.regex);
                    if (matches && matches.length) {
                        matches.shift();
                        $.each(routeMeta.params, function (index, key) {
                            req.params[key] = matches[index];
                        });
                        req.url = url;
                        req.route = routeMeta.route;
                        //避免引用造成的问题
                        callback = $.extend([], routeMeta.callback);
                    }
                }, this));
                if (!callback) {
                    //do sth;
                    //this.redirect('*');
                } else {
                    req.next = function (error) {
                        if (error) {
                            callback = [];
                            return self;
                        }
                        handle = callback.shift();
                        if (handle) {
                            handle.call(self, req, res, req.next);
                        }
                    };
                    req.next();
                }
            } else {
                this.trigger('ready');
            }
        },
        redirect: function (url) {
            this.history.navigate(url, {
                replace: true
            });
        },
        //callback is an array;
        add: function (route, callback) {
            //'handle' --> this.handle
            callback = this._convertRightCallback(callback);
            if (!this._routes[route]) {
                var routeMeta = this._parse(route);
                if ($.isArray(callback)) {
                    routeMeta.callback = callback;
                } else {
                    routeMeta.callback = [callback];
                }
                this._routes[route] = routeMeta;
            } else {
                //[handle1,handle2]-->[handle,handle1,handle2]
                if ($.isArray(callback)) {
                    this._routes[route].callback.cocat.apply(this._routes[route].callback, callback);
                } else {
                    //'handle1' --> [handle handle1]
                    this._routes[route].callback.push(callback);
                }
            }
        },
        _parse: function (route) {
            var res = {
                route: route,
                regex: null,
                params: [],
                optionalParams: []
            }, url = route;
            if ({}.toString.call(route) !== '[object RegExp]') {
                //optional parameters
                /*var optionalMatches = url.match(/\(\/:([a-zA-Z0-9_]+)\)/g);
                 if(optionalMatches){
                 for(var j in optionalMatches){
                 optionalMatches[j] = optionalMatches[j].replace(/\(\/\:(.*)\)/,function($1,$2){
                 return $2;
                 });
                 }
                 res.optionalParams = optionalMatches;
                 url = url.replace(/\(\/:([a-zA-Z0-9_]+)\)/g,'(\/[a-zA-Z0-9_]+)?')
                 }*/
                //require parameters
                var matches = url.match(/\:([a-zA-Z0-9_]+)/g);
                if (matches) {
                    matches = $.map(matches, function (match) {
                        return match.substring(1);
                    });
                    res.params = matches;
                    url = url.replace(/\:([a-zA-Z0-9_]+)/g, '([a-zA-Z0-9_]+)');
                }
                res.regex = new RegExp('^' + url + '/?$');
            } else {
                res.regex = route;
            }
            return res;
        },
        //string --> function
        _convertRightCallback: function (callback) {
            var self = this;
            if (typeof callback === 'string') {
                return this[callback];
            }
            if ($.isArray(callback)) {
                $.each(callback, function (handle, index) {
                    handle = self._convertRightCallback(handle);
                    callback[index] = handle;
                });
                return callback;
            }
            return callback;
        }
    });

    var UNDEF;

    function typecastValue(val) {
        var r;
        if (val === null || val === 'null') {
            r = null;
        } else if (val === 'true') {
            r = true;
        } else if (val === 'false') {
            r = false;
        } else if (val === UNDEF || val === 'undefined') {
            r = UNDEF;
        } else if (val === '' || isNaN(val)) {
            //isNaN('') returns false
            r = val;
        } else {
            //parseFloat(null || '') returns NaN
            r = parseFloat(val);
        }
        return r;
    }

    function typecastArrayValues(values) {
        var n = values.length, result = [];
        while (n--) {
            result[n] = typecastValue(values[n]);
        }
        return result;
    }

    //borrowed from AMD-Utils
    function decodeQueryString(str, shouldTypecast) {
        var queryArr = (str || '').replace('?', '').split('&'), n = queryArr.length, obj = {}, item, val;
        while (n--) {
            item = queryArr[n].split('=');
            val = shouldTypecast ? (item[1]) : item[1];
            obj[item[0]] = ( typeof val === 'string') ? decodeURIComponent(val) : val;
        }
        return obj;
    }

    return Router;
});
