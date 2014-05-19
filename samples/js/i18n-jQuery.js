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
(function(_, $) {
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
			$.map(languagePack, function(val, key) {
				if(preKey && isNaN(key)) {
					// If the key is not a number,
					// use the ${val.x.y} attribute notation
					key = preKey + '.' + key;
				} else if(preKey) {
					// If the key is a number,
					// use the ${val.x[y]} array notation
					key = preKey + '\\[' + key + '\\]';
				}

				// If one of the values is an object,
				// Map that objects keys also
				if(typeof(val) === 'object') {
					_mapKeys(val, key);
				} else {
					_.i18n._keys[key] = val;
				}
			});
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
			$.ajax({
				url: messagesJSON,
				dataType: "json",
				async: false,
				success: function(data) {
					_mapKeys(data);
				},
				error: function() {
					// If the language pack requested is not available,
					// display the default locale. alreadyTried is set to
					// true here, so if 'messages.json' does not exist, we
					// don't get a stack overflow.
					if(!alreadyTried) {
						_configureLanguagePack(null, true);
					}
				}
			});
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
				$(selector).css("direction", "RTL");
			} else {
				$(selector).css("direction", "LTR");
			}
		};

		selector = selector || "html";

		// Store the entire templated page
		// if we want to change locales later
		if(!this._template) {
			this._template = $("html").html();
		}
		
		// If a hardcoded locale is not defined,
		// get the browser locale
		if(!locale) {
			locale = window.navigator.userLanguage || window.navigator.language || DEFAULT_LOCALE;
		}

		locale = locale.toLowerCase();

		if($(selector)[0]) {
			var pageContent = $(this._template).find(selector).html() || $("html").html();
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
			$(selector)[0].innerHTML = pageContent;

			// Implement Right-to-Left support
			if(selector === "html") {
				_bidi("body", rightToLeft);
			} else {
				_bidi(selector, rightToLeft);
			}
		}
	};

	$.fn.translate = function(locale, rightToLeft) {
		_.i18n.translate(this.selector, locale, rightToLeft);
	};
})(window, jQuery);