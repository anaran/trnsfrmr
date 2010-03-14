var default_icon = chrome.extension.getURL("icons/icon-16x16.png");

var notifyImages = new Array(
	chrome.extension.getURL("icons/anim/notify0.png"),
	chrome.extension.getURL("icons/anim/notify1.png"),
	chrome.extension.getURL("icons/anim/notify2.png"),
	chrome.extension.getURL("icons/anim/notify3.png"),
	chrome.extension.getURL("icons/anim/notify4.png"),
	chrome.extension.getURL("icons/anim/notify5.png"),
	chrome.extension.getURL("icons/anim/notify6.png"),
	chrome.extension.getURL("icons/anim/notify7.png"),
	chrome.extension.getURL("icons/anim/notify8.png"),
	chrome.extension.getURL("icons/anim/notify9.png"));

var notifyDelay = 100;


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

function playSound()
{	
	try {
		document.getElementById('notify_sound').currentTime = 0;
		document.getElementById('notify_sound').play();
	}
	catch(e) { console.error(e); }
}


function animateNotify(tabId,pos)
{
	if(pos < notifyImages.length)
	{
		chrome.pageAction.setIcon({tabId: tabId, path: notifyImages[pos++] });
		setTimeout(function() { animateNotify(tabId, pos); }, notifyDelay);
	}
	else
	{
		chrome.pageAction.setIcon({tabId: tabId, path: default_icon});
	}
}

function notify(tabId)
{
	if (localStorage["animate"] == "true") animateNotify(tabId, 0);
	if (localStorage["sound"] == "true") playSound();
}

function onRequest(request, sender, sendResponse)
{

	if (request.read == "map")
	{
		sendResponse( localStorage["map"] );
	}
	else if(request.pageaction == "show")
	{
		if (localStorage["hideicon"] != "true")
		{
			chrome.pageAction.show(sender.tab.id);
		}
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

chrome.extension.onRequest.addListener(onRequest);