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

        if( checkElements(element) )
        {
            pageaction.notify();
        }
        // consume event
        e.returnValue=false;        
    }
}

function extractKeyWord(str, s, e)
{
//  "use strict";
    var result = new Object()
    result.before = "";
    result.after  = "";
    result.key = "";
    
//  var s = element.selectionStart;
//  var e = element.selectionEnd;
    var word;

    // if nothing is selected find word boundaries
    if(s==e)
    {
        // string b(efore) and a(fter) cursor
        var b = str.substring(0,s);
        var a = str.substring(e);
    
        var rb = b.match(/\w*$/);
        var ra = a.match(/^\w*/);
        
        s -= rb[0].length;
        e += ra[0].length;
    }
    

    result.before = str.substring(0,s);
    result.key    = str.substring(s,e);
    result.after  = str.substring(e);
    
    return result;
}

// FIXME Eliminate this global variable.
var unExpandedValue;

function handleArguments(value, r)
{
  try {
    var x = JSON.parse(value);
    if (x.length != 2) {
      alert(chrome.i18n.getMessage("extname") + ": " + "Advanced abbreviations have exactly two string elements:"
            + "\ne.g.\n[\"(\\d+)\\s+(\\w+)\",\n \"$1: $2\"]"
            + "\nPlease fix definition of abbreviation \"" + r.key + "\"\n" + value);
    }
    try {
      var fromRegExp = new RegExp("^" + x[0], "");
    }
    catch (e) {
      //              NOTE The initial array element is not a string (can be used in a RegExp constructor).
      alert(chrome.i18n.getMessage("extname") + ": " + e.toString());
    }
    var toReplacement = x[1];
    //          NOTE Is replacement argument really a string?
    if (typeof(toReplacement) != "string") {
      alert(chrome.i18n.getMessage("extname") + ": " + toReplacement + " is not a double-quoted string, as expected for an advanced abbreviation!\nPlease fix abbreviation \"" + r.key + "\"\n" + value);
    }
    try {
      var m = r.after.match(fromRegExp)
        if (m == null) {
          alert(chrome.i18n.getMessage("extname") + ": \"" + fromRegExp + "\" does not match arguments\nfor \"" + r.key + "\" \""
                + r.after.substring(0, Math.min(r.after.length, 15)) + (r.after.length > 15 ? "..." : "") + "\"\nPlease fix arguments or definition of abbreviation \"" + r.key + "\"\n" + value);
          return;
        }
      unExpandedValue = r.key + m[0];
      offsetFromEnd = r.after.length - m[0].length;
      // x = r.after.replace(fromRegExp, toReplacement);
      //              alert("m="+JSON.stringify(m));
    }
    catch (e) {
      alert(chrome.i18n.getMessage("extname") + ": " + e.toString());
    }
    value = m[0].replace(fromRegExp, toReplacement);
    r.after = r.after.substring(m[0].length);
  } catch (e) {
    // NOTE Reporting all exceptions here would be annoying.
    // It would come up for every simple abbreviation expansion which is not a valid
    // JSON text.
    // It might still be useful to report other errors to point out likely
    // syntactical errors of advanced abbrevations.
    if (e && e.toString() != "SyntaxError: Unexpected token " + typeof value == "string" ? value.substring(0, 1) : "") {
      alert(chrome.i18n.getMessage("extname") + ": " + e.toString()
            + "\nPlease fix definition of Abbreviation \"" + r.key + "\"\n" + value);
    } else {
        unExpandedValue = r.key;
    }
  }
  return value;
}

//replaces the keys with the assigned values in the element.
function checkElements(element)
{
//  "use strict";
    var substituted = false;
    
    if( (element.tagName=="INPUT" && ((element.type == "text") || (element.type == "password"))) || element.tagName=="TEXTAREA")
    {
    
        // if text is selected abort... see wysiwyg-editor
        if (element.selectionStart != element.selectionEnd)
        {
            var oldSelectionStart = element.selectionStart;
            element.value = element.value.substring(0, element.selectionStart) + unExpandedValue + element.value.substring(element.selectionEnd, element.value.length);
            element.selectionStart = element.selectionEnd = oldSelectionStart;
            // TODO reenable if selection in  wysiwyg-editor works
            return;
        }
        
        var r = extractKeyWord(element.value, element.selectionStart, element.selectionEnd );
        var value = settings.map.get(r.key);
        
        var offsetFromEnd;
//        unExpandedValue = r.key;
        value = handleArguments(value, r);
        if(value)
        {
            substituted = true;
            
            // date substitution
            value = replaceDates(value);
            
            var tmp = r.before + value;
            
            var cursor = tmp.length;
            element.value = tmp + r.after;
            
//             if (r.after == "" && offsetFromEnd != null) {
//                 cursor = cursor - offsetFromEnd
//             }
            element.selectionStart = settings.selectPhrase? r.before.length : tmp.length;
            element.selectionEnd = tmp.length;
        }
    }
    else if ( (element.tagName=="HTML" && element.isContentEditable) || (element.tagName=="BODY" && element.contentEditable) )
    {   
        var doc = element.ownerDocument;
        var selection = doc.getSelection();
//        NOTE undefined!
//        alert("element.selectionStart(HTML|BODY) " + element.selectionStart)
//      console.log( selection );
        
        if(selection.isCollapsed)
        {
            var element = selection.anchorNode;
            var s = selection.anchorOffset;

            var r = extractKeyWord(element.textContent, s, s);
            
            var value = settings.map.get(r.key);
//            unExpandedValue = r.key;
            value = handleArguments(value, r);
            if(value)
            {
                substituted = true;
                value = replaceDates(value);
                                
                var beforepos = r.before.length;
						
                // split text into "element" - "keyword" - "aftervalue"
                var keyword = element.splitText(beforepos);
                var aftervalue = keyword.splitText(unExpandedValue.length);
                
                
                // TODO check for other linebreaks like unix or mac style
                var lines = value.split("\n");
                
                
                // check if multiline
                if(lines.length > 1)
                {
                    keyword.textContent="";
					// FIXME: is the div tag needed?
                    var newNode = doc.createElement("div");
                                
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
          // replace selection with unExpandedValue and collapse it.
//           console.log(selection);
//            selection.deleteFromDocument();
//            selection.anchorNode.data = selection.anchorNode.data + " " + unExpandedValue + " ";
//           selection.anchorNode.data = unExpandedValue;
          selection.getRangeAt().deleteContents();
          selection.getRangeAt().insertNode(doc.createTextNode(unExpandedValue));
          selection.collapse(true);
          selection.parentElement.focus();
          substituted = true;
        }
    }
    
    return substituted;
    
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
