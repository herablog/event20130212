(function() {
	
	var log = $.log;
	
	/**
	 * XHR
	 * @constructor
	 * @param {string} method name. GET or POST or PUT or DELETE.
	 * @param {string} path(uri)
	 * @param {string} to post data
	**/
	function HttpRequest(method,path,data) {
		log.debug('HTTP',method,path);
		var self = this;
		var xhr = self.xhr = new XMLHttpRequest();
		// add time stamp to path for Android 2.x
		// Hint -> http://togetter.com/li/349252
		if ($.os.android) {
			log.debug('Add timestamp to URL for Android OS');
			path = createUrl(path);
		}

		function createUrl(path) {
			var a = document.createElement('a');
			a.href = path;
			path += (a.search) ? '&' : '?';
			path += 'now=' + new Date().getTime();
			return path;
		}

		function send() {
			log.debug('HTTP open',method,path);
			xhr.open(method,path);
			var body = data ? JSON.stringify(data) : null;

			// send data
			log.debug('XHR send', body, xhr);
			xhr.send(body);
		}

		var numTimeout = $.os.android ? 3000 : 10000;
		var beforeState = 0;

		xhr.timerId = setTimeout(function() {
			log.debug('HTTP timeout',method,path);
			xhr.abort();
			self.trigger('loaded', xhr);
			self.trigger('error', {code:'timeout',message:'timeout'});
		}, numTimeout);

		xhr.onreadystatechange = function() {
			if (beforeState === 4) return;
			var state = xhr.readyState;
			beforeState = state;

			log.debug('xhr state', state, (state === 4));
			if (state === 4) {
				var status = xhr.status;
				log.debug('xhr status', status, method, path, xhr.responseText);
				if (status === 0) { // aborted
					log.debug('xhr status aborted');
					return;
				};
				clearTimeout(xhr.timerId);

				var res;
				log.debug('xhr response text', xhr.responseText);
				if (xhr.responseText.charAt(0) === '{') {
					res = JSON.parse(xhr.responseText);
				} else {
					res = xhr.responseText;
				}
				log.debug('xhr response object', res);
				var code;

				if (200 <= status && status < 300) {
					log.debug('HTTP OK',method,path,xhr);
					code = 'complete';
				} else {
					log.error('HTTP',xhr.statusText,method,path);
					code = 'error';
				}
				self.trigger(code, res);
			} else if (state < 4) {
				var stateType = ['init','loading','loaded','interactive'][state];
				log.debug('HTTP state type',stateType,method,path);
				self.trigger(stateType,xhr);
			}
		};
		setTimeout(send, 0);
	}

	$.listenize(HttpRequest);

	/**
 	 * Generic HTTP Client
	 */
	$.http = {
		get: function() {
			var args = Array.prototype.slice.apply(arguments);
			var path = args[0];
			var callback = args[1];
			if (args.length === 3) {
				path = path + '?' + query(args[1]);
				callback = args[2];
			}
			return new HttpRequest('GET',path,null,callback);
		},
		post: function(path, data,callback) {
			return new HttpRequest('POST',path,data,callback);
		}, 
		put: function(path, data, callback) {
			return new HttpRequest('PUT',path,data,callback);
		},
		del: function(path, callback) {
			return new HttpRequest('DELETE',path,callback);
		}
	};
	
})();