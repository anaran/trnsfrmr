function getHashMap()
{
	var o = localStorage["map"];
	var a = JSON.parse(o);
	
	var map = new Map;
	
	for (var i = 0; (i+1) < a.length; i+=2)
	{
		map.put(a[i], a[i+1]);
	}
			
	return map;
}

var default_icon = chrome.extension.getURL("icons/icon-16x16.png");

var notifyImages = new Array(
	chrome.extension.getURL("icons/anim/notify0.png"),
	chrome.extension.getURL("icons/anim/notify1.png"),
	chrome.extension.getURL("icons/anim/notify2.png"),
	chrome.extension.getURL("icons/anim/notify3.png"));

var notifyDelay = 300;

function animateNotify(tabId,pos)
{
	if(pos < notifyImages.length)
	{
		chrome.pageAction.setIcon({tabId: tabId, path: notifyImages[pos++] });
		setTimeout("animateNotify(" + tabId + "," + pos + ")", notifyDelay);
	}
	else
	{
		chrome.pageAction.setIcon({tabId: tabId, path: default_icon});
	}
}

function notify(tabId)
{
	animateNotify(tabId, 0);
}

function onRequest(request, sender, sendResponse)
{

	if (request.read == "map")
	{
		sendResponse( localStorage["map"] );
	}
	else if(request.pageaction == "show")
	{
		chrome.pageAction.show(sender.tab.id);
		sendResponse({});
	}
	else if(request.pageaction == "notify")
	{
		console.log("pageaction notify");
		notify(sender.tab.id);
				
		sendResponse({});
	}
	else
	{
		sendResponse({}); // snub them.
	}

	
};

chrome.extension.onRequest.addListener(onRequest)