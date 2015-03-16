// "Adrian Aichner" <adrian.aichner@googlemail.com>, Popchrom Project, 2013-04-29.
// tabsizer.js -- Gadget for Google Code working around issue support:1621 -->
document.addEventListener('DOMContentLoaded', function(event) {
	var tabSizeSelect = document.querySelector('select#tabsize');
	tabSizeSelect.addEventListener('change', function(event) {
		var sourceIframe = document.querySelector('iframe').contentDocument;
		var tabSizeRule = tabSizeSelect.value;
		// inject css rules bookmarklet source
		// by paul irish. public domain code.
		// http://paulirish.com/2008/bookmarklet-inject-new-css-rules/
		(function() {
			if ('\v' == 'v') /* ie only */
			{
				sourceIframe.createStyleSheet().cssText = tabSizeRule;
			} else {
				var tag = sourceIframe.createElement('style');
				tag.type = 'text/css';
				sourceIframe.getElementsByTagName('head')[0].appendChild(tag);
				tag[(typeof sourceIframe.body.style.WebkitAppearance == 'string') /* webkit only */ ? 'innerText' : 'innerHTML'] = tabSizeRule;
			}
		})();
	}, false);
}, false);
// tabsizer.js ends here