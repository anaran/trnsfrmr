	var sub_line = "<tr class=\"sub_line\"><td valign=\"top\"><input id=\"key\" class=\"sub_key\" type=\"text\" value=\"##KEY##\"/></td><td valign=\"top\"><textarea id=\"value\" class=\"sub_value\" rows=\"2\" cols=\"30\" >##VALUE##</textarea></td><td align=\"right\" valign=\"top\"><button onclick=\"del(this)\">" + chrome.i18n.getMessage("option_del")+ "</button></td></tr>";
			
	
	
	function localizeString(elementname, text)
	{
		var el = document.getElementsByName(elementname);
		for (var i = 0; i < el.length; i++)
		{
			el[i].innerHTML =  text;
		}
		
	}
	function localize(elementname, messageid)
	{
		localizeString(elementname, chrome.i18n.getMessage(messageid) );
	}
	
	// Inits Strings (i18n) and restores data
	function init()
	{
		document.title = chrome.i18n.getMessage("extname") + " - " + chrome.i18n.getMessage("options");
		
		localizeString("caption", document.title);
		
		localize("save", "save");
		localize("restore", "restore");
		localize("add", "option_add");
		
		localize("abbr", "abbr");
		localize("long", "long");
		
		restore_options();
	}
	
	function add()
	{
		var new_line = sub_line.replace(/##KEY##/,chrome.i18n.getMessage("abbr") );
		new_line = new_line.replace(/##VALUE##/, chrome.i18n.getMessage("long") );
			
		document.getElementById("subs").innerHTML += new_line;

	}
	
	function del(button)
	{
		button.parentElement.parentElement.outerHTML='';
	}
	
	
	// Saves options to localStorage.
	function save_options()
	{

		var map = new Map;
		map
		.put('mp', 'Max Power')
		.put('mfg', 'Mit freundlichen Grüßen')
		.put('hp', 'Sehr geehrter Herr Prof. Dr.');
		
		var a = new Array();
		
		for(var j = 0; j++ < map.size; map.next())
		{ // check all keys
			a.push(map.key());
			a.push(map.value());
		}		

		localStorage["map"] = JSON.stringify(a);
	}
	
	// Restores select box state to saved value from localStorage.
	function restore_options()
	{
		document.getElementById("subs").innerHTML = "";
		var map = chrome.extension.getBackgroundPage().getHashMap();
		
		for(var j = 0; j++ < map.size; map.next())
		{ // check all keys
		
			var new_line = sub_line.replace(/##KEY##/, map.key() );
			new_line = new_line.replace(/##VALUE##/, map.value() );
			
			document.getElementById("subs").innerHTML += new_line;
		}
		
	}
