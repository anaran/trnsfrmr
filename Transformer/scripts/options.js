	
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
		
		document.getElementById("checkbox_hideicon").checked = localStorage["hideicon"] == "true";
		document.getElementById("checkbox_animate").checked = localStorage["animate"] == "true";
		document.getElementById("checkbox_sound").checked = localStorage["sound"] == "true";
		document.getElementById("checkbox_selectphrase").checked = localStorage["selectphrase"] == "true";
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