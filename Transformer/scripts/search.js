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
	
	addEventListenerToIframes();
	
	document.addEventListener("keydown", onKeyEvent, false); 
	
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
	
	return ( elemTextarea.length > 0 || findInputElements(elemInput) ); 
}

function findInputElements(elem)
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
		var element = e.srcElement;

		checkElements(element);
		
		// consume event
		e.returnValue=false;
		
		// TODO only if something was replaced
		pageaction.notify();
 	}
}

function extractKeyWord(str, s, e)
{
	var result = new Object()
	result.before = "";
	result.after  = "";
	result.key = "";
	
//	var s = element.selectionStart;
//	var e = element.selectionEnd;
	var word;

	// if nothing is selected find word boundaries
	if(s==e)
	{
		// string b(efore) and a(fter) cursor
		var b = str.substring(0,s);
		var a = str.substring(e);
	
		var rb = b.match(/\S*$/);
		var ra = a.match(/^\S*/);
		
		s -= rb[0].length;
		e += ra[0].length;
	}
	

	result.before = str.substring(0,s);
	result.key    = str.substring(s,e);
	result.after  = str.substring(e);
	
	return result;
}


//replaces the keys with the assigned values in the element.
function checkElements(element)
{
	if( (element.tagName=="INPUT" && ((element.type == "text") || (element.type == "password"))) || element.tagName=="TEXTAREA")
	{
	
		// if text is selected abort... see wysiwyg-editor
		if (element.selectionStart != element.selectionEnd)
		{
			// TODO reenable if selection in  wysiwyg-editor works
			return;
		}
		
		var r = extractKeyWord(element.value, element.selectionStart, element.selectionEnd );
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
	else if ( (element.tagName=="HTML" && element.isContentEditable) || (element.tagName=="BODY" && element.contentEditable) )
	{	
		var doc = element.ownerDocument;
		var selection = doc.getSelection();
		
//		console.log( selection );
		
		if(selection.isCollapsed)
		{
			var element = selection.anchorNode;
			var s = selection.anchorOffset;

			var r = extractKeyWord(element.textContent, s, s);
			
			var value = settings.map.get(r.key);
		
			if(value)
			{
				value = replaceDates(value);
								
				var beforepos = r.before.length;
						
				// split text into "element" - "keyword" - "aftervalue"
				var keyword = element.splitText(beforepos);
				var aftervalue = keyword.splitText(r.key.length);
				
				
				// TODO check for other linebreaks like unix or mac style
				var lines = value.split("\n");
				
				
				// check if multiline
				if(lines.length > 1)
				{
					keyword.textContent="";
					var newNode = doc.createElement();
								
					for(i in lines)
					{
						var line = lines[i];
						
						newNode.appendChild( doc.createTextNode(line) );
						newNode.appendChild( doc.createElement("br") );
											
					}
					
						var range = doc.createRange();
						
						range.selectNode(keyword);
						range.insertNode(newNode);
				}
				else
				{
					keyword.textContent = value;
					newNode = keyword;
				}
				
				// set selection/cursor
		
				selection.removeAllRanges();
			
				var r = doc.createRange();
				r.selectNode(newNode);
				if(!settings.selectPhrase)
				{
					r.collapse(false);
				}
				
				selection.addRange(r);
			}
		}
		else
		{
			// replace selection
			var value = settings.map.get( selection.toString() );
			console.log(value);
			// TODO
		}
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
