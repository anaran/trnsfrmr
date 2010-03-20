	
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
		localize("texttab", "texttab");
		localize("settingstab", "settingstab");
		localize("helptab", "helptab");
		localize("changelogtab", "changelogtab");
		localize("changelog", "changelog_text");
		
		localize("hideicon", "hideicon");
		localize("anim", "anim");
		localize("sound", "sound");
		
		
		restore_options();
	}

	
	function onKeyDownEvent(event)
	{
		// prevent spaces
		if(event.keyCode==32) event.preventDefault();
	}
	
	function removeWhitespaces(str)
	{
		str = str.replace(/\s/g, "");
	}
	
	function onInputChange(event)
	{
		event.srcElement.value = event.srcElement.value.replace(/\s/g, "");
		// removeWhitespaces( event.srcElement.value );
	}
	
	function add()
	{
		var subs = $("#subs");
		var line = createSubLine("","");
		subs.prepend(line);
	}
		
	function del(button)
	{
		var row = button.parentElement.parentElement;
		
		row.outerHTML="";
	}
	


	
	// Saves options to localStorage.
	function save_options()
	{
		$("#saving").html(chrome.i18n.getMessage("saving"));
		
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

		localStorage["hideicon"] = $("#checkbox_hideicon").attr('checked');
		localStorage["animate"] = $("#checkbox_animate").attr('checked');
		localStorage["sound"] = $("#checkbox_sound").attr('checked');
		localStorage["selectphrase"] = $("#checkbox_selectphrase").attr('checked');
	
		chrome.windows.getAll({populate: true}, updateSettings);
				
		setTimeout(function(){ $("#saving").html("") }, 750);
		restore_options();
	}
	
	
	function getSettings()
	{
		// TODO pack all settings into response
		return {
			cmd: "push",
			map: localStorage["map"],
			selectPhrase: localStorage["selectphrase"]
			};
	}
	
	// Updates all settings in all tabs
	function updateSettings(windows)
	{
		// TODO same function in backgroundpage... migrate!
		var settings = getSettings();
		
		for(w in windows)
		{
			var tabs = windows[w].tabs;
			for(t in tabs)
			{
				var tab=tabs[t];
				chrome.tabs.sendRequest(tab.id, settings, function(response) {} );
			}
		}
	}
		
	function createSubLine(key, value)
	{
		var line = $("#subs .sub_line_template").clone();
		line.removeClass("sub_line_template").addClass("sub_line");	
		
		$(".sub_key", line).val(key);
		$(".sub_key", line).Watermark(chrome.i18n.getMessage("abbr"));
		$(".sub_key", line).keydown( onKeyDownEvent );
		$(".sub_key", line).change( onInputChange );

		$(".sub_value", line).val(value);
		$(".sub_value", line).Watermark(chrome.i18n.getMessage("long"));
		
		return line;	
	}
	
	// Restores select box state to saved value from localStorage.
	function restore_options()
	{
		$("#subs .sub_line").remove();
		
		var map = chrome.extension.getBackgroundPage().getHashMap();
		
		var subs = $("#subs");
		
		for(var j = 0; j++ < map.size; map.next())
		{		
		
			var line = createSubLine(map.key(), map.value());
			subs.append(line);		
		}
		
		$("#checkbox_hideicon").attr('checked', localStorage["hideicon"] == "true");
		$("#checkbox_animate").attr('checked', localStorage["animate"] == "true");
		$("#checkbox_sound").attr('checked', localStorage["sound"] == "true");
		$("#checkbox_selectphrase").attr('checked', localStorage["selectphrase"] == "true");

	}
	
function onKeyDown(e)
{
	// ctrl-s
	if(e.ctrlKey && e.keyCode == 83)
	{
		save_options();
		e.returnValue=false;
	}
}

document.addEventListener("keydown", onKeyDown, false); 