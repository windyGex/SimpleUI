/*使用ajax同步获取文件*/
define(function(){
    var mircoXMLHttpArr = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP'], _cache = {},
	
	rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
	ajaxLocParts,
	ajaxLocation,

	rhash = /#.*$/,
	rprotocol = /^\/\//,
	rts = /([?&])_=[^&]*/,
	rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/;
	
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

    var xhr = function(){
        var xmlhttpReq;
        if (typeof XMLHttpRequest !== 'undefined') {
            xmlhttpReq = new XMLHttpRequest();
        }
        else {
            for (var i = 0; i < mircoXMLHttpArr.length; i++) {
                try {
                    xmlhttpReq = new ActiveXObject(mircoXMLHttpArr[i]);
                } 
                catch (e) {
                
                }
            }
            
        }
        return xmlhttpReq;
    }
    
    var getHtml = function(url, callback, errback){
	
		url = url.replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );
		//console.log(url);
        var x = xhr();
        x.open('GET', url, true);
        x.onreadystatechange = function(e){
            if (x.readyState === 4) {
                if (x.status < 400) {
                    callback(x.responseText);
                }
                else {
                    errback(new Error('fetchText() failed. status: ' + x.statusText));
                }
            }
        };
        x.send(null);
    }
    var errback = function(err){
        throw err;
    }
    return {
        load: function(name, require, load, config){
            var baseUrl = config.baseUrl ? config.baseUrl : './', href = baseUrl + name + '.html';
            
            if (_cache[href]) {
                load(_cache[href]);
            }
            else {
                getHtml(href, function(html){
                    _cache[href] = html;
                    load(html);
                });
            }
        }
    }
});
