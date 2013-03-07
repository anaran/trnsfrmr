function findTab(tabs) {
	var url = chrome.extension.getURL("options.html");

	for (i in tabs) {
		var tab = tabs[i];
		if (tab.url == url) {
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