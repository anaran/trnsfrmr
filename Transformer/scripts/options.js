	
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
		localize("delete", "option_del");
		localize("guide", "guide");
		
		localize("abbr", "abbr");
		localize("long", "long");
		
		restore_options();
	}
	
	function add()
	{
		var subs = $("#subs");
		var line = $("#subs .sub_line_template").clone();
		line.removeClass("sub_line_template").addClass("sub_line");	
		subs.prepend(line);
		
		$(".sub_key", line).Watermark(chrome.i18n.getMessage("abbr"));
		$(".sub_value", line).Watermark(chrome.i18n.getMessage("long"));
		
	}
		
	function del(button)
	{
		var row = button.parentElement.parentElement;
		
		row.outerHTML="";
	}

	
	// Saves options to localStorage.
	function save_options()
	{
		$.Watermark.HideAll();
				
		var lines = $("#subs .sub_line");
	
		var a = new Array();
		
		for(var i=0; i<lines.length; i++)
		{
			var key =$(".sub_key", lines[i])[0].value;
			var value = $(".sub_value", lines[i])[0].value;
			
			if( key!="" || value!="")
			{
				a.push(key);
				a.push(value);
			}
		}
	
		localStorage["map"] = JSON.stringify(a);
		
		$.Watermark.ShowAll();

		restore_options();
	}
	
	// Restores select box state to saved value from localStorage.
	function restore_options()
	{
	
		$("#subs .sub_line").remove();
		
		var map = chrome.extension.getBackgroundPage().getHashMap();
		
		var subs = $("#subs");
		
		for(var j = 0; j++ < map.size; map.next())
		{		
			var line = $("#subs .sub_line_template").clone();
			line.removeClass("sub_line_template").addClass("sub_line");	
			
			$(".sub_key", line)[0].value = map.key();
			
			$(".sub_value", line)[0].value = map.value();
	
			subs.append(line);		
		}
	}