/* ***** BEGIN LICENSE BLOCK *****
* Version: MPL 1.1/GPL 2.0/LGPL 2.1
*
* The contents of this file are subject to the Mozilla Public License Version
* 1.1 (the "License"); you may not use this file except in compliance with
* the License. You may obtain a copy of the License at
* http://www.mozilla.org/MPL/
*
* Software distributed under the License is distributed on an "AS IS" basis,
* WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
* for the specific language governing rights and limitations under the
* License.
*
* The Original Code is by Trevor Hobson
*
* The Initial Developer of the Original Code is
*   Trevor Hobson
* Portions created by the Initial Developer are Copyright (C) 2010
* the Initial Developer. All Rights Reserved.
*
* Contributor(s):
*   Clive Hobson
*
* Alternatively, the contents of this file may be used under the terms of
* either the GNU General Public License Version 2 or later (the "GPL"), or
* the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
* in which case the provisions of the GPL or the LGPL are applicable instead
* of those above. If you wish to allow use of your version of this file only
* under the terms of either the GPL or the LGPL, and not to allow others to
* use your version of this file under the terms of the MPL, indicate your
* decision by deleting the provisions above and replace them with the notice
* and other provisions required by the GPL or the LGPL. If you do not delete
* the provisions above, a recipient may use your version of this file under
* the terms of any one of the MPL, the GPL or the LGPL.
*
* ***** END LICENSE BLOCK ***** */

var mdni = {

	// Production list

	versionGeckoDefault: [
		['mozilla1.7', '1.7'],
		['mozilla1.8', '1.8'],
		['firefox2', '1.8.1'],
		['firefox', '1.9'],
		['mozilla1.9.1', '1.9.1'],
		['mozilla1.9.2', '1.9.2'],
		['mozilla2.0', '2.0'],
		['mozilla-beta', '5.0'],
		['mozilla-aurora', '6.0'],
		['mozilla-central', '7.0'],
	],

/*
	// Testing list
	versionGeckoDefault: [
		['mozilla1.7', '1.7'],
		['mozilla-central', '6.0'],
	],
*/

	geckoListUrl: "https://developer.mozilla.org/samples/mdniprefs.txt",

	// List of interfaces to use to create interface links (Not a complete list, but cuts the workload)
	listInterfaces: 'amIInstallCallback|amIInstallTrigger|amIWebInstaller|amIWebInstallInfo|amIWebInstallListener|amIWebInstallPrompt|DOMException|extIApplication|extIConsole|extIEventItem|extIEventListener|extIEvents|extIExtension|extIExtensions|extIExtensionsCallback|extIPreference|extIPreferenceBranch|extISessionStorage|fuelIAnnotations|fuelIApplication|fuelIBookmark|fuelIBookmarkFolder|fuelIBookmarkRoots|fuelIBrowserTab|fuelIWindow|gfxIFormats|IAccessible2|IAccessibleAction|IAccessibleApplication|IAccessibleComponent|IAccessibleEditableText|IAccessibleHyperlink|IAccessibleHypertext|IAccessibleImage|IAccessibleRelation|IAccessibleTable|IAccessibleTable2|IAccessibleTableCell|IAccessibleText|IAccessibleValue|IDispatch|imgICache|imgIContainer|imgIContainerDebug|imgIContainerObserver|imgIDecoderObserver|imgIEncoder|imgILoader|imgIRequest|imgITools|IMozControlBridge|IMozPluginHostCtrl|inICSSValueSearch|inIDeepTreeWalker|inIDOMUtils|inIDOMView|inIFlasher|inISearchObserver|inISearchProcess|ISimpleDOMDocument|ISimpleDOMNode|ISimpleDOMText|IWeaveCrypto|IWebBrowser|IWebBrowser2|IWebBrowserApp|IXMLDocument|IXMLElement|IXMLElementCollection|IXMLError|jsdIActivationCallback|jsdICallHook|jsdIContext|jsdIContextEnumerator|jsdIDebuggerService|jsdIEphemeral|jsdIErrorHook|jsdIExecutionHook|jsdIFilter|jsdIFilterEnumerator|jsdINestCallback|jsdIObject|jsdIProperty|jsdIScript|jsdIScriptEnumerator|jsdIScriptHook|jsdIStackFrame|jsdIValue|LSException|nsAString|nsMenuBarX|nsPICertNotification|nsPICommandUpdater|nsPIDNSService|nsPIDOMWindow|nsPIEditorTransaction|nsPIExternalAppLauncher|nsPIPlacesDatabase|nsPIPlacesHistoryListenersNotifier|nsPIPromptService|nsPISocketTransportService|nsPIWidgetCocoa|nsPIWindowWatcher|RangeException|rdfIDataSource|rdfISerializer|rdfITripleVisitor|testNotscriptableInterface|testScriptableInterface|txIEXSLTRegExFunctions|txIFunctionEvaluationContext|txINodeSet|txIXPathObject|XPathException|xpcIJSGetFactory|xpcIJSModuleLoader|xpcIJSWeakReference|xptiITestInterface',

	nsIConsoleService: Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService),

	nsIDOMSerializer: Components.classes["@mozilla.org/xmlextras/xmlserializer;1"].createInstance(Components.interfaces.nsIDOMSerializer),

	nsIJSON: Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON),

	nsIScriptableUnicodeConverter: Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter),
	nsICryptoHash: Components.classes["@mozilla.org/security/hash;1"].createInstance(Components.interfaces.nsICryptoHash),

	prefmdni: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.mdni."),
	prefDebug: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.mdni.debug."),

	debugTraceLevels: {},

	objInterfaceSource: {},

	arrayWarnings: [],
	countWarnings: 0,

	versionGecko: [],

	workVersionGecko: [],

	nameInterface: '',

	isWorking: false,

	stringBundle: '',

	// Localize variables
	lz_MethodOverview: 'Method overview',
	lz_MethodOverview_Name: 'Method_overview',
	lz_Attributes: 'Attributes',
	lz_Attributes_Name: 'Attributes',
	lz_Attribute: 'Attribute',
	lz_Type: 'Type',
	lz_Description: 'Description',
	lz_Constants: 'Constants',
	lz_Constants_Name: 'Constants',
	lz_Constant: 'Constant',
	lz_Value: 'Value',
	lz_GeckoVersion: 'Gecko version',
	lz_Methods: 'Methods',
	lz_Methods_Name: 'Methods',
	lz_Parameters: 'Parameters',
	lz_Parameters_Name: 'Parameters',
	lz_Remarks: 'Remarks',
	lz_Remarks_Name: 'Remarks',
	lz_SeeAlso: 'See also',
	lz_SeeAlso_Name: 'See_also',
	lz_None: 'None.',
	lz_ReturnValue: 'Return value',
	lz_ReturnValue_Name: 'Return value',
	lz_ReadOnly: 'Read only.',
	lz_ExceptionsThrown: 'Exceptions thrown',
	lz_ExceptionsThrown_Name: 'Exceptions_thrown',
	lz_MissingDescription: 'Missing Description',
	lz_MissingException: 'Missing Exception',

	init: function()
	{
		this.nsIScriptableUnicodeConverter.charset = "UTF-8";

		this.stringBundle = document.getElementById('mdniStrings');
		this.lz_MethodOverview = this.stringBundle.getString('MethodOverview');
		this.lz_MethodOverview_Name = this.stringBundle.getString('MethodOverview_Name');
		this.lz_Attributes = this.stringBundle.getString('Attributes');
		this.lz_Attributes_Name = this.stringBundle.getString('Attributes_Name');
		this.lz_Attribute = this.stringBundle.getString('Attribute');
		this.lz_Type = this.stringBundle.getString('Type');
		this.lz_Description = this.stringBundle.getString('Description');
		this.lz_Constants = this.stringBundle.getString('Constants');
		this.lz_Constants_Name = this.stringBundle.getString('Constants_Name');
		this.lz_Constant = this.stringBundle.getString('Constant');
		this.lz_Value = this.stringBundle.getString('Value');
		this.lz_GeckoVersion = this.stringBundle.getString('GeckoVersion');
		this.lz_Methods = this.stringBundle.getString('Methods');
		this.lz_Methods_Name = this.stringBundle.getString('Methods_Name');
		this.lz_Parameters = this.stringBundle.getString('Parameters');
		this.lz_Parameters_Name = this.stringBundle.getString('Parameters_Name');
		this.lz_Remarks = this.stringBundle.getString('Remarks');
		this.lz_Remarks_Name = this.stringBundle.getString('Remarks_Name');
		this.lz_SeeAlso = this.stringBundle.getString('SeeAlso');
		this.lz_SeeAlso_Name = this.stringBundle.getString('SeeAlso_Name');
		this.lz_None = this.stringBundle.getString('None');
		this.lz_ReturnValue = this.stringBundle.getString('ReturnValue');
		this.lz_ReturnValue_Name = this.stringBundle.getString('ReturnValue_Name');
		this.lz_ReadOnly = this.stringBundle.getString('ReadOnly');
		this.lz_ExceptionsThrown = this.stringBundle.getString('ExceptionsThrown');
		this.lz_ExceptionsThrown_Name = this.stringBundle.getString('ExceptionsThrown_Name');
		this.lz_MissingDescription = this.stringBundle.getString('MissingDescription');
		this.lz_MissingException = this.stringBundle.getString('MissingException');

		this.updateProgress('Initialising');
		this.getGeckoList();
	},

	getGeckoList: function()
	{
		this.updateProgress('Getting MXR Gecko list from MDN');
		var me = this;

		var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
		req.addEventListener("load", function() { me.getGeckoListLoad(req); }, false);
		req.addEventListener("error", function() { me.getGeckoListFailed(req); }, false);
		req.open('GET', this.geckoListUrl, true);
		req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
		req.send(null);
	},

	getGeckoListLoad: function(req)
	{
		this.debugTrace('getGeckoListLoad', 989, '\n' + req.responseText);

		var geckoListText = req.responseText;

		var geckoListJS = null;
		try
		{
			geckoListJS = this.nsIJSON.decode(geckoListText);
			if (geckoListJS.header && geckoListJS.array && geckoListJS.header == "mdni - MXR Gecko list.")
			{
				this.updateProgress('Parsing MXR Gecko list from MDN');

				// Process the file and set the user preference and variables
				this.processGeckoList(geckoListJS, geckoListText, true, true);
			}
			else
			{
				this.updateProgress('The MXR Gecko list from MDN is invalid!');
				this.fallbackGeckoListPref();
			}
		}
		catch (err)
		{
			this.updateProgress('The MXR Gecko list from MDN is invalid!');
			this.fallbackGeckoListPref();
		}
	},

	getGeckoListFailed: function(req)
	{
		this.debugTrace('getGeckoListFailed', 989, '\n' + req.responseText);

		// There was an error, so fallback to user preference version
		this.updateProgress('Unable to load MXR Gecko list from MDN!');
		this.fallbackGeckoListPref();

	},

	fallbackGeckoListPref: function()
	{
		this.updateProgress('Falling back to cached list');
		var cacheText = 'missing';
		try {cacheText = this.prefmdni.getCharPref("geckoList");}catch (err) {}
		if (cacheText === 'missing')
		{
			this.updateProgress('No cached MXR Gecko list!');
			this.updateProgress('Falling back to defaults');
			this.completedGeckoList(true);
		}
		else
		{
			this.debugTrace('fallbackGeckoListPref', 989, '\n' + cacheText);
			try
			{
				var geckoListJS = this.nsIJSON.decode(cacheText);
				this.processGeckoList(geckoListJS, cacheText, false, false);
			}
			catch (err)
			{
				this.updateProgress('Unable to process cached MXR Gecko list!');
				this.updateProgress('Falling back to defaults');
				this.completedGeckoList(true);
			}
		}
	},

	processGeckoList: function(geckoListJS, sourceList, setPreference, allowFallback)
	{
		if (geckoListJS.array.length > 0)
		{
			if (setPreference)
			{
				this.prefmdni.setCharPref("geckoList",sourceList);
			}
			this.versionGecko = geckoListJS.array;
			this.updateProgress('Parsing MXR Gecko list complete');
			this.completedGeckoList();
		}
		else if (allowFallback)
		{
			this.updateProgress('Invalid MXR Gecko list from MDN!');
			this.fallbackGeckoListPref()
		}
		else
		{
			this.updateProgress('Unable to process cached MXR Gecko list!');
			this.updateProgress('Falling back to defaults');
			this.completedGeckoList(true);
		}
	},

	completedGeckoList: function(fallbackDefault)
	{
		if (fallbackDefault)
		{
			this.versionGecko = this.versionGeckoDefault;
		}

		for (var i=0; i<this.versionGecko.length; i++)
		{
			this.updateProgress('  ' + this.versionGecko[i]);
		}

		this.debugTrace('completedGeckoList', 989, 'Enabling user interface');
		document.getElementById("sourceInterface").removeAttribute("disabled");
		document.getElementById("generateMDN").removeAttribute("disabled");
		document.getElementById("linkMDN").removeAttribute("disabled");
		this.updateProgress('Initialising complete');
	},

/***********************************************************
* UI User Events
***********************************************************/

	userGenerateMDN: function()
	{
		var sourceInterface = document.getElementById("sourceInterface").value;
		if (sourceInterface !== '')
		{
			this.generateFromMXR(sourceInterface);
		}
	},

	userLinkMDN: function()
	{
		var sourceInterface = document.getElementById("sourceInterface").value;
		var url = "https://developer.mozilla.org/en/XPCOM_Interface_Reference/"  + sourceInterface;
		if (sourceInterface !== '')
		{
			this.openAndReuseOneTabPerURL(url);
		}
	},

	sourceInterfaceKeyPress: function(e)
	{
		if (e.keyCode == 13)
		{
			var sourceInterface = document.getElementById("sourceInterface").value;
			if (sourceInterface !== '')
			{
				this.generateFromMXR(sourceInterface);
			}
		}
	},

/***********************************************************
* Load IDLs from MXR and generate documentation
***********************************************************/

	generateFromMXR: function(sourceInterface)
	{
		if (this.isWorking == true)
		{
			return;
		}

		document.getElementById("generateMDN").setAttribute("disabled", "true");
		this.isWorking = true;

		this.nameInterface = sourceInterface;

		// Remove existing tabs
		this.debugTrace('generateFromMXR', 975, 'removeInterfaceTabs');
		this.removeInterfaceEditorTabs();

		// Reset the Interface object
		this.objInterfaceSource = {};
		this.objInterfaceSource.attributes = {};
		this.objInterfaceSource.constants = {};
		this.objInterfaceSource.methods = {};
		this.objInterfaceSource.interfaceName = null;

		// Reset the Warnings array
		this.arrayWarnings = [];
		this.countWarnings = 0;

		// Set the working version gecko array
		for (var i=0; i<this.versionGecko.length; i++)
		{
			this.workVersionGecko[i] = this.versionGecko[i].slice();
		}

		// Reset the progress tab
		this.resetProgress();

		this.updateProgress('Reading ' + sourceInterface);

		var me = this;

		this.workVersionGecko.forEach(function(workVersionGeckoItem) {
			var versionGeckoMXRSearchUrl = 'http://mxr.mozilla.org/' + workVersionGeckoItem[0] + '/ident?i=' + sourceInterface;
			me.findIdent(versionGeckoMXRSearchUrl, workVersionGeckoItem, 1);
		});
	},

	findIdent: function(versionGeckoMXRSearchUrl, workVersionGeckoItem, attemptCount)
	{
		var me = this;

		var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
		req.addEventListener("load", function() { me.findIdentLoad(workVersionGeckoItem, req); }, false);
		req.addEventListener("error", function() { me.findIdentFailed(versionGeckoMXRSearchUrl, workVersionGeckoItem, attemptCount, req); }, false);
		req.open('GET', versionGeckoMXRSearchUrl, true);
		req.send(null);
	},

	findIdentLoad: function(workVersionGeckoItem, req)
	{
		this.debugTrace('findIdentLoad', 990, req.responseText);

		var versionGeckoMXRSearchResult = req.responseText;

		var findPath = new RegExp('Defined\\sas\\sa\\sinterface\\sin\\:\\s*<ul>\\s*<li>\\s*<a\\shref="\\/' + workVersionGeckoItem[0] + '\\/source\/[^>]*idl">[^<]*', 'gi');
		var versionGeckoMXRPathPlus = versionGeckoMXRSearchResult.match(findPath);
		if (versionGeckoMXRPathPlus !== null)
		{
			var versionGeckoMXRPath = versionGeckoMXRPathPlus[0].match(/[^>]*$/);
			if (versionGeckoMXRPath !== null)
			{
				this.updateProgress(workVersionGeckoItem[1] + ' path found - ' + versionGeckoMXRPath);
				workVersionGeckoItem[3] = versionGeckoMXRPath;
				var versionGeckoMXRIdlUrl = 'http://mxr.mozilla.org/' + workVersionGeckoItem[0] + '/source/' + versionGeckoMXRPath +'?raw=1';

				this.getIdl(workVersionGeckoItem, versionGeckoMXRIdlUrl)
			}
			else
			{
				this.updateProgress(workVersionGeckoItem[1] + ' path NOT found');
				workVersionGeckoItem[2] = 'done';
				workVersionGeckoItem[3] = 'Path NOT found';
				this.continueIfReadsComplete();
			}
		}
		else
		{
			this.updateProgress(workVersionGeckoItem[1] + ' path NOT found');
			workVersionGeckoItem[2] = 'done';
			workVersionGeckoItem[3] = 'Path NOT found';
			this.continueIfReadsComplete();
		}

	},

	findIdentFailed: function(versionGeckoMXRSearchUrl, workVersionGeckoItem, attemptCount, req)
	{
		this.debugTrace('findIdentFailed', 990, workVersionGeckoItem[1] + ' (' + attemptCount + ') ' + req.responseText);

		// If there was an error, try again (up to 3 times)
		if (attemptCount < 4)
		{
			this.findIdent(versionGeckoMXRSearchUrl, workVersionGeckoItem, attemptCount++);
		}
		else
		{
			this.debugTrace('findIdentFailed', 950, workVersionGeckoItem[1]);
			this.updateProgress('Failed to locate IDL for ' + workVersionGeckoItem[1]);
			workVersionGeckoItem[2] = 'failed';
		}
	},

	getIdl: function(workVersionGeckoItem, versionGeckoMXRIdlUrl)
	{
		var me = this;

		var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
		req.addEventListener("load", function() { me.getIdlLoad(workVersionGeckoItem, req); }, false);
		req.addEventListener("error", function() { me.getIdlFailed(versionGeckoMXRIdlUrl, workVersionGeckoItem, attemptCount, req); }, false);
		req.open('GET', versionGeckoMXRIdlUrl, true);
		req.send(null);

	},

	getIdlLoad: function(workVersionGeckoItem, req)
	{
		this.debugTrace('getIdlLoad', 989, '\n' + req.responseText);

		var versionGeckoMXRIdlText = req.responseText;
		workVersionGeckoItem[5] = versionGeckoMXRIdlText;

		this.updateProgress(workVersionGeckoItem[1] + ' file read');
		var versionGeckoMXRIdlTextClean = this.cleanupIdl(versionGeckoMXRIdlText);

		workVersionGeckoItem[4] = versionGeckoMXRIdlTextClean;
		workVersionGeckoItem[2] = 'done';
		this.continueIfReadsComplete();
	},

	getIdlFailed: function(versionGeckoMXRIdlUrl, workVersionGeckoItem, attemptCount, req)
	{
		this.debugTrace('getIdlFailed', 989, workVersionGeckoItem[1] + ' (' + attemptCount + ') ' + req.responseText);

		// If there was an error, try again (up to 3 times)
		if (attemptCount < 4)
		{
			this.findIdent(versionGeckoMXRIdlUrl, workVersionGeckoItem, attemptCount++);
		}
		else
		{
			this.debugTrace('getIdlFailed', 950, workVersionGeckoItem[1]);
			this.updateProgress('Failed to get IDL for ' + workVersionGeckoItem[1]);
			workVersionGeckoItem[2] = 'failed';
			this.continueIfReadsComplete();
		}
	},

	continueIfReadsComplete: function()
	{
		var isComplete = true;
		var isFailed = false;

		for (var i=0; i<this.workVersionGecko.length; i++)
		{
			if (this.workVersionGecko[i][2] != 'done')
			{
				isComplete = false;
			}
			if (this.workVersionGecko[i][2] == 'failed')
			{
				isFailed = true;
			}
		}
		if (isComplete && !isFailed)
		{
			this.updateProgress('Reading complete');
			this.processInterfaceVersions();
		}
		else if (isComplete && isFailed)
		{
			this.updateProgress('Reading failed');
		}
	},

	// Loop through the interface versions and process them
	processInterfaceVersions: function()
	{

		var countProcessed = 0;
		this.updateProgress('Processing');
		for (var i=0; i<this.workVersionGecko.length; i++)
		{
			// Quick and diry checks to see if we actually need to process this version
			if (this.workVersionGecko[i][3] == 'Path NOT found')
			{
				continue;
			}
			if (i != 0 && i < this.workVersionGecko.length-1 && this.workVersionGecko[i][4] == this.workVersionGecko[i+1][4] && this.workVersionGecko[i-1][3] != 'Path NOT found')
			{
				this.updateProgress('Processing ' + this.workVersionGecko[i][1] + ' == ' + this.workVersionGecko[i+1][1]);
				countProcessed++;
				continue;
			}
			else
			{
				this.updateProgress('Processing ' + this.workVersionGecko[i][1]);
				this.updateInterfaces(this.workVersionGecko[i][4], this.workVersionGecko, i, this.nameInterface);
				countProcessed++;
			}
		}

		if (countProcessed > 0)
		{
			this.debugTrace('generateFromMXR', 950, 'generateStringMDN');

			// Generate string
			var stringMDN = this.createInterfaceMDN(this.objInterfaceSource, this.versionGecko);

			this.debugTrace('generateFromMXR', 980, 'addInterfaceTab');

			// Add Interface to tabs
			this.addInterfaceEditorTab(this.objInterfaceSource.interfaceName, stringMDN);

			if (this.arrayWarnings.length > 0)
			{
				this.debugTrace('generateFromMXR', 980, 'addWarnings');

				this.addInterfaceEditorTab('Warnings', this.arrayWarnings.join('\n'));
			}
			else
			{
				this.debugTrace('generateFromMXR', 980, 'noWarnings');
			}

			// Add source to tabs
			this.addInterfaceEditorTab('Source', this.workVersionGecko[this.workVersionGecko.length-1][5]);
		}

		this.updateProgress('Processing complete');

		document.getElementById("generateMDN").removeAttribute("disabled");
		this.isWorking = false;

	},

	updateInterfaces: function(cleanIdl, sourceVersionGecko, sourceVersionGeckoIndex, sourceInterface)
	{
		this.debugTrace('updateInterfaces', 985, 'cleanIdl :\n' + cleanIdl);

		var arrayConstantOrder = [];
		var countConstantOrder = 0;
		// Split IDL into lines for processing
		cleanIdl += '\n';
		var stringIdlLines = cleanIdl.match(/[^\n]*\n/g);
		var inInterface = false;
		var inComment = false;
		var isWanted = false; // Are we dealing with an interface that we actually want?
		var stringComment = '';
		var interfaceScriptable = false;
		var interfaceName = '';
		var interfaceInherits = '';
		for (var i=0; i<stringIdlLines.length; i++)
		{
			var stringIdlLine = stringIdlLines[i].replace(/\n/,'');

			this.debugTrace('updateInterfaces', 950, 'stringIdlLines[' + i + '] ' + stringIdlLine);
			if (stringIdlLine.match(/^\/\*+/) !== null) // Start of comment
			{
				inComment = true;
			}
			else if (stringIdlLine.match(/^\*\//) !== null) // End of comment
			{
				inComment = false;
			}
			else if (inComment) // If in comment, add to comment
			{
				stringComment += stringIdlLine + '\n';
			}
			else if (stringIdlLine.match(/^\[.*uuid\(.*\)\]/i) !== null) // Scriptable line
			{
				interfaceScriptable = (stringIdlLine.match(/^(?:\[|.*,\s)scriptable,/i) !== null)
			}
			else if (stringIdlLine.match(/^INTERFACE.*{/i) !== null) // Start of interface
			{
				// Get interface name
				interfaceName = stringIdlLine.match(/^INTERFACE\s+(\S*)/i)[1];

				// Strip hugging : if necessary
				interfaceName = interfaceName.replace (/:$/, '');

				this.debugTrace('updateInterfaces', 960, 'foundInterface ' + interfaceName);

				// Check if we want to keep this interface (is the one we are after)
				if (interfaceName == sourceInterface)
				{
					isWanted = true;

					this.debugTrace('updateInterfaces', 965, 'wanted');

					// Get interface inherits from
					if (stringIdlLine.match(/:/) !== null)
					{
						interfaceInherits = stringIdlLine.match(/:\s*([^(\s|{)]*)/)[1];
					}
					// If object for the interface does not exist then create it
					if (!this.objInterfaceSource.interfaceName)
					{
						this.objInterfaceSource.interfaceName = interfaceName;
						this.objInterfaceSource.versionFirst = sourceVersionGeckoIndex;
						this.objInterfaceSource.versionLastAddition = sourceVersionGeckoIndex;
						this.objInterfaceSource.constantsChanged = false;
					}
					this.objInterfaceSource.path = sourceVersionGecko[sourceVersionGeckoIndex][3];
					this.objInterfaceSource.scriptable = interfaceScriptable;
					this.objInterfaceSource.inherits = interfaceInherits;
					this.objInterfaceSource.versionLast = sourceVersionGeckoIndex;
					this.objInterfaceSource.comment = stringComment;
				}
				else
				{
					isWanted = false;

					this.debugTrace('updateInterfaces', 965, 'unwanted');

				}
				stringComment = '';
				inInterface = true;
			}
			else if (stringIdlLine.match(/^};?/) !== null) // End of interface (Sometimes the ; will be missing, hopefully this will not break anything)
			{
				this.debugTrace('updateInterfaces', 960, 'endInterface ' + interfaceName);
				if (isWanted == true)
				{
					// Add constant array to interface
					this.objInterfaceSource.constantOrder = arrayConstantOrder;
					// Reset constant order array
					arrayConstantOrder = [];
					countConstantOrder = 0;
					// If there is a left over comment log a warning
					if (stringComment != '')
					{
						this.arrayWarnings[this.countWarnings++] = sourceVersionGecko[sourceVersionGeckoIndex][1] + ' Comment at end of Interface(' + interfaceName + '):\n' + stringComment;
					}
					// No use processing further if we have found the interface we are after
					break;
				}
				stringComment = '';
				inInterface = false;
			}
			else if (inInterface) // Attributes, Constants and Methods are in Interface
			{
				// Continue to next line now if we are not in a wanted interface
				if (isWanted == false)
				{
					continue;
				}

				// Create a clean line for processing, normalise white space, remove space before trailing ; and any (
				var stringIdlLineClean = stringIdlLine.replace(/\s+/g, ' ').replace(/\s+(?=(;$|\())/, '')
				if (stringIdlLineClean.match(/(?:^|\s+)attribute\s/) !== null) // Found an attribute
				{
					var attributeName = stringIdlLineClean.match(/\S+(?=;)/)[0];

					this.debugTrace('updateInterfaces', 965, 'foundAttribute ' + attributeName);

					// If there is a comment on the end of the line add it to the comment
					if (stringIdlLineClean.match(/;\s*\/+/) !== null)
					{
						var normalComment = stringIdlLineClean.match(/;\s*(.*)/)[1];
						// Clean // comment
						normalComment = normalComment.replace(/\/+\s*/, '')
						// Add to comment
						stringComment += '*\n' + normalComment + '\n';
						// Remove the comment form the idl line
						stringIdlLineClean = stringIdlLineClean.replace(/;.*$/gm, ';');
					}
					if (!this.objInterfaceSource.attributes[attributeName])
					{
						this.objInterfaceSource.attributes[attributeName] = {};
						this.objInterfaceSource.attributes[attributeName].nameText = attributeName;
						this.objInterfaceSource.attributes[attributeName].versionFirst = sourceVersionGeckoIndex;
						this.objInterfaceSource.versionLastAddition = sourceVersionGeckoIndex;
					}
					else
					{
						// If the line 'signature' changed log a warning
						if (this.objInterfaceSource.attributes[attributeName].lineIdl != stringIdlLineClean)
						{
							var stringWarningVersion = interfaceName + ' ' + sourceVersionGecko[this.objInterfaceSource.attributes[attributeName].versionLast][1] + ' -> ' + sourceVersionGecko[sourceVersionGeckoIndex][1] + ' : ';
							this.arrayWarnings[this.countWarnings++] = stringWarningVersion + '\n  ' + this.objInterfaceSource.attributes[attributeName].lineIdl + '\n  ' + stringIdlLineClean;
						}
					}
					this.objInterfaceSource.attributes[attributeName].lineIdl = stringIdlLineClean;
					this.objInterfaceSource.attributes[attributeName].versionLast = sourceVersionGeckoIndex;
					this.objInterfaceSource.attributes[attributeName].comment = stringComment;
					stringComment = '';
				}
				else if (stringIdlLineClean.match(/^CONST\s/i) !== null) // Found a constant
				{
					// If there is a comment on the end of the line add it to the comment
					if (stringIdlLineClean.match(/;\s*\/+/) !== null)
					{
						var normalComment = stringIdlLineClean.match(/;\s*(.*)/)[1];
						// Clean // comment
						normalComment = normalComment.replace(/\/+\s*/, '')
						// Add to comment
						stringComment += '*\n' + normalComment + '\n';
						// Remove the comment from the idl line
						stringIdlLineClean = stringIdlLineClean.replace(/;.*$/, ';');
					}

					// Sometimes kindly souls decide to break constants in annoying places so may have to shove this line at the beginning of the next
					if (!stringIdlLineClean.match(/;$/) && i<stringIdlLines.length)
					{
						this.debugTrace('updateInterfaces', 970, 'foundConstant-BadSplit :\n' + stringIdlLineClean);
						stringIdlLines[i+1] = stringIdlLineClean + ' ' + stringIdlLines[i+1];
						continue;
					}

					var constantName = stringIdlLineClean.match(/\S+(?=\s*\=)/)[0];
					var constantValue = stringIdlLineClean.match(/[^\=]+(?=\s*;)/)[0].replace(/^\s+/, '');

					this.debugTrace('updateInterfaces', 965, 'foundConstant ' + constantName);

					// Add to constant order
					arrayConstantOrder[countConstantOrder++] = constantName;

					if (!this.objInterfaceSource.constants[constantName])
					{
						this.objInterfaceSource.constants[constantName] = {};
						this.objInterfaceSource.constants[constantName].nameText = constantName;
						this.objInterfaceSource.constants[constantName].versionFirst = sourceVersionGeckoIndex;
						this.objInterfaceSource.constants[constantName].values = [];
						this.objInterfaceSource.versionLastAddition = sourceVersionGeckoIndex;
					}
					else
					{
						// If the line 'signature' changed log a warning
						if (this.objInterfaceSource.constants[constantName].lineIdl != stringIdlLineClean)
						{
							var stringWarningVersion = interfaceName + ' ' + sourceVersionGecko[this.objInterfaceSource.constants[constantName].versionLast][1] + ' -> ' + sourceVersionGecko[sourceVersionGeckoIndex][1] + ' : ';
							this.arrayWarnings[this.countWarnings++] = stringWarningVersion + '\n  ' + this.objInterfaceSource.constants[constantName].lineIdl + '\n  ' + stringIdlLineClean;
						}
						// If the value of the constant changed then let the iterface know so we can create a different constants table
						// (Why, oh why do we have to do this. Should not a constant be, CONSTANT!!!)
						if (this.objInterfaceSource.constants[constantName].valuePrevious != constantValue)
						{
							this.objInterfaceSource.constantsChanged = true;
						}
					}
					this.objInterfaceSource.constants[constantName].lineIdl = stringIdlLineClean;
					this.objInterfaceSource.constants[constantName].versionLast = sourceVersionGeckoIndex;
					this.objInterfaceSource.constants[constantName].comment = stringComment;
					this.objInterfaceSource.constants[constantName].values[sourceVersionGeckoIndex] = constantValue;
					this.objInterfaceSource.constants[constantName].valuePrevious = constantValue;
					stringComment = '';
				}
				else if (stringIdlLineClean != '') // Found a method (Should be nothing else left, blank line check just in case)
				{
					// Strip any * from methods, sometimes in the the other-licenses interfaces
					stringIdlLineClean = stringIdlLineClean.replace(/\s*\*+\s*/g,' ');

					// If there is a normal comment on the line, drop it (it is too complex to figure out what to do with it)
					stringIdlLineClean = stringIdlLineClean.replace(/\s*\/{2,}.*$/, '');

					// If there is space between the ) and the ; close it
					stringIdlLineClean = stringIdlLineClean.replace(/\)\s*;\s*$/, ');');

					// Sometimes kindly souls decide to break methods in annoying places so may have to shove this line at the beginning of the next
					if (!stringIdlLineClean.match(/\);?$/) && i<stringIdlLines.length)
					{
						this.debugTrace('updateInterfaces', 970, 'foundMethod-BadSplit :\n' + stringIdlLineClean);
						stringIdlLines[i+1] = stringIdlLineClean + ' ' + stringIdlLines[i+1];
						continue;
					}

					// Fix missing space after [noscript] etc
					stringIdlLineClean = stringIdlLineClean.replace(/]\s*/, '] ');

					// We only list one of [noscript, notxpcom], which is [notxpcom]
					stringIdlLineClean = stringIdlLineClean.replace('[noscript, notxpcom]', '[notxpcom]');

					// Get the method name (replace is used for quick and dirty line cleanup)
					var methodName = stringIdlLineClean.replace(/\(.*/,'(').match(/\S+(?=\()/)[0];
					var methodNameHash = this.stringHash(methodName);

					this.debugTrace('updateInterfaces', 965, 'foundMethod ' + methodName);

					if (!this.objInterfaceSource.methods[methodNameHash])
					{
						this.objInterfaceSource.methods[methodNameHash] = {};
						this.objInterfaceSource.methods[methodNameHash].versionFirst = sourceVersionGeckoIndex;
						this.objInterfaceSource.versionLastAddition = sourceVersionGeckoIndex;
					}
					else
					{
						// If the line 'signature' changed log a warning
						if (this.objInterfaceSource.methods[methodNameHash].lineIdl != stringIdlLineClean)
						{
							var stringWarningVersion = interfaceName + ' ' + sourceVersionGecko[this.objInterfaceSource.methods[methodNameHash].versionLast][1] + ' -> ' + sourceVersionGecko[sourceVersionGeckoIndex][1] + ' : ';
							this.arrayWarnings[this.countWarnings++] = stringWarningVersion + '\n  ' + this.objInterfaceSource.methods[methodNameHash].lineIdl + '\n  ' + stringIdlLineClean;
						}
					}
					// Use the latest name, sometimes case changes
					this.objInterfaceSource.methods[methodNameHash].nameText = methodName;

					this.objInterfaceSource.methods[methodNameHash].lineIdl = stringIdlLineClean;
					this.objInterfaceSource.methods[methodNameHash].versionLast = sourceVersionGeckoIndex;
					this.objInterfaceSource.methods[methodNameHash].comment = stringComment;
					stringComment = '';
				}
			}
		}
	},

	// Create the MDN document from an Interface Object
	createInterfaceMDN: function(objInterface, sourceVersionGecko)
	{
		this.debugTrace('createInterfaceMDN', 940, 'Start');
		var compareFunc = function compare(first, second) {return first.toLowerCase() > second.toLowerCase();};

		// Set status to default
		objInterface.status = 'unfrozen';

		// Get the 'short' name of the interface, not an ideal way
		var interfaceNameShort = objInterface.interfaceName.replace(/^(?:nsI|mozI|amI|extI|fuelI|jsdI|I)/, '');

		// Start with the last addition to find the last changed Gecko Version
		objInterface.versionLastChanged = objInterface.versionLastAddition;

		// Create array of Methods and do some pre-processing
		arrayMethods = this.processObject(objInterface.methods, objInterface, sourceVersionGecko);

		// Sort Methods array
		arrayMethods.sort(compareFunc);

		// Create array of Attributes
		var arrayAttributes = this.processObject(objInterface.attributes, objInterface, sourceVersionGecko);

		// Sort Attributes array
		arrayAttributes.sort(compareFunc);

		// Process Constants for min version and obsolete
		this.processObject(objInterface.constants, objInterface, sourceVersionGecko);

		// Create array of Constants in idl order, then obsolete ones
		var arrayConstants = objInterface.constantOrder;
		for each (var objConstant in objInterface.constants)
		{
			// While here update Gecko Last changed Version
			if (objConstant.versionLast < sourceVersionGecko.length - 1 && objInterface.versionLastChanged < objConstant.versionLast + 1)
			{
				objInterface.versionLastChanged = objConstant.versionLast + 1;
			}
			var alreadySorted = false;
			for (var i=0; i<arrayConstants.length; i++)
			{
				if (arrayConstants[i].toLowerCase() == objConstant.nameText.toLowerCase())
				{
					alreadySorted = true;
					break;
				}
			}
			if (alreadySorted == false)
			{
				arrayConstants.push(objConstant.nameText);
			}
		}

		// Create the regular expression for adding interface templates
		var tempListInterfaces = this.listInterfaces + '|nsI\\w+|mozI\\w+';
		var regInterface = new RegExp('\\b(' + tempListInterfaces + ')\\b', 'gi');

		// Create regular expression for adding code tags
		var arrayAddCode = ['null', 'true', 'false', objInterface.interfaceName];
		arrayAddCode = arrayAddCode.concat(arrayAttributes);
		arrayAddCode = arrayAddCode.concat(arrayConstants);
		regAddCode = new RegExp('\\b(' + arrayAddCode.join('|') + ')\\b', 'gi');

		// Create a regular expression for adding method templates
		var regAddMethod = null;
		if (arrayMethods.length>0)
		{
			regAddMethod = new RegExp('\\b(' + arrayMethods.join('|') + ')\\b', 'gi');
		}

		var stringMDN = '';

		// Add header to MDN string
		stringMDN += '<h1>' + objInterface.interfaceName + '</h1>\n';

		// Add iterface summary to MDN string
		stringMDN += '<p>{{IFSummary("' + objInterface.path + '", "' + objInterface.inherits + '", "' + (objInterface.scriptable == true ? 'Scriptable' : 'Not scriptable') + '", "' + sourceVersionGecko[objInterface.versionLastChanged][1] + '", "??? Add brief description of Interface ???"';
		
		// If this is a new interface
		if (objInterface.versionFirst != 0)
		{
			stringMDN += ', "' + sourceVersionGecko[objInterface.versionFirst][1] + '"';
		}

		// If this is an obsolete interface
		if (objInterface.versionLast != sourceVersionGecko.length -1)
		{
			// Need to put in depricated for template to work
			stringMDN += ', "", "' + sourceVersionGecko[objInterface.versionLast + 1][1] + '" , "' + sourceVersionGecko[objInterface.versionLast + 1][1] + '"';
		}

		stringMDN += ')}}</p>\n';

		// If the interface has a comment then make it pretty and add it to the MDN string (May be too long/complex to put in IFSummary)
		if (objInterface.comment !== '')
		{
			var stringInterfaceCommentPretty = this.tidyComment(objInterface.comment, false, objInterface, regInterface, regAddCode, regAddMethod);

			// If there is a brief then use it, otherwise use comment
			if (objInterface.brief)
			{
				stringMDN += objInterface.brief + '\n';
			}
			else if (stringInterfaceCommentPretty !== '')
			{
				stringMDN += stringInterfaceCommentPretty;
			}
		}

		// Add iterface implemented to MDN string
		var interfaceNameShortFirst = interfaceNameShort.match(/^./)[0].toLowerCase();
		interfaceNameShort = interfaceNameShort.replace(/^./, interfaceNameShortFirst);

// TODO: Find the ?????????? detail

		stringMDN += '<p>Implemented by: \<code\>?????????????????????????????????????\</code\>. To create an instance, use:</p>\n';
		stringMDN += '<p>Implemented by: \<code\>?????????????????????????????????????\</code\> as a service:</p>\n';
		stringMDN += '<pre class="eval">\n';
		stringMDN += 'var ' + interfaceNameShort + ' = Components.classes["@mozilla.org/????????????????????????????"]\n';
		stringMDN += (new Array(8 + interfaceNameShort.length)).join(' ') + '.createInstance(Components.interfaces.' + objInterface.interfaceName + ');\n';
		stringMDN += '</pre>\n';

		this.debugTrace('createInterfaceMDN', 945, 'Before method overview');

		// Create Method overview table
		if (arrayMethods && arrayMethods.length > 0)
		{
			stringMDN += '<h2 name="' + this.lz_MethodOverview_Name + '">' + this.lz_MethodOverview + '</h2>\n';
			stringMDN += '<table class="standard-table">\n';
			stringMDN += '<tbody>\n';
			for (var i=0; i<arrayMethods.length; i++)
			{
				var arrayMethodsIHash = this.stringHash(arrayMethods[i]);
				var stringMethodLink = '<a href="#' + arrayMethods[i] + '()">' + arrayMethods[i] + '</a>';
				stringMDN += '<tr>\n';
				stringMDN += '<td>';
				stringMDN += '<code>' + objInterface.methods[arrayMethodsIHash].lineIdl.replace(/\S+(?=\()/, stringMethodLink).replace(/\s+$/, '').replace(/\[out,\s?retval\]/gi,'[out]') + '</code>';
				stringMDN += objInterface.methods[arrayMethodsIHash].notxpcomText;
				stringMDN += objInterface.methods[arrayMethodsIHash].noscriptText;
				stringMDN += objInterface.methods[arrayMethodsIHash].minversionText;
				stringMDN += objInterface.methods[arrayMethodsIHash].obsoleteText;
				stringMDN += '</td>\n';
				stringMDN += '</tr>\n';
			}
			stringMDN += '</tbody>\n';
			stringMDN += '</table>\n';
		}

		this.debugTrace('createInterfaceMDN', 945, 'Before attributes');

		// Create Attributes table
		if (arrayAttributes && arrayAttributes.length > 0)
		{
			stringMDN += '<h2 name="' + this.lz_Attributes_Name + '">' + this.lz_Attributes + '</h2>\n';
			stringMDN += '<table class="standard-table">\n';
			stringMDN += '<tbody>\n';
			stringMDN += '<tr>\n';
			stringMDN += '<td class="header">' + this.lz_Attribute + '</td>\n';
			stringMDN += '<td class="header">' + this.lz_Type + '</td>\n';
			stringMDN += '<td class="header">' + this.lz_Description + '</td>\n';
			stringMDN += '</tr>\n';

			for (var i=0; i<arrayAttributes.length; i++)
			{
				var stringAttributeCommentPretty = '';
				// If the attribute has a comment
				if (objInterface.attributes[arrayAttributes[i]].comment !== '')
				{
					stringAttributeCommentPretty = this.tidyComment(objInterface.attributes[arrayAttributes[i]].comment, true, objInterface.attributes[arrayAttributes[i]], regInterface, regAddCode, regAddMethod);
				}

				// Format attribute type
				var stringAttributeType = objInterface.attributes[arrayAttributes[i]].lineIdl.match(/(?:^|\s+)attribute\s+(.*)(?=\s+\S+\s*;)/)[1];
				var stringAttributeTypeLink = stringAttributeType;
				// If it is an Interface
				if (stringAttributeType.match(regInterface) !== null)
				{
					stringAttributeTypeLink = stringAttributeType.replace(regInterface, '{{Interface("$1")}}')
				}
				 // Is another type
				else
				{
					stringAttributeTypeLink = '<a href="mks://localhost/en/' + stringAttributeType.replace(/\s+/g, '_') + '" title="en/' + stringAttributeType + '">' + stringAttributeType + '</a>';
				}

				// Format prefix
				var stringAttributePrefixRaw = objInterface.attributes[arrayAttributes[i]].lineIdl.match(/^.*(?=\s+attribute)/)
				var stringAttributePrefix = '';
				if (stringAttributePrefixRaw !== null)
				{
					stringAttributePrefix = stringAttributePrefixRaw[0].replace(/(^\s+|\s+$)/g, '').replace(/\s*readonly/i, '<strong>' + this.lz_ReadOnly + '</strong>');
				}

				stringMDN += '<tr>\n';
				stringMDN += '<td><code>' + objInterface.attributes[arrayAttributes[i]].nameText + '</code></td>\n';
				stringMDN += '<td><code>' + stringAttributeTypeLink + '</code></td>\n';
				stringMDN += '<td>'
				stringMDN += stringAttributeCommentPretty;
				stringMDN += stringAttributePrefix
				stringMDN += objInterface.attributes[arrayAttributes[i]].notxpcomText;
				stringMDN += objInterface.attributes[arrayAttributes[i]].noscriptText;
				stringMDN += objInterface.attributes[arrayAttributes[i]].minversionText;
				stringMDN += objInterface.attributes[arrayAttributes[i]].obsoleteText;

				// Show exceptions
				if (objInterface.attributes[arrayAttributes[i]].exceptions)
				{
					stringMDN += '<h6 name="' + this.lz_ExceptionsThrown_Name + '">' + this.lz_ExceptionsThrown + '</h6>\n';
					stringMDN += '<dl>\n';
					for each (var objException in objInterface.attributes[arrayAttributes[i]].exceptions)
					{
						stringMDN += '<dt><code>' + objException.nameText + '</code></dt>\n';
						stringMDN += '<dd>' + objException.description + '</dd>\n';
					}
					stringMDN += '</dl>\n';
				}

				stringMDN += '</td>\n';
				stringMDN += '</tr>\n';
			}
			stringMDN += '</tbody>\n';
			stringMDN += '</table>\n';
		}

		this.debugTrace('createInterfaceMDN', 945, 'Before constants');

		// Create Constants table
		if (arrayConstants && arrayConstants.length > 0)
		{
			stringMDN += '<h2 name="' + this.lz_Constants_Name + '">' + this.lz_Constants + '</h2>\n';
			stringMDN += '<table class="standard-table">\n';
			stringMDN += '<tbody>\n';
			if (objInterface.constantsChanged == false)
			{
				stringMDN += '<tr>\n';
				stringMDN += '<td class="header">' + this.lz_Constant + '</td>\n';
				stringMDN += '<td class="header">' + this.lz_Value + '</td>\n';
				stringMDN += '<td class="header">' + this.lz_Description + '</td>\n';
				stringMDN += '</tr>\n';
			}
			else
			{
				stringMDN += '<tr>\n';
				stringMDN += '<td class="header" rowspan="2">' + this.lz_Constant + '</td>\n';
				stringMDN += '<td class="header" colspan="' + (objInterface.versionLast - objInterface.versionFirst + 1) + '">' + this.lz_GeckoVersion + '</td>\n';
				stringMDN += '<td class="header" rowspan="2">' + this.lz_Description + '</td>\n';
				stringMDN += '</tr>\n';
				stringMDN += '<tr>\n';
				for (var j=objInterface.versionFirst; j<=objInterface.versionLast; j++)
				{
					stringMDN += '<td class="header">' + sourceVersionGecko[j][1] + '</td>\n';
				}
				stringMDN += '</tr>\n';
			}
			for (var i=0; i<arrayConstants.length; i++)
			{
				// If the constant has a comment
				var stringConstantCommentPretty = '';
				if (objInterface.constants[arrayConstants[i]].comment !== '')
				{
					stringConstantCommentPretty = this.tidyComment(objInterface.constants[arrayConstants[i]].comment, true, null, regInterface, regAddCode, regAddMethod);
				}

				stringMDN += '<tr>\n';
				stringMDN += '<td><code>' + objInterface.constants[arrayConstants[i]].nameText + '</code></td>\n';

				if (objInterface.constantsChanged == false)
				{
					stringMDN += '<td><code>' + objInterface.constants[arrayConstants[i]].valuePrevious.replace(/\s<<\s/,'&nbsp;<<&nbsp;') + '</code></td>\n';
					stringMDN += '<td>';
					stringMDN += stringConstantCommentPretty;
					stringMDN += objInterface.constants[arrayConstants[i]].notxpcomText;
					stringMDN += objInterface.constants[arrayConstants[i]].noscriptText;
					stringMDN += objInterface.constants[arrayConstants[i]].minversionText;
					stringMDN += objInterface.constants[arrayConstants[i]].obsoleteText;
					stringMDN += '</td>\n';
				}
				else
				{
					var colCount = 1;

					// Replace undefined with ''
					for (var j=objInterface.versionFirst; j<=objInterface.versionLast; j++)
					{
						if (objInterface.constants[arrayConstants[i]].values[j] === undefined)
						{
							objInterface.constants[arrayConstants[i]].values[j] = '';
						}
					}

					for (var j=objInterface.versionFirst; j<=objInterface.versionLast; j++)
					{
						if (objInterface.constants[arrayConstants[i]].values[j] === objInterface.constants[arrayConstants[i]].values[j + 1])
						{
							colCount++;
						}
						else
						{
							if (colCount > 1)
							{
								stringMDN += '<td colspan="' + colCount + '"><code>';
							}
							else
							{
								stringMDN += '<td><code>';
							}
							stringMDN += objInterface.constants[arrayConstants[i]].values[j].replace(/\s<<\s/,'&nbsp;<<&nbsp;');
							stringMDN += '</code></td>\n';
							colCount = 1;
						}
					}
					stringMDN += '<td>' + stringConstantCommentPretty + '</td>\n';
				}
				stringMDN += '</tr>\n';
			}
			stringMDN += '</tbody>\n';
			stringMDN += '</table>\n';
		}

		this.debugTrace('createInterfaceMDN', 945, 'Before methods');

		// Create Methods
		if (arrayMethods && arrayMethods.length > 0)
		{
			stringMDN += '<h2 name="' + this.lz_Methods_Name + '">' + this.lz_Methods + '</h2>\n';
			for (var i=0; i<arrayMethods.length; i++)
			{
				var arrayMethodsIHash = this.stringHash(arrayMethods[i]);

				// Regular expression for striping manch of this method
				regStripManch = new RegExp('\\{\\{manch\\(\\"(' + objInterface.methods[arrayMethodsIHash].nameText + ')\\"\\)\\}\\}', 'gi');

				// Blank regular expression
				var regAddCodeExtra = null;

				// Get parameters from idl line
				var stringMethodParameters = objInterface.methods[arrayMethodsIHash].lineIdl.match(/(?:[^\(]*\()(.*)(?:\))/)[1];
				var arrayMethodParameters = [];
				if (stringMethodParameters.length > 0)
				{
					var countPatameters = 0;
					var levelBracket = 0;
					arrayMethodParameters[0] = '';
					for (var iParametersChar=0; iParametersChar<stringMethodParameters.length; iParametersChar++)
					{
						var currentChar = stringMethodParameters.charAt(iParametersChar);
						if (currentChar == '[' || currentChar == '(')
						{
							arrayMethodParameters[countPatameters] += currentChar;
							levelBracket++;
						}
						else if (currentChar == ']' || currentChar == ')')
						{
							arrayMethodParameters[countPatameters] += currentChar;
							levelBracket--;
						}
						else if (currentChar == ',' && levelBracket == 0)

						{
							arrayMethodParameters[++countPatameters] = '';
						}
						else
						{
							arrayMethodParameters[countPatameters] += currentChar;
						}
					}
					// Create a regular expression for adding code tags to parameters in comments (sometimes this fails, so ignore if it does)
					try
					{					
						regAddCodeExtra = new RegExp('\\b(' + arrayMethodParameters.join('|') + ')\\b', 'gi');
					}
					catch (err)
					{
						this.debugTrace('createInterfaceMDN', 950, 'Unable to <code> parameters : ' + err);
						regAddCodeExtra = null;
					}
				}

				// If the method has a comment
				var stringMethodCommentPretty = '';
				if (objInterface.methods[arrayMethodsIHash].comment !== '')
				{
					stringMethodCommentPretty = this.tidyComment(objInterface.methods[arrayMethodsIHash].comment, false, objInterface.methods[arrayMethodsIHash], regInterface, regAddCode, regAddMethod, regAddCodeExtra);
				}

				// I have decided that this is the most logical order
				if (objInterface.methods[arrayMethodsIHash].notxpcomText !== '' || objInterface.methods[arrayMethodsIHash].noscriptText !== '') // Notxpcom or Noscript
				{
					if (objInterface.methods[arrayMethodsIHash].notxpcomText !== '') // Notxpcom
					{
						stringMDN += '<p>{{method_notxpcom("' + objInterface.methods[arrayMethodsIHash].nameText + '")}}</p>\n';
					}
					else
					{
						stringMDN += '<p>{{method_noscript("' + objInterface.methods[arrayMethodsIHash].nameText + '")}}</p>\n';
					}
					if (objInterface.methods[arrayMethodsIHash].minversionText !== '')
					{
						stringMDN += '<p>{{gecko_minversion_header("' + sourceVersionGecko[objInterface.methods[arrayMethodsIHash].versionFirst][1] + '")}}</p>\n'
					}
					if (objInterface.methods[arrayMethodsIHash].obsoleteText !== '')
					{
						stringMDN += '<p>{{obsolete_header("' + sourceVersionGecko[objInterface.methods[arrayMethodsIHash].versionLast + 1][1] + '")}}</p>\n'
					}
				}
				else if (objInterface.methods[arrayMethodsIHash].minversionText !== '') // Minversion
				{
					stringMDN += '<p>{{method_gecko_minversion("' + objInterface.methods[arrayMethodsIHash].nameText + '","' + sourceVersionGecko[objInterface.methods[arrayMethodsIHash].versionFirst][1] + '")}}</p>\n';
					if (objInterface.methods[arrayMethodsIHash].obsoleteText !== '')
					{
						stringMDN += '<p>{{obsolete_header("' + sourceVersionGecko[objInterface.methods[arrayMethodsIHash].versionLast + 1][1] + '")}}</p>\n'
					}
				}
				else if (objInterface.methods[arrayMethodsIHash].obsoleteText !== '') // Obsolete
				{
					stringMDN += '<p>{{method_obsolete_gecko("' + objInterface.methods[arrayMethodsIHash].nameText + '","' + sourceVersionGecko[objInterface.methods[arrayMethodsIHash].versionLast + 1][1] + '")}}</p>\n';
				}
				else // Clean
				{
					stringMDN += '<h3 name="' + objInterface.methods[arrayMethodsIHash].nameText + '()">' + objInterface.methods[arrayMethodsIHash].nameText + '()</h3>\n'
				}

				// If there is a brief then use it, otherwise use comment
				if (objInterface.methods[arrayMethodsIHash].brief)
				{
					stringMDN += objInterface.methods[arrayMethodsIHash].brief.replace(regStripManch, '<code>$1</code>') + '\n';
				}
				else
				{
					stringMDN += stringMethodCommentPretty.replace(regStripManch, '<code>$1</code>');
				}

				// Show syntax
				stringMDN += '<pre class="eval">\n';
				stringMDN += objInterface.methods[arrayMethodsIHash].lineIdl.match(/[^\(]*\(/);
				if (arrayMethodParameters.length > 0)
				{
					for (var iParameters=0; iParameters<arrayMethodParameters.length; iParameters++)
					{
						stringMDN += '\n  ' + arrayMethodParameters[iParameters].replace(/\[optional\]/i, '').replace(/^\s+/, '').replace(/\[out,\sretval\]/i,'[out]');
						if (iParameters < arrayMethodParameters.length - 1)
						{
							stringMDN += ',';
						}
						// If the parameter is optional then deal with that
						if (arrayMethodParameters[iParameters].match(/\[optional\]/i))
						{
							stringMDN += ' {{optional_inline()}}'
						}
					}
					stringMDN += '\n);\n';
				}
				else
				{
					stringMDN += ');\n';
				}
				stringMDN += '</pre>\n';

				// Show parameters
				stringMDN += '<h6 name="' + this.lz_Parameters_Name + '">' + this.lz_Parameters + '</h6>\n';
				if (arrayMethodParameters.length > 0)
				{
					stringMDN += '<dl>\n';
					for (var iParameters=0; iParameters<arrayMethodParameters.length; iParameters++)
					{
						var stringParameterName = arrayMethodParameters[iParameters].replace(/\s*$/,'').match(/\S*$/)[0];
						var stringParameterNameLower = stringParameterName.toLowerCase();
						stringMDN += '<dt><code>' + stringParameterName + '</code>';

						// If the parameter is optional then deal with that
						if (arrayMethodParameters[iParameters].match(/\[optional\]/i))
						{
							stringMDN += ' {{optional_inline()}}'
						}
						stringMDN += '</dt>\n';
						stringMDN += '<dd>';

						// If there a description for this parameter then use it
						if(objInterface.methods[arrayMethodsIHash].parameters && objInterface.methods[arrayMethodsIHash].parameters[stringParameterNameLower])
						{
							stringMDN += objInterface.methods[arrayMethodsIHash].parameters[stringParameterNameLower].description.replace(regStripManch, '<code>$1</code>');
						}
						else
						{
							stringMDN += this.lz_MissingDescription;
						}
						stringMDN += '</dd>\n';
					}
					stringMDN += '</dl>\n';
				}
				else
				{
					stringMDN += '<p>' + this.lz_None + '</p>\n';
				}

				// Show returns, if there is a return (not void)
				if (objInterface.methods[arrayMethodsIHash].lineIdl.match(/^void\s+/i) === null)
				{
					stringMDN += '<h6 name="' + this.lz_ReturnValue_Name + '">' + this.lz_ReturnValue + '</h6>\n';
					stringMDN += '<p>';
					// If there are retval and/or returns
					if (objInterface.methods[arrayMethodsIHash].retval || objInterface.methods[arrayMethodsIHash].returns)
					{
						if (objInterface.methods[arrayMethodsIHash].retval)
						{
							stringMDN += objInterface.methods[arrayMethodsIHash].retval.join(' ').replace(regStripManch, '<code>$1</code>');
						}
						if (objInterface.methods[arrayMethodsIHash].returns)
						{
							stringMDN += objInterface.methods[arrayMethodsIHash].returns.description.replace(regStripManch, '<code>$1</code>');
						}
					}
					else
					{
						stringMDN += this.lz_MissingDescription;
					}
					stringMDN += '</p>\n';
				}

				// Show exceptions
				stringMDN += '<h6 name="' + this.lz_ExceptionsThrown_Name + '">' + this.lz_ExceptionsThrown + '</h6>\n';
				stringMDN += '<dl>';
				if (objInterface.methods[arrayMethodsIHash].exceptions)
				{
					for each (var objException in objInterface.methods[arrayMethodsIHash].exceptions)
					{
						stringMDN += '<dt><code>' + objException.nameText + '</code></dt>\n';
						stringMDN += '<dd>' + objException.description + '</dd>\n';
					}
				}
				else
				{
					stringMDN += '<dt><code>' + this.lz_MissingException + '</code></dt>\n';
					stringMDN += '<dd>' + this.lz_MissingDescription + '</dd>\n';
				}
				stringMDN += '</dl>\n';
			}
		}

		stringMDN += '<h2 name="' + this.lz_Remarks_Name + '">' + this.lz_Remarks + '</h2>\n';
		stringMDN += '<p>&nbsp;</p>\n';

		stringMDN += '<h2 name="' + this.lz_SeeAlso_Name + '">' + this.lz_SeeAlso + '</h2>\n';
		stringMDN += '<ul>\n  <li>&nbsp;</li>\n</ul>\n';

		// Strip references to this interface
		var regInterfaceThis = new RegExp('{{interface\\("(<code>' + objInterface.interfaceName + '</code>)"\\)}}', 'gi');
		stringMDN = stringMDN.replace(regInterfaceThis,'$1');

		// Remove cases of {{interface("mozilla")}}
		stringMDN = stringMDN.replace(/{{interface\("(mozilla)"\)}}/gi,'$1');

		// Remove cases of " .. interface("mozilla") .. "
		stringMDN = stringMDN.replace(/"\s\.\.\sinterface\("(mozilla)"\)\s\.\.\s\"/gi,'$1');

		// Turn interface with method into ifmethod
		stringMDN = stringMDN.replace(/\{\{interface\(("\w*")\)\}\}\:\:(\w*)(\(\s*\))?/g,'{{ifmethod($1,"$2")}}');

		// Strip interface::
		stringMDN = stringMDN.replace(/<code>\w*<\/code>\:\:/g,'');

		// Could probably do this in another way, but here is ok
		stringMDN = stringMDN.replace(/<code>true<\/code>/gi,'<code>true</code>');
		stringMDN = stringMDN.replace(/<code>false<\/code>/gi,'<code>false</code>');

		// Make lists into, well, lists
		stringMDN = stringMDN.replace(/&lt;li&gt;(.*)&lt;\/li&gt;/g,'<li>$1</li>').replace(/&lt;ol&gt;(.*)&lt;\/ol&gt;/g,'<ol>$1</ol>').replace(/&lt;ul&gt;(.*)&lt;\/ul&gt;/g,'<ul>$1</ul>').replace(/&lt;li&gt;/g,'<li>');

		this.debugTrace('createInterfaceMDN', 940, 'Finish');

		return stringMDN;
	},

/***********************************************************
* Source cleanup
***********************************************************/

	cleanupIdl: function(stringSource)
	{
		var cleanupIdlLine = 0;

		var stringClean = stringSource;

		// Remove /* */ comments from end of lines
		var stringClean = stringClean.replace(/\s*\/\*(?!\*)[^\n]*\*\/\s*(?=\n)/g, '');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Remove // comments at beginnning of lines
		var stringClean = stringClean.replace(/^\s*\/{2,2}[^\n]*\n/gm, '');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Remove space at end of lines
		var stringClean = stringClean.replace(/\s+$/gm, '');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Neaten comments
		// Put comment (normal and doxygen) start on its own line
		var stringClean = stringClean.replace(/^\s*(\/\*{1,2}(?!\*))(?!$)/gm, '$1\n \* ');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Put comment (normal and doxygen) end on its own line [5]
		var stringClean = stringClean.replace(/\*+\/[^\n]*(?=\n)/g, '\n\*\/');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Put interface { on the line with interface (useful later)
		var stringClean = stringClean.replace(/(^INTERFACE[^\n]*)\n\s*\{/gim, '$1 {\n');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Strip space at end of lines (needed again)
		var stringClean = stringClean.replace(/\s+$/gm, '');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Strip blank lines
		var stringClean = stringClean.replace(/\n+/g, '\n');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Strip regular comments, just in case there is one around an interface
		// Strip non comment lines outside interfaces
		// Strip code blocks
		// Add * to doxygen comments that are missing them
		var stringStripLines = stringClean.match(/[^\n]*(?:\n|$)/g);
		var stringClean = '';
		var spaceStar = 0;
		var inInterface = false;
		var inCommentRegular = false;
		var inCommentDoxygen = false;
		var inCodeBlock = false;
		for (var i=0; i<stringStripLines.length; i++)
		{
			// If this is the beginning of a code block
			if (stringStripLines[i].match(/\s*%{/) !== null && !inCommentRegular && !inCommentDoxygen)
			{
				inCodeBlock = true;
			}
			// If this is the beginning of a regular comment
			else if (stringStripLines[i].match(/\s*\/\*(?!\*)/) !== null && !inCodeBlock)
			{
				inCommentRegular = true;
			}
			// If this is the beginning of a doxygen comment
			else if (stringStripLines[i].match(/\s*\/\*{2,2}/) !== null && !inCodeBlock)
			{
				stringClean += stringStripLines[i];
				inCommentDoxygen = true;
			}
			// If this is the beginning of an interface
			else if (stringStripLines[i].match(/INTERFACE[^\{]*{/i) !== null && !inCodeBlock)
			{
				stringClean += stringStripLines[i];
				inInterface = true;
			}
			else if (!inCommentRegular && !inCodeBlock)
			{
				// Add missing * in doxygen comments
				if (inCommentDoxygen && stringStripLines[i].match(/^\s*\*/) == null)
				{
					stringClean += '*';
					// Try and keep alignment (mainly for lists)
					if (spaceStar > 0)
					{
						spaceStarReg =  new RegExp('^\\s\{' + spaceStar + ',' + spaceStar + '\}');
						stringClean += stringStripLines[i].replace(spaceStarReg, '');
					}
				}
				else if (inCommentDoxygen)
				{
					if (stringStripLines[i].match(/^\s*\*/) !== null)
					{
						spaceStar = stringStripLines[i].match(/^\s*\*/)[0].length;
					}
					stringClean += stringStripLines[i];
				}
				// If line is in interface or is uuid line
				else if (inInterface || (stringStripLines[i].match(/\[.*uuid.*\]/) != null))
				{
					stringClean += stringStripLines[i];
				}
			}
			if (stringStripLines[i].match(/\};$/) !== null)
			{
				inInterface = false;
			}

			if (stringStripLines[i].match(/\s*\*\//) !== null)
			{
				inCommentRegular = false;
				inCommentDoxygen = false;
			}
			if (stringStripLines[i].match(/^\s*%\}/) !== null)
			{
				inCodeBlock = false;
			}
		}
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Strip leading spaces
		var stringClean = stringClean.replace(/^\s*/gm, '');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Strip newlines after commas in methods [10]
		var stringClean = stringClean.replace(/(^(?!\*).*,)\n(?!\*)/gm, '$1 ');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Strip newlines after brackets in methods
		var stringClean = stringClean.replace(/(^(?!\*).*\()\n(?!\*)/gm, '$1');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Strip newlines after ] if the next line does not start with a * or interface (for case of [noscript] etc on line by itself)
		var stringClean = stringClean.replace(/]\n(?!\*|interface)/gm, '] ');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Join following comments
		var stringClean = stringClean.replace(/^\*\/\n\/\**/gm, '*');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Switch 'o' style lists to '-' style
		var stringClean = stringClean.replace(/(^\*\s*)o(?=\s)/gm, '$1-');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Switch '@li' style lists to '-' style (This will assume all li are unordered) [15]
		var stringClean = stringClean.replace(/(^\*\s*)@li(?=\s)/gm, '$1-');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Purge multiple blank comment lines
		var stringClean = stringClean.replace(/(\*\n)+(?=\*\n)/g, '');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Purge trailing blank comment lines
		var stringClean = stringClean.replace(/\*\n(?=\*\/)/g, '');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Purge blank comment lines before @ lines
		var stringClean = stringClean.replace(/\n\*(?=\n\*\s*@)/g, '');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Turn @throw and @exception into @throws [20]
		var stringClean = stringClean.replace(/(\n\*\s*@)(?:throw|exception){1}\b/gi, '$1throws');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Turn @return into @returns
		var stringClean = stringClean.replace(/(\n\*\s*@)(?:return){1}\b/gi, '$1returns');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Replace abbreviations
		// Turn e.g. into 'for example'
		var stringClean = stringClean.replace(/\be\.?g\.?(?=,?\s)/gi, 'for example');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Turn i.e. into 'that is'
		var stringClean = stringClean.replace(/\bi\.?e\.?(?=,?\s)/gi, 'that is');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Turn etc. into 'and so on', could be a better way than the double replace
		var stringClean = stringClean.replace(/\b(?:e\.t\.c|etc)(?=[\.|\s|\)])(?=\W|$)/gi, 'and so on.').replace(/and\sso\son\.+/g,'and so on.');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Replace contractions
		// Turn can't [25]
		var stringClean = stringClean.replace(/\bcan't\b/gi, 'can not');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Turn won't into 'will not'
		var stringClean = stringClean.replace(/\bwon't\b/gi, 'will not');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Replace couldn't, didn't, don't, isn't, shouldn't, wasn't, weren't
		var stringClean = stringClean.replace(/\b(could|did|do|have|is|should|was|were)n't\b/gi, '$1 not');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Replace it'll
		var stringClean = stringClean.replace(/\bit'll\b/gi, 'it will');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		// Replace it's
		var stringClean = stringClean.replace(/\bit's\b/gi, 'it is');
		this.debugTrace('cleanupIdl', 987, ' [' + ++cleanupIdlLine + ']\n' + stringClean);

		return stringClean;

	},

	// Pretty format comment, optional also add @param/@throws/@returns/@retval/@brief to object
	tidyComment: function(sourceComment, forTable, objGeneric, regInterface, regAddCode, regAddMethod, regAddCodeExtra)
	{
		var stringReturn = '';

		// Convert null to lowercase
		sourceCommentA = sourceComment.replace(/\bnull\b/gi, 'null');

		// Convert 'note:'/'note:' to @note
		sourceCommentB = sourceCommentA.replace(/^\*\s*note:?\s+/gmi, '* @note ');

		// Encode { and } as part of not stuffing up templates
		sourceCommentC = sourceCommentB.replace(/{/g, '&#123;').replace(/}/g, '&#125;');

		// Encode < and >
		sourceCommentD = sourceCommentC.replace(/</g, '&lt;').replace(/>/g, '&gt;');

		var arrayParagraph = [];
		var currentParagraph = 0;
		arrayParagraph[currentParagraph] = '';
		var listTracker = [];
		var listLevel = 0;
		listTracker[listLevel] = {};
		listTracker[listLevel].indent = -10;
		var sourceCommentLines = sourceCommentD.match(/[^\n]+(?=\n|$)/g);
		if (sourceCommentLines === null)
		{
			return stringReturn;
		}
		for (var i=0; i<sourceCommentLines.length; i++)
		{
			// Start new paragraph if a blank line
			if (sourceCommentLines[i].match(/^\*\s*$/) !== null)
			{
				// Close any lists
				while (listLevel > 0)
				{
					arrayParagraph[currentParagraph] += '\n</' + listTracker[listLevel].type + '>';
					listLevel--;
				}
				arrayParagraph[++currentParagraph] = '';
			}
			// Check for @ paragraphs
			else if (sourceCommentLines[i].match(/^\*\s*@\S/) !== null)
			{
				// Close any lists
				while (listLevel > 0)
				{
					arrayParagraph[currentParagraph] += '\n</' + listTracker[listLevel].type + '>';
					listLevel--;
				}
				arrayParagraph[++currentParagraph] = sourceCommentLines[i].replace(/\*\s*(?=@)/, '');
			}
			// Check for list
			else if (sourceCommentLines[i].match(/^\*\s*(?=(-#?\s|\.$))/) !== null)
			{
				var listType = sourceCommentLines[i].match(/^\*\s*(-#?(?=\s)|\.(?=$))/)[1].replace(/-#/, 'ol').replace(/-/, 'ul'); // List type or .
				var levelIndent = sourceCommentLines[i].match(/^\*\s*(?=\S)/).length -1; // Get the indent of the list item
				// If end of list level '.'
				if (listType == '.')
				{
					while (levelIndent >= listTracker[listLevel].indent)
					{
						arrayParagraph[currentParagraph] += '\n</' + listTracker[listLevel].type + '>\n';
						listLevel--;
					}
					arrayParagraph[++currentParagraph] = '';
				}
				// If the indent is higher than the current indent
				else if (levelIndent < listTracker[listLevel].indent)
				{
					while (levelIndent < listTracker[listLevel].indent)
					{
						arrayParagraph[currentParagraph] += '\n</' + listTracker[listLevel].type + '>\n';
						listLevel--;
					}
				}
				// If the indent is deeper than the current indent
				else if (levelIndent > listTracker[listLevel].indent)
				{
					listLevel++;
					listTracker[listLevel] = {};
					listTracker[listLevel].indent = levelIndent;
					listTracker[listLevel].type = listType;
					arrayParagraph[currentParagraph] += '\n<' + listType + '>';
				}
				// If the indent is the current indent (use the indent of the higher level just in case...)
				else if (levelIndent > listTracker[listLevel - 1].indent)
				{
					// If the list type changes
					if (listTracker[listLevel].type !== listType)
					{
						arrayParagraph[currentParagraph] += '\n</' + listTracker[listLevel].type + '>';
						listTracker[listLevel].type = listType;
						arrayParagraph[currentParagraph] += '\n<' + listType + '>';
					}
				}
				if (listType !== '.')
				{
					arrayParagraph[currentParagraph] += '\n<li>';
					arrayParagraph[currentParagraph] += this.firstCaps(sourceCommentLines[i].replace(/^\*\s*(-#?\s*)/, ''));
				}
			}
			// Continue the paragraph

			else
			{
				arrayParagraph[currentParagraph] += sourceCommentLines[i].replace(/\*\s*/, ' ');
			}
		}

		// Tidy up paragraphs and deal with @ paragraphs (start from end as some may be deleted)
		for (var i=arrayParagraph.length - 1; i>=0; i--)
		{
			// Strip blank paragraphs
			if (arrayParagraph[i] == '')
			{
				arrayParagraph.splice(i, 1);
			}
			else
			{
				// Strip leading and trailing spaces
				arrayParagraph[i] = arrayParagraph[i].replace(/(^\s+|\s+$)/g, '');

				// Strip multiple spaces
				arrayParagraph[i] = arrayParagraph[i].replace(/\s+/g, ' ');

				// Add missing punctuation
				arrayParagraph[i] = arrayParagraph[i].replace(/(\d|\w)(?=\n|$)/, '$1\.');

				// Escape " that are going to be in notes
				if (arrayParagraph[i].match(/^@note\s/i) !== null)
				{
					arrayParagraph[i] = arrayParagraph[i].replace(/"/g, '\\"');
				}
				// wiki.html {{ and }} that are not going to be in notes (should just be able to encode, but wiki converts them back)
				else
				{
					arrayParagraph[i] = arrayParagraph[i].replace(/((?:&#123;){2,}|(?:&#125;){2,})/g, '{{web.html("$1")}}');
				}

				// Add internal links and code format
				arrayParagraph[i] = this.commentFormatLink(arrayParagraph[i], regInterface, regAddCode, regAddMethod, regAddCodeExtra)

				// Add note template to notes
				if (arrayParagraph[i].match(/^@note\s/i) !== null)
				{
					// Fix templates that are going to be inside notes
					arrayParagraph[i] = arrayParagraph[i].replace(/{{([^}}]*)}}/g, '" .. $1 .. "');
					arrayParagraph[i] = '{{note("' + this.firstCaps(arrayParagraph[i].replace(/^@note\s+/, '')) + '")}}';
				}

				// Convert &#123; and &#125; to { and } as they should all be safe now
				arrayParagraph[i] = arrayParagraph[i].replace(/&#123;/g, '{').replace(/&#125;/g, '}')

				// Non-note @
				if (arrayParagraph[i].match(/^@\S/) !== null)
				{
					// If an object has been passed then add to it
					if (objGeneric)
					{
						var atName = null;
						var atType = null;
						// Get @ type and remove from paragraph
						try
						{
							atType = arrayParagraph[i].match(/@\S+(?=\s)/)[0].toLowerCase();
							arrayParagraph[i] = arrayParagraph[i].replace(/@\S+\s+/, '');
						}
						catch (err)
						{
							atType = null;
						}
						if (atType === '@param' || atType === '@throws')
						{
							// Strip leading in/out from description (sometimes out is before name)
							arrayParagraph[i] = arrayParagraph[i].replace(/^(?:in\b|out\b|\[(?:in|out)\])\s*(?:-\s*)*/i, '');
							// Sometimes interestingly formed docs can cause problems
							try
							{
								// Get @ name and remove from paragraph
								atName = arrayParagraph[i].match(/\S+(?=\s)/)[0];
								// Strip manch if required
								atName = atName.replace(/\{\{manch\(\"|\"\)\}\}/g,'');
								var atNameLower = atName.toLowerCase();
								arrayParagraph[i] = arrayParagraph[i].replace(/\S+\s+/, '');
							}
							catch (err)
							{
								atName = null;
							}
						}
						// Strip any leading -
						arrayParagraph[i] = arrayParagraph[i].replace(/^-\s*(?=\S)/, '');
						if (atType === '@param' && atName) // Parameter
						{
							// If object does not have parameters
							if (!objGeneric.parameters)
							{
								objGeneric.parameters = {};
							}
							// If parameter object does not exist
							if (!objGeneric.parameters[atNameLower])
							{
								objGeneric.parameters[atNameLower] = {};
							}

							// Strip leading in/out from description (sometimes out is after name)
							arrayParagraph[i] = arrayParagraph[i].replace(/^(?:in\b|out\b|\[(?:in|out)\])\s*(?:-\s*)*/i, '');

							objGeneric.parameters[atNameLower].nameText = atName;
							objGeneric.parameters[atNameLower].description = this.firstCaps(arrayParagraph[i]);
						}
						else if (atType === '@throws' && atName) // Exception
						{
							// If object does not have exceptions
							if (!objGeneric.exceptions)
							{
								objGeneric.exceptions = {};
							}
							// If exception object does not exist
							if (!objGeneric.exceptions[atNameLower])
							{
								objGeneric.exceptions[atNameLower] = {};
							}
							objGeneric.exceptions[atNameLower].nameText = atName;
							objGeneric.exceptions[atNameLower].description = this.firstCaps(arrayParagraph[i]);
						}
						else if (atType === '@returns') // Returns
						{
							// If object does not have returns
							if (!objGeneric.returns)
							{
								objGeneric.returns = {};
							}
							objGeneric.returns.description = this.firstCaps(arrayParagraph[i]);
						}
						else if (atType === '@retval') // Retval
						{
							// If object does not have retval
							if (!objGeneric.retval)
							{
								objGeneric.retval = [];
							}
							objGeneric.retval[objGeneric.retval.length] = this.firstCaps(arrayParagraph[i]);
						}
						else if (atType === '@brief') // Brief (Hopefully should only be one)
						{
							objGeneric.brief = this.firstCaps(arrayParagraph[i]);
						}
					}
					arrayParagraph.splice(i, 1)
				}
			}
		}


		for (var i=0; i<arrayParagraph.length; i++)
		{
			// Put 'p' tags around paragraphs if required
			if (i == arrayParagraph.length - 1 && forTable)
			{
				stringReturn += arrayParagraph[i];
			}
			else
			{
				stringReturn += '<p>' + arrayParagraph[i] + '</p>';
			}
			stringReturn += '\n';
		}

		return stringReturn;
	},

	// Create array of object nameText and pre-process interface
	processObject: function(objectsGeneric, objInterface, sourceVersionGecko)
	{
		var arrayGeneric = [];
		for each (var objGeneric in objectsGeneric)
		{
			// Gecko Minversion
			objGeneric.minversionText = '';
			if (objGeneric.versionFirst != objInterface.versionFirst)
			{
				objGeneric.minversionText = ' {{gecko_minversion_inline("' + sourceVersionGecko[objGeneric.versionFirst][1] + '")}}';
			}

			// Check if notxpcom
			objGeneric.notxpcomText = '';
			if (objGeneric.lineIdl.match(/\[notxpcom\]\s+/i) !== null)
			{
				objGeneric.notxpcomText = ' {{notxpcom_inline()}}';
				objGeneric.lineIdl = objGeneric.lineIdl.replace(/\[notxpcom\]\s+/, '')
			}

			// Check if noscript
			objGeneric.noscriptText = '';
			if (objGeneric.lineIdl.match(/\[noscript\]\s+/i) !== null)
			{
				objGeneric.noscriptText = ' {{noscript_inline()}}';
				objGeneric.lineIdl = objGeneric.lineIdl.replace(/\[noscript\]\s+/, '')
			}

			// Check if obsolete
			objGeneric.obsoleteText = '';
			if (objGeneric.versionLast != objInterface.versionLast)
			{
				objGeneric.obsoleteText = ' {{obsolete_inline("' + sourceVersionGecko[objGeneric.versionLast + 1][1] + '")}}';
				// While here update Gecko Last changed Version
				if (objInterface.versionLastChanged < objGeneric.versionLast + 1)
				{
					objInterface.versionLastChanged = objGeneric.versionLast + 1;
				}
			}

			arrayGeneric.push(objGeneric.nameText);
		}

		return arrayGeneric;
	},

	// Create internal links and code format
	commentFormatLink: function(sourceComment, regInterface, regAddCode, regAddMethod, regAddCodeExtra)
	{
		var returnComment = sourceComment;
		if (regInterface)
		{
			returnComment = returnComment.replace(regInterface, '{{interface("$1")}}');
		}
		if (regAddCode)
		{
			returnComment = returnComment.replace(regAddCode, '<code>$1</code>');
		}
		if (regAddMethod)
		{
			returnComment = returnComment.replace(regAddMethod, '{{manch("$1")}}');
			// Sometimes a kindly person has put () after methods
			returnComment = returnComment.replace(/({{manch\(\"\w*\"\)}})\(\)/, '$1');
		}
		if (regAddCodeExtra)
		{
			returnComment = returnComment.replace(regAddCodeExtra, '<code>$1</code>');
		}
		return returnComment;
	},

/***********************************************************
* Functions generic
***********************************************************/

	openAndReuseOneTabPerURL: function(url)
	{
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		var browserEnumerator = wm.getEnumerator("navigator:browser");

		// Check each browser instance for our URL
		var found = false;
		while (!found && browserEnumerator.hasMoreElements())
		{
			var browserWin = browserEnumerator.getNext();
			var tabbrowser = browserWin.gBrowser;

			// Check each tab of this browser instance
			var numTabs = tabbrowser.browsers.length;
			for (var index = 0; index < numTabs; index++)
			{
				var currentBrowser = tabbrowser.getBrowserAtIndex(index);
				if (url == currentBrowser.currentURI.spec)
				{
					// The URL is already opened. Select this tab.
					tabbrowser.selectedTab = tabbrowser.tabContainer.childNodes[index];

					// Focus *this* browser-window
					browserWin.focus();

					found = true;
					break;
				}
			}
		}

		// Our URL isn't open. Open it now.
		if (!found)
		{
			var recentWindow = wm.getMostRecentWindow("navigator:browser");
			if (recentWindow)
			{
				// Use an existing browser window
				recentWindow.delayedOpenTab(url, null, null, null, null);
			}
			else
			{
				// No browser windows are open, so open a new one.
				window.open(url);
			}
		}
	},

	removeInterfaceEditorTabs: function()
	{
		// Reference the tabbox
		var tabboxInterfaceEditor = document.getElementById("tabboxInterfaceEditor");
		var tabsInterfaceEditor = document.getElementById("tabsInterfaceEditor");
		var tabpanelsInterfaceEditor = document.getElementById("tabpanelsInterfaceEditor");

		// Remove the tabs
		while (tabsInterfaceEditor.childNodes.length > 1)
		{
			tabpanelsInterfaceEditor.removeChild(tabpanelsInterfaceEditor.childNodes[tabsInterfaceEditor.childNodes.length-1]);
			tabsInterfaceEditor.removeItemAt(tabsInterfaceEditor.childNodes.length-1);
		}
	},

	addInterfaceEditorTab: function(tabName, tabContent)
	{
		// Reference the tabs
		var tabsInterfaceEditor = document.getElementById("tabsInterfaceEditor");

		// Reference the tabpanels
		var tabpanelsInterfaceEditor = document.getElementById("tabpanelsInterfaceEditor");

		// Create new tab
		var newTab = document.createElement('tab');
		newTab.setAttribute('label', tabName);
		tabsInterfaceEditor.appendChild(newTab);

		// Create new tabpanel
		var newTabpanel = document.createElement('tabpanel');
		newTabpanel.setAttribute('flex', '1');
		var newTextBox = document.createElement('textbox');
		newTextBox.setAttribute('newlines', 'pasteintact');
		newTextBox.setAttribute('multiline', 'true');
		newTextBox.setAttribute('wrap', 'off');
		newTextBox.setAttribute('flex', '1');
		newTextBox.setAttribute('spellcheck', 'false');
		newTabpanel.appendChild(newTextBox);
		tabpanelsInterfaceEditor.appendChild(newTabpanel);
		newTextBox.value = tabContent;
	},

	resetProgress: function()
	{
		document.getElementById("progress").value = '';
	},

	updateProgress: function(updateText)
	{
		document.getElementById("progress").value = updateText + '\n' + document.getElementById("progress").value;
	},

	firstCaps: function(stringParagraph)
	{
		return stringParagraph.charAt(0).toUpperCase() + stringParagraph.substr(1);
	},

	// Create hash of a string (used to prevent names causing problems)
	stringHash: function(stringToHash)
	{
		// In mdni lower case is same as upper case, so make lower case
		stringToHash = stringToHash.toLowerCase();

		// result is an out parameter,
		// result.value will contain the array length
		var result = {};
		// data is an array of bytes
		var data = this.nsIScriptableUnicodeConverter.convertToByteArray(stringToHash, result);
		this.nsICryptoHash.init(this.nsICryptoHash.MD5);
		this.nsICryptoHash.update(data, data.length);
		var hash = this.nsICryptoHash.finish(true);

		return hash;

	},

/***********************************************************
* Debug functions
***********************************************************/

	// Dump a message straight to the error console.
	jsdump: function(str)
	{
  		this.nsIConsoleService.logStringMessage(str);
	},

	getDebugLevel: function()
	{
		// Get the debug level
		// Levels are: 10-Few alerts -> 999-Every alert
		this.debugLevel = 10;
		try {this.debugLevel = this.prefmdni.getIntPref("debugLevel");}catch (err) {}

		var allDebugTraceLevels = this.prefDebug.getChildList("", {});
		for (var i=0; i<allDebugTraceLevels.length; i++)
		{
			this.debugTraceLevels[allDebugTraceLevels[i]] = this.prefDebug.getIntPref(allDebugTraceLevels[i]);
		}
		this.debugTraceLevels["--set--"] = true;
	},

	// Debug tracing function
	// The higher the traceLevel the less important to the user
	// Generally traceLevel 10 to 999
	// Do not use < 10 - Was used by old debug method
	// Critical = 10
	// User debug generally <= 100
	// Development generally >= 900
	debugTrace: function(traceDomain, traceLevel, stringMessage, stringCaller)
	{
		if (stringCaller == undefined)
		{
			stringCaller = '';
		}
		if (!this.debugTraceLevels["--set--"])
		{
			this.getDebugLevel();
		}
		var traceDomainLevel = this.debugTraceLevels[traceDomain];
		traceDomainLevel = (traceDomainLevel != undefined) ? traceDomainLevel : 0;
		if (traceDomainLevel >= traceLevel || this.debugLevel >= traceLevel)
		{
			this.nsIConsoleService.logStringMessage('mdni' + stringCaller + ' ' + traceDomain + '[' + traceLevel + '] ' + stringMessage);
		}
	}

};
