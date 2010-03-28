var mdciMenu = {

	openmdci: function()
	{
		var WindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		var dialog = WindowMediator.getMostRecentWindow('mozilla:mdciPreferences');
		var instantApply = false;
		if (dialog)
		{
			dialog.focus();
			return;
		}
		try
		{
			instantApply = gPrefService.getBoolPref('browser.preferences.instantApply');
		}
		catch (ex)
		{
			instantApply = false;
		}
		openDialog('chrome://mdci/content/mdci.xul', '_blank', 'chrome,titlebar,toolbar,centerscreen,' + (instantApply ? 'dialog=no' : 'modal'));
	}
};
