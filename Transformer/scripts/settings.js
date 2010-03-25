
// class for pageaction commands
function PageAction()
{
	this.visible = false;
	
	this.show = function()
	{
		if(!this.visible)
		{
			chrome.extension.sendRequest({cmd: "pageaction", action: "show"}, this.onResponse);
			this.visible = true;
		}
	}
	
	this.hide = function()
	{
		chrome.extension.sendRequest({cmd: "pageaction", action: "hide"}, this.onResponse);
		this.visible = false;
	}
	
	this.notify = function()
	{
		chrome.extension.sendRequest({cmd: "pageaction", action: "notify"}, this.onResponse);
	}
	
	// wo dont expect response
	this.onResponse = function(response)
	{
		console.log(response);
	}
}

// class for shorcut keys
function KeyInfo(keyCode, ctrl, alt, shift, meta, altGraph)
{
	this.keyCode  = keyCode;
	this.ctrlKey  = ctrl;
	this.altKey   = alt;
	this.shiftKey = shift;
	this.metaKey  = meta;
	this.altGraphKey = altGraph;
	
	this.equals = function (event)
	{
		return ((this.keyCode  == event.keyCode) &&
				(this.ctrlKey  == event.ctrlKey) &&
				(this.altKey   == event.altKey)  &&
				(this.shiftKey == event.shiftKey)  &&
				(this.metaKey  == event.metaKey)  &&
				(this.altGraphKey == event.altGraphKey) );		
	}
	
	this.fromEvent = function (event)
	{
		this.keyCode  = event.keyCode;
		this.ctrlKey  = event.ctrlKey;
		this.altKey   = event.altKey;
		this.shiftKey = event.shiftKey;
		this.metaKey  = event.metaKey;
		this.altGraphKey = event.altGraphKey;
	}
}

// Settings class
function Settings()
{
	this.map = new Map();
	
	this.replaceKey = new KeyInfo(32,true,false,false,false,false);
	this.globalReplaceKey = new KeyInfo(32,true,false,true,false,false);
	
	this.selectPhrase = true;
	
		
	this.onMessage = function (msg, sender, sendResponse)
	{
		if (msg.cmd == "push")
		{
			// *** UGLY HACK *** UGLY HACK *** UGLY HACK *** UGLY HACK 
			var s = settings;
			// *** UGLY HACK *** UGLY HACK *** UGLY HACK *** UGLY HACK 

			s.processMessage(msg);
			sendResponse({}); // snub them.
		}
	}
	

	this.readRequest = function()
	{
		chrome.extension.sendRequest({cmd: "read"}, this.processMessage);
	}
	
	this.enableListener = function()
	{
		chrome.extension.onRequest.addListener(this.onMessage);
	}
	
	this.processMessage = function (msg)
	{		
//		var s = this; // this is NOT THIS. caused by asynchronous call...

		// *** UGLY HACK *** UGLY HACK *** UGLY HACK *** UGLY HACK 
		var s = settings;
		// *** UGLY HACK *** UGLY HACK *** UGLY HACK *** UGLY HACK 

		
		if (msg.map) s.refreshMap(msg.map);
		if (msg.replaceKey) s.replaceKey = JSON.parse(msg.replaceKey);
		if (msg.globalReplaceKey) s.globalReplaceKey = JSON.parse(msg.globalReplaceKey);
		if (msg.selectPhrase) s.selectPhrase = JSON.parse(msg.selectPhrase);
	}
	
	this.refreshMap = function (mapdata)
	{
		var a = JSON.parse(mapdata);
		
		this.map = new Map;

		// read array pairwise to fill hashmap
		for (var i = 0; (i+1) < a.length; i+=2)
		{
			this.map.put(a[i], a[i+1]);
		}
	}
}
