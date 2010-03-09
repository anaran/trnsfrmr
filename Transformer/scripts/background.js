function getHashMap()
{
	var o = localStorage["map"];
	var a = JSON.parse(o);
	
	var map = new Map;
	
	for (var i = 0; (i+1) < a.length; i+=2)
	{
		map.put(a[i], a[i+1])	
	}
			
	return map;
}

  
chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse)
	{
		if (request.read == "map")
			sendResponse( localStorage["map"] );
		else
			sendResponse({}); // snub them.
	}
);