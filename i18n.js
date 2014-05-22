/*
Copyright (c) 2014 Niall Frederick Weedon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
(function(_) {
	"use strict";
	_.i18n = { };
	_.i18n._template = "";
	_.i18n._keys = { };

	/**
	* _.i18n.translate
	* Translate an elements innerHTML into the locale of the users
	* browser. The element can also be forcefully translated into a
	* particular locale by optionally providing the 'locale' parameter.
	*/
	_.i18n.translate = function(selector, locale, rightToLeft) {
		var DEFAULT_LOCALE = "en-gb",
		MESSAGES_LOCATION = "messages/",

		/**
		* _mapKeys
		* Map the keys of the received JSON object to
		* a flat object with 1 level. i.e.:
		* title: Top-level string
		* headers.jumbotron.header: Third-level string
		* headers.sections[1]: Second array element of second-level array
		*/
		_mapKeys = function(languagePack, preKey) {
			for(var key in languagePack) {
				if(languagePack.hasOwnProperty(key)) {
					var pk;

					if(preKey && isNaN(key)) {
						// If the key is not a number,
						// use the ${val.x.y} attribute notation
						pk = preKey + '.' + key;
					} else if(preKey) {
						// If the key is a number,
						// use the ${val.x[y]} array notation
						pk = preKey + '\\[' + key + '\\]';
					} else {
						pk = key;
					}

					// If one of the values is an object,
					// Map that objects keys also
					if(typeof(languagePack[key]) === 'object') {
						_mapKeys(languagePack[key], pk);
					} else {
						_.i18n._keys[pk] = languagePack[key];
					}
				}
			}
		},
		/**
		* _configureLanguagePack
		* Gets a language pack in JSON format, 
		* which will be used to update the templated
		* HTML document.
		*/
		_configureLanguagePack = function(locale, alreadyTried) {
			if(!locale) {
				locale = DEFAULT_LOCALE;
			}

			if(locale === _.i18n._currentLocale) {
				return;
			}

			_.i18n._currentLocale = locale;

			var messagesJSON = MESSAGES_LOCATION + locale + ".json";

			// Getting JSON has to be done in a synchronous
			// manner to avoid flicker on the page, when changing
			// from templated to actual attributes
			var request;

			if(window.XMLHttpRequest) {
				request = new XMLHttpRequest();
			} else {
				request = new ActiveXObject("Microsoft.XMLHTTP");
			}

			if(request) {
				request.open("GET", messagesJSON, false);
				request.overrideMimeType("application/json");
				request.send();

				if(request.status != 200 && !alreadyTried) {
					_configureLanguagePack(null, true);
				} else if(request.status == 200) {
					if(JSON.parse) {
						var data = JSON.parse(request.response);
						_mapKeys(data);
					}
				}
			}
		},
		/**
		* _replaceTemplateItem
		* Replace a templated entry in content
		* with the translatable data.
		*/
		_replaceTemplateItem = function(content, translatable, searchString) {
			// Replace strings denoted with ${var} in HTML markup
			var itemReplacement = new RegExp("\\${" + searchString + "}", 'g');
			return content.replace(itemReplacement, translatable);
		},

		_bidi = function(selector, rightToLeft) {
			if(rightToLeft) {
				document.querySelector(selector).style.direction = "RTL";
			} else {
				document.querySelector(selector).style.direction = "LTR";
			}
		},

		_findSelectorHtml = function(selector) {
			if(selector === 'html') {
				return _.i18n._template;
			} else {
				// Use the DOM Parser if it is available
				if(window.DOMParser) {
					var parser = new DOMParser();
					var doc = parser.parseFromString(_.i18n._template,"text/html");
					// If the browser is not capable of parsing a string to
					// HTML, go to last resort and create an element
					if(doc) {
						return doc.querySelector(selector).innerHTML;
					}
				} 

				var el = document.createElement("div");
				el.innerHTML = _.i18n._template;
				return el.querySelector(selector).innerHTML;
			}
		};

		selector = selector || "html";

		// Store the entire templated page
		// if we want to change locales later
		if(!this._template) {
			this._template = document.querySelector("html").innerHTML;
		}
		
		// If a hardcoded locale is not defined,
		// get the browser locale
		if(!locale) {
			locale = window.navigator.userLanguage || window.navigator.language || DEFAULT_LOCALE;
		}

		locale = locale.toLowerCase();

		if(document.querySelector(selector)) {
			var pageContent = _findSelectorHtml(selector) || document.querySelector("html").innerHTML;
			// Get language pack and switch to default 
			// locale if the user locale is unavailable
			_configureLanguagePack(locale);

			// Update the template with the keys
			// and values that have been retrieved
			for(var key in this._keys) {
				if(this._keys.hasOwnProperty(key)) {
					pageContent = _replaceTemplateItem(pageContent, this._keys[key], key);
				}
			}

			// Update the page markup with the untemplated copy
			document.querySelector(selector).innerHTML = pageContent;

			// Implement Right-to-Left support
			if(selector === "html") {
				_bidi("body", rightToLeft);
			} else {
				_bidi(selector, rightToLeft);
			}
		}
	};
})(window);