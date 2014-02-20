 /* ========================================================================
	* Bootstrap extend: wshare
	* http://github.com/loo2k/wshare
	* ======================================================================== 
	* Copyright 2013 LOO2K.
	*
	* Licensed under the Apache License, Version 2.0 (the "License");
	* you may not use this file except in compliance with the License.
	* You may obtain a copy of the License at
	*
	* http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing, software
	* distributed under the License is distributed on an "AS IS" BASIS,
	* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	* See the License for the specific language governing permissions and
	* limitations under the License.
	* ========================================================== */
!function($) {
	"use strict";

	var wshare = function(element, options) {
		this.init(element, options)
	}

	wshare.prototype = {
		constructor : wshare

		, init : function(element, options) {
			var that = this;
			this.$element = $(element);
			this.options = options || {};
		}

		, postShare : function(_target) {
			var type		= this.options.type || $(_target).data('type');
			var source	= this.options.source || $(_target).data('source');
			var target	= this.options.target || $(_target).data('target');

			var WContent	= this.getShareValue('wsContent');
			var WUrl			= this.getShareValue('wsUrl');
			var WPic			= this.getShareValue('wsPic');
			var WVideo		= this.getShareValue('wsVideo');
			var shareUrl	= this.generatorShare(type, WContent, WUrl, WPic, WVideo);

			this.openShareWin(shareUrl, 750, 500);
		}

		, generatorShare : function(type, content, url, pic, video) {
			var requestUrl = url;
			var contentUrl = '';
			var generator = {
				'weibo' : 'http://service.weibo.com/share/share.php?title=%content%&url=%url%&pic=%pic%',
				'qq' : 'http://share.v.t.qq.com/index.php?c=share&a=index&title=%content%&url=%url%&pic=%pic%'
			}
			var request = generator[type];
			if( !request ) alert('参数非法');
			if( !!video ) {
				requestUrl = video;
				contentUrl = !!url ? ' ' + url : '';
			}
			request = !!pic ? request.replace(/%pic%/g, encodeURIComponent(pic)) : request.slice(0, request.lastIndexOf('&'));
			request = !!requestUrl ? request.replace(/%url%/g, encodeURIComponent(requestUrl)) : ( request.slice(0, request.indexOf('url=') - 1 ) + request.slice(request.indexOf('%url%') + 5) );
			request = request.replace(/%content%/g, encodeURIComponent(content + contentUrl));
			return request;
		}

		, getShareValue : function(wsType) {
			var $wsType = typeof this.options[wsType];
			switch($wsType) {
				case 'function':
					var funcres = $.proxy(this.options[wsType], this)();
					if(!funcres) {
						return funcres;
					} else {
						return $.proxy(this.getDefaultValue, this, wsType)();
					}
					break;
				case 'string':
					return this.options[wsType];
					break;
				case 'undefined':
				default:
					return $.proxy(this.getDefaultValue, this, wsType)();
			}
		}

		, getDefaultValue : function(wsType) {
			var element 		= this.$element.context;
			var target 			= this.options.target || $(element).data('target') || $(element).attr('id');
			var targetName	= target + '_' + wsType;
			var targetElem	= $('#' + targetName);

			if( !window[targetName] && targetElem.length == 0) {
				targetName = wsType;
				targetElem = $('#' + targetName);
			}

			if( window[targetName] && typeof window[targetName] == 'string' ) {
				return window[targetName];
			} else if( targetElem.length > 0 && targetElem.val().length > 0 ) {
				return targetElem.val();
			} else {
				switch(wsType) {
					case 'wsContent':
						return $('title').text();
						break;
					case 'wsUrl':
						return window.location.href;
						break;
					case 'wsPic':
					case 'wsVideo':
					default:
						return false;
				}
			}
		}

		, openShareWin : function(url, width, height) {
			var name = "分享项目";
			var iWidth = width;
			var iHeight = height;
			var iTop = (window.screen.availHeight - 30 - iHeight) / 2;
			var iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
			var iParams = ['height='
				, iHeight
				, ',width='
				, iWidth
				, ',top='
				, iTop
				, ',left='
				, iLeft
				, ',toolbar=no,menubar=no,scrollbars=auto,resizeable=no,location=no,status=no'].join('');
			window.open(url, name, iParams);
		}
	}

 /* wshare PLUGIN DEFINITION
	* ========================= */

	var old = $.fn.wshare

	$.fn.wshare = function ( option, _target ) {
		return this.each(function () {
			var $this = $(this)
				, data = $this.data('wshare')
				, options = typeof option == 'object' && option
			if (!data) $this.data('wshare', (data = new wshare(this, options)))
			if (typeof option == 'string') data[option](_target)
		})
	}

	$.fn.wshare.Constructor = wshare

	$.fn.wshare.defaults = {
		type: 'weibo',
		target: false,
		wsContent: false,
		wsUrl: false,
		wsPic: false,
		wsVideo: false
	}


 /* wshare NO CONFLICT
	* =================== */

	$.fn.wshare.noConflict = function () {
		$.fn.wshare = old
		return this
	}
}(window.jQuery);

/* wshare DATA-API
	* ========================= */

$(document).on('click.wshare.data-api', '[data-toggle="wshare"]', function(e) {
	var $this = $(this);
	if( !$this.data('wshare') ) $this.wshare();
	$this.wshare('postShare', this);
})