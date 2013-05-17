/*jslint browser: true, devel: true, todo: false */
/*global chrome: false*/
"use strict"; //$NON-NLS-0$

function findTab(tabs) {
	var url = chrome.extension.getURL("options.html"), //$NON-NLS-0$
		i, tab;
	for (i = 0; i < tabs.length; i++) {
		tab = tabs[i];
		if (tab.url === url) {
			chrome.tabs.update(tab.id, {
				selected: true
			});
			return;
		}
	}
	chrome.tabs.create({
		url: url
	});
}

chrome.tabs.getAllInWindow(null, findTab);