/*css loader plugin for amd*/
define({
    //缓存是否加载过该文件
    _cache: {},
    /**
     * 通过该函数加载相应的资源
     * @param {String} name 加载的模块名
     * @param {Object} require
     * @param {Object} load
     * @param {Object} config 相应的插件配置，如果没有该插件配置，则默认使用全局配置
     */
    load: function(name, require, load, config){
    
        var head = document.getElementsByTagName('head')[0], link, baseUrl = config.baseUrl ? config.baseUrl : './', href = baseUrl + name;
        
        if (this._cache[href]) {
            load(this._cache[href]);
            return;
        }
        
        link = this.createLink(href + '.css');
        
        head.appendChild(link);
        load(link);
        this._cache[href] = true;
        
        
    },
    createLink: function(href){
        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.media = 'all';
        link.href = href;
        return link;
    }
});
