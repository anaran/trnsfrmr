var settings;
var pageaction;

setTimeout("init()", 0);

// init extension
function init()
{
	settings = new Settings();
	pageaction = new PageAction();
	
	settings.readRequest();
	settings.enableListener();
	
	// TODO uncomment for iframe support
//	addEventListenerToIframes();
	
	document.addEventListener("keydown", onKeyEvent, false); 
	
	pageaction.show();
	
}

function addEventListenerToIframes() 
{
	iframes = document.getElementsByTagName("iframe");
	
	for ( var i = 0; i < iframes.length; i++) 
	{
		var iframe = iframes[i];
		if(iframe.contentDocument)
			iframe.contentDocument.addEventListener("keydown", onKeyEvent, false);
		else if (iframe.contentWindow)
			iframe.contentWindow.addEventListener("keydown", onKeyEvent, false);
	}
	
	if (pageHasEditableElements()) 
	{
		pageaction.show();
	}
	
	setTimeout("addEventListenerToIframes()", 500);
}

function pageHasEditableElements() {
	var elemInput = document.getElementsByTagName("input");
	var elemTextarea = document.getElementsByTagName("textarea");
	if (checkElements(elemInput) || elemTextarea.length > 0 ) {
		return true;
	} else {
		return false;
	}
}

function checkElements(elem)
 {
	for(var i = 0; i < elem.length; i++) {
		var type = elem[i].type;
		type.toLocaleLowerCase();
		if ((type == "text") || (type == "password") || (type == "textarea")) {
			return true;
		}
	}
	return false;
}

// trigger replaceKeysWithValues method on key event space or enter
function onKeyEvent(e)
{
 	if ( settings.replaceKey.equals(e) )
	{
		console.log("onKeyEvent: replace shortcut");
		var element = e.srcElement;

		checkElements(element);
		
		// consume event
		e.returnValue=false;
		
		// TODO only if something was replaced
		pageaction.notify();
 	}
}

function extractKeyWord(element)
{
	var result = new Object()
	result.before = "";
	result.after  = "";
	result.key = "";
	
	var s = element.selectionStart;
	var e = element.selectionEnd;
	var word;

	// if nothing is selected find word boundaries
	if(s==e)
	{
		// string b(efore) and a(fter) cursor
		var b = element.value.substring(0,s);
		var a = element.value.substring(e);
	
		var rb = b.match(/\S*$/);
		var ra = a.match(/^\S*/);
		
		s -= rb[0].length;
		e += ra[0].length;
	}
	

	result.before = element.value.substring(0,s);
	result.key    = element.value.substring(s,e);
	result.after  = element.value.substring(e);
	
	return result;
}


//replaces the keys with the assigned values in the element.
function checkElements(element)
{
	if( (element.tagName=="INPUT" && ((element.type == "text") || (element.type == "password"))) || element.tagName=="TEXTAREA")
	{
		var r = extractKeyWord(element);
		var value = settings.map.get(r.key);
		
		if(value)
		{
			// date subsitution
			value = replaceDates(value);
			
			var tmp = r.before + value;
			
			var cursor = tmp.length;
			element.value = tmp + r.after;
			
			element.selectionStart = settings.selectPhrase? r.before.length : cursor;
			element.selectionEnd = cursor
		}
	}
	else if (element.tagName=="BODY" && element.contentEditable)
	{	
		element.innerHTML = globalReplacer(element.innerHTML);		
	}
	else if (element.tagName=="HTML" && element.isContentEditable)
	{	
		var body = element.getElementsByTagName("body")[0];
		body.innerHTML = globalReplacer(body.innerHTML);		body.focus();		
	}
}


// global replacer
function globalReplacer(value)
{
	var m = settings.map;
	// check all keys
	for(var j = 0; j++ < m.size; m.next())
	{ 
		value = value.replace(new RegExp("\\b" + m.key() + "\\b", "g"),  m.value());
		value = replaceDates(value);
	}
	return value;
}

