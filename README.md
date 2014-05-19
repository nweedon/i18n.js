i18n.js
=======
i18n.js is a JavaScript component written to aid in the internationalisation (i18n) of web pages. i18n.js is currently a jQuery plugin; but a jQuery-less version is currently being worked on. 

####Bower Install
Bower install to come!

####Using the jQuery Plugin
Simply add i18n-jQuery.js via a script tag in your web page, after jQuery.
'''
<script src="i18n-jQuery.js"></script>
''' 
By default, i18n.js will detect the locale of the users' browser and attempt to use that locale in translation.
Once the page is ready, you can translate it as easily as this:
'''
$(window).ready(function() {
	$().translate();
});
'''

This will translate the entire HTML document. If you want to translate only a part of your page, you can translate it easily by providing a CSS selector:
'''
$(".jumbotron > h1")
'''

You can also force the page into a particular locale, if you wish:
'''
$(".jumbotron > h1").translate('ja');	
'''

For languages that require Right-to-Left (BiDi) support, provide a second parameter (this has to be true):
'''
$(".jumbotron > h1").translate('he', true);	
'''

####Providing Language Files
Languages files are provided in a JSON format, retrieved via AJAX. The default folder for these files is called 'messages'. This can be changed by modifying this line:
'''
MESSAGES_LOCATION = "messages/",
''' 

The default locale is 'en-gb'. This means that if a specified locale file cannot be found, i18n.js will fall back to this file. Make sure at least this fallback file is provided! An example of this file is shown below:
'''
{
	"key" : "value",
	"array" : [1, 2, 3],
	"object" : { "array" : [1, 2, 3] }
}
'''

####How do I put i18n in my pages?
That's just as simple! Consider the JSON object in the last section. We can reference parts of this object from HTML Markup like this:
'''
key: ${key}
Second value of array: ${array[1]}
Second value of array in object: ${object.array[1]}
'''

Easy, right? If you're still a little confused, I urge you to view the samples.


####What does each sample do?
index: Default translation of the entire page.
force-ja: Force entire page to be translated into Japanese.
force-ja-jumbotron: Force only the Jumbotron the be translated into Japanese via a CSS selector. Nothing else will be translated.
force-he-rtl: Force entire page to be translated into Hebrew, also activating Right-to-Left (BiDi) support. 

####Final Note
I pulled the translations from Google Translate for the samples, so please don't mention them unless absolutely necessary. You should really get someone who knows the language to write a language pack for you. :)