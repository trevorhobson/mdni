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

	versionGecko: [
		['mozilla1.7', '1.7'],
		['mozilla1.8', '1.8'],
		['firefox2', '1.8.1'],
		['firefox', '1.9'],
		['mozilla1.9.1', '1.9.1'],
		['mozilla1.9.2', '1.9.2'],
//		['mozilla2.0', '2.0'],
		['mozilla-central', '2.0'],
	],

/*
	// Testing list
	versionGecko: [
		['mozilla1.7', '1.7'],
		['mozilla-central', '2.0'],
	],
*/
	nsIConsoleService: Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService),

	nsIDOMSerializer: Components.classes["@mozilla.org/xmlextras/xmlserializer;1"].createInstance(Components.interfaces.nsIDOMSerializer),

	nsIScriptableUnicodeConverter: Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter),
	nsICryptoHash: Components.classes["@mozilla.org/security/hash;1"].createInstance(Components.interfaces.nsICryptoHash),

	prefmdni: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.mdni."),
	prefDebug: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.mdni.debug."),

	debugTraceLevels: {},

	objInterface: {},

	arrayWarnings: [],
	countWarnings: 0,

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
	},


/***********************************************************
* UI User Events
***********************************************************/

	userGenerateMDN: function()
	{
		if (document.getElementById("sourceIdl").value !== '')
		{
			this.generateFromMXR(document.getElementById("sourceIdl").value);
		}
	},

/***********************************************************
* Load IDLs from MXR and generate documentation
***********************************************************/

	generateFromMXR: function(sourceIdl)
	{
		// Reset the Interface object
		this.objInterfaceSource = {};
		this.objInterfaceSource.attributes = {};
		this.objInterfaceSource.constants = {};
		this.objInterfaceSource.methods = {};
		this.objInterfaceSource.interfaceName = null;

		// Reset the Warnings array
		this.arrayWarnings = [];
		this.countWarnings = 0;

		// Reset the progress tab
		this.resetProgress();

		this.updateProgress('Processing ' + sourceIdl);

		// Loop over the Gecko versions
		for (var i=0; i<this.versionGecko.length; i++)
		{
			// Update progress
			this.updateProgress('Start ' + this.versionGecko[i][1]);
			this.updateProgress('Searching mxr');

			var versionGeckoMXRSearchUrl = 'http://mxr.mozilla.org/' + this.versionGecko[i][0] + '/ident?i=' + sourceIdl;
			var versionGeckoMXRSearchResult = this.readRemoteFile(versionGeckoMXRSearchUrl, 'text');
			if (versionGeckoMXRSearchResult !== null)
			{

				var findPath = new RegExp('Defined\\sas\\sa\\sinterface\\sin\\:\\s*<ul>\\s*<li>\\s*<a\\shref="\\/' + this.versionGecko[i][0] + '\\/source\/[^>]*idl">[^<]*', 'gi');
				var versionGeckoMXRPathPlus = versionGeckoMXRSearchResult.match(findPath);
				if (versionGeckoMXRPathPlus !== null)
				{
					var versionGeckoMXRPath = versionGeckoMXRPathPlus[0].match(/[^>]*$/);
					if (versionGeckoMXRPath !== null)
					{
						this.updateProgress(' Path found - ' + versionGeckoMXRPath);
						var versionGeckoMXRIdlUrl = 'http://mxr.mozilla.org/' + this.versionGecko[i][0] + '/source/' + versionGeckoMXRPath[0] +'?raw=1';
						var versionGeckoMXRIdlText = this.readRemoteFile(versionGeckoMXRIdlUrl, 'text');
						if (versionGeckoMXRIdlText !== null)
						{
							this.updateProgress('  File read');
							var versionGeckoMXRIdlTextClean = this.cleanupIdl(versionGeckoMXRIdlText);
							this.updateInterfaces(versionGeckoMXRIdlTextClean, versionGeckoMXRPath[0], this.versionGecko, i, sourceIdl);
						}
						else
						{
							this.updateProgress('  ERROR - Reading file');
						}
					}
					else
					{
						this.updateProgress(' Path NOT found');
					}
				}
				else
				{
					this.updateProgress(' Path NOT found');
				}
			}
			else
			{
				this.updateProgress(' ERROR - mxr');
			}
			this.updateProgress('Finish ' + this.versionGecko[i][1]);
		}

		this.debugTrace('generateFromMXR', 980, 'removeInterfaceTabs');

		// Remove existing tabs
		this.removeInterfaceEditorTabs();

		this.debugTrace('generateFromMXR', 950, 'generateStringMDN');

		// Generate string
		var stringMDN = this.createInterfaceMDN(this.objInterfaceSource, this.versionGecko);

		this.debugTrace('generateFromMXR', 985, 'addInterfaceTab');

		// Add Interface to tabs
		this.addInterfaceEditorTab(this.objInterfaceSource.interfaceName, stringMDN);

		if (this.arrayWarnings.length > 0)
		{
			this.debugTrace('generateFromMXR', 985, 'addWarnings');

			this.addInterfaceEditorTab('Warnings', this.arrayWarnings.join('\n'));
		}
		else
		{
			this.debugTrace('generateFromMXR', 985, 'noWarnings');
		}

		this.updateProgress('Complete ' + sourceIdl);
	},

	updateInterfaces: function(cleanIdl, pathIdl, sourceVersionGecko, sourceVersionGeckoIndex, sourceIdl)
	{
		this.debugTrace('updateInterfaces', 990, 'cleanIdl :\n' + cleanIdl);

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
				if (interfaceName == sourceIdl)
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
					this.objInterfaceSource.path = pathIdl;
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
			else if (stringIdlLine.match(/^};{0,1}/) !== null) // End of interface (Sometimes the ; will be missing, hopefully this will not break anything)
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
					stringComment = '';
					inInterface = false;
					// No use processing further if we have found the interface we are after
					break;
				}
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
					var constantName = stringIdlLineClean.match(/\S+(?=\s*\=)/)[0];
					var constantValue = stringIdlLineClean.match(/[^\=]+(?=\s*;)/)[0].replace(/^\s+/, '');

					this.debugTrace('updateInterfaces', 965, 'foundConstant ' + constantName);

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
					stringIdlLineClean = stringIdlLineClean.replace(/\*/g,' ');

					// Sometimes kindly souls decide to break methods in annoying places so may have to shove this line at the beginning of the next
					if (!stringIdlLineClean.match(/\);{0,1}$/) && i<stringIdlLines.length)
					{
						this.debugTrace('updateInterfaces', 970, 'foundMethod-BadSplit :\n' + stringIdlLineClean);
						stringIdlLines[i+1] = stringIdlLineClean + ' ' + stringIdlLines[i+1];
						continue;
					}

					// Get the method name (replace is used for quick and dirty line cleanup)
					var methodName = stringIdlLineClean.replace(/\(.*/,'(').match(/\S+(?=\()/)[0];
					var methodNameHash = this.stringHash(methodName);

					this.debugTrace('updateInterfaces', 965, 'foundMethod ' + methodName);

					if (!this.objInterfaceSource.methods[methodNameHash])
					{
						this.objInterfaceSource.methods[methodNameHash] = {};
						this.objInterfaceSource.methods[methodNameHash].nameText = methodName;
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

		// Get the 'short' name of the interface (useful for a number of things)
		var interfaceNameShort = objInterface.interfaceName.replace(/^nsI/, '');

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

		// Create regular expression for adding interface templates (anything but this interface)
		var regInterface = new RegExp('\\b(nsI(?!' + interfaceNameShort + '\\b)\\w*)\\b', 'gi');

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
		stringMDN += '<p>{{IFSummary("' + objInterface.path + '", "' + objInterface.inherits + '", "' + (objInterface.scriptable == true ? 'Scriptable' : 'Not scriptable') + '", "' + sourceVersionGecko[objInterface.versionLastChanged][1] + '", "??? Add brief description of Interface here! ???"';
		
		// If this is a new interface
		if (objInterface.versionFirst != 0)
		{
			stringMDN += ', "' + sourceVersionGecko[objInterface.versionFirst][1] + '"';
		}

		// If this is an obsolete interface
		if (objInterface.versionLast != sourceVersionGecko.length -1)
		{
			// First comma is for deprecated
			stringMDN += ' , "' + sourceVersionGecko[objInterface.versionLast + 1][1] + '"';
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
/*
		for (var cClass in Components.classes)
		{
// This causes browser to crash
if (cClass.match(/@mozilla/) !== null && cClass !== '@mozilla.org/generic-factory;1' && cClass !== '@mozilla.org/xmlextras/proxy/webservicepropertybagwrapper;1' && cClass !== '@mozilla.org/extensions/manager;1'  && cClass !== '@mozilla.org/nss_errors_service;1' && cClass.match(/@mozilla.org\/intl\/unicode\/decoder/) == null)
{
try
{
dump('Creating: "' + cClass + '"\n');
			var obj = Components.classes[cClass].createInstance();

			if (obj.QueryInterface(Components.interfaces[objInterface.interfaceName]))
			{
				this.jsdump(cClass)
			}
}
catch (err) {}
		}
}
*/
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
				stringMDN += '<code>' + objInterface.methods[arrayMethodsIHash].lineIdl.replace(/\S+(?=\()/, stringMethodLink).replace(/\s+$/, '').replace(/\[out,\s{0,1}retval\]/gi,'[out]') + '</code>';
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
				if (stringAttributeType.match(/nsI\S+/) !== null) // Is an nsI type
				{
					stringAttributeTypeLink = stringAttributeType.replace(/(nsI\S+)(?=\b)/, '{{Interface("$1")}}')
				}
				else // Is another type
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
					stringMDN += '<td><code>' + objInterface.constants[arrayConstants[i]].valuePrevious + '</code></td>\n';
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
							stringMDN += objInterface.constants[arrayConstants[i]].values[j];
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
						if (iParameters > 0)
						{
							stringMDN += ',';
						}
						stringMDN += '\n  ' + arrayMethodParameters[iParameters].replace(/^\s+/, '').replace(/\[out,\sretval\]/gi,'[out]');
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
						stringMDN += '<dt><code>' + stringParameterName + '</code></dt>\n';
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

		this.debugTrace('createInterfaceMDN', 940, 'Finish');

		return stringMDN;
	},

/***********************************************************
* IDL Manipulation to MDN - From single source
***********************************************************/

	generateMDN: function(sourceStringIdl)
	{
		// Create dummy variables
		var dummyVersionGecko = [['', 'manual']];
		var dummyMXRPath = '||Unknown||';

		// Reset the Interfaces object
		this.objInterfaceSources = {};

		// Reset the Warnings array
		this.arrayWarnings =[];

		var stringIdlClean = this.cleanupIdl(sourceStringIdl);
		this.updateInterfaces(stringIdlClean, dummyMXRPath, dummyVersionGecko, 0);

		// Remove existing tabs
		this.removeInterfaceEditorTabs();

		// Create Interface MDN and add to tabs
		for each (var objInterface in this.objInterfaceSources)
		{
			// Generate string
			var stringMDN = this.createInterfaceMDN(objInterface, dummyVersionGecko);

			// Add Interface to tabs
			this.addInterfaceEditorTab(objInterface.interfaceName, stringMDN);
		}

		if (this.arrayWarnings.length > 0)
		{
			this.addInterfaceEditorTab('Warnings', this.arrayWarnings.join('\n'));
		}
	},

/***********************************************************
* Source cleanup
***********************************************************/

	cleanupIdl: function(stringSource)
	{
		// Remove /* */ comments from end of lines
		var stringRemoveA = stringSource.replace(/\s*\/\*(?!\*)[^\n]*\*\/\s*(?=\n)/g, '');

		// Remove // comments at beginnning of lines
		var stringRemoveB = stringRemoveA.replace(/^\s*\/{2,2}[^\n]*\n/gm, '');

		// Remove space at end of lines
		var stringRemoveC = stringRemoveB.replace(/\s+$/gm, '');

		// Neaten comments
		// A. Put comment (normal and doxygen) start on its own line
		var stringNeatenA = stringRemoveC.replace(/^\s*(\/\*{1,2}(?!\*))(?!$)/gm, '$1\n \* ');

		// B. Put comment (normal and doxygen) end on its own line
		var stringNeatenB = stringNeatenA.replace(/\*+\/[^\n]*(?=\n)/g, '\n\*\/');

		// C. Put interface { on the line with interface (useful later)
		var stringNeatenC = stringNeatenB.replace(/(^INTERFACE[^\n]*)\n\s*\{/gim, '$1 {\n');

		// Strip space at end of lines
		var stringStripA = stringNeatenC.replace(/\s+$/gm, '');

		// Strip blank lines
		var stringStripB = stringStripA.replace(/\n+/g, '\n');

		// Strip regular comments, just in case there is one around an interface
		// Strip non comment lines outside interfaces
		// Strip code blocks
		// Add * to doxygen comments that are missing them
		var stringStripLines = stringStripB.match(/[^\n]*(?:\n|$)/g);
		var stringStripC = '';
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
				stringStripC += stringStripLines[i];
				inCommentDoxygen = true;
			}
			// If this is the beginning of an interface
			else if (stringStripLines[i].match(/INTERFACE[^\{]*{/i) !== null && !inCodeBlock)
			{
				stringStripC += stringStripLines[i];
				inInterface = true;
			}
			else if (!inCommentRegular && !inCodeBlock)
			{
				// Add missing * in doxygen comments
				if (inCommentDoxygen && stringStripLines[i].match(/^\s*\*/) == null)
				{
					stringStripC += '*';
					// Try and keep alignment (mainly for lists)
					if (spaceStar > 0)
					{
						spaceStarReg =  new RegExp('^\\s\{' + spaceStar + ',' + spaceStar + '\}');
						stringStripC += stringStripLines[i].replace(spaceStarReg, '');
					}
				}
				else if (inCommentDoxygen)
				{
					if (stringStripLines[i].match(/^\s*\*/) !== null)
					{
						spaceStar = stringStripLines[i].match(/^\s*\*/)[0].length;
					}
					stringStripC += stringStripLines[i];
				}
				// If line is in interface or is uuid line
				else if (inInterface || (stringStripLines[i].match(/\[.*uuid.*\]/) != null))
				{
					stringStripC += stringStripLines[i];
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

		// Strip leading spaces
		var stringStripD = stringStripC.replace(/^\s*/gm, '');

		// Strip newlines after commas in methods
		var stringStripE = stringStripD.replace(/(^(?!\*).*,)\n(?!\*)/gm, '$1 ');

		// Strip newlines after brackets in methods
		var stringStripF = stringStripE.replace(/(^(?!\*).*\()\n(?!\*)/gm, '$1');

		// Strip newlines after ] if the next line does not start with a * or interface (for case of [noscript] etc on line by itself)
		var stringStripG = stringStripF.replace(/]\n(?!\*|interface)/gm, '] ');

		// Join following comments
		var stringJoinA = stringStripG.replace(/^\*\/\n\/\**/gm, '*');

		// Switch 'o' style lists to '-' style
		var stringSwitchA = stringJoinA.replace(/(^\*\s*)o(?=\s)/gm, '$1-');

		// Switch '@li' style lists to '-' style (This will assume all li are unordered)
		var stringSwitchA = stringJoinA.replace(/(^\*\s*)@li(?=\s)/gm, '$1-');

		// Purge multiple blank comment lines
		var stringPurgeA = stringSwitchA.replace(/(\*\n)+(?=\*\n)/g, '')

		// Purge trailing blank comment lines
		var stringPurgeA = stringPurgeA.replace(/\*\n(?=\*\/)/g, '')

		// Purge blank comment lines before @ lines
		var stringPurgeA = stringPurgeA.replace(/\n\*(?=\n\*\s*@)/g, '')
//this.jsdump(stringPurgeA);
		return stringPurgeA;

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
						else if (atType === '@return') // Returns
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
			returnComment = returnComment.replace(/({{manch\(".*"\)}})\(\)/, '$1');
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

	// Evaluate an xpath expression against a given node
	// aType is one of the XPathResult constants - defaults to ANY
	//  : 0 - ANY : 1 - NUMBER : 2 - STRING : 3 - BOOLEAN : 4 - UNORDERED_NODE_ITERATOR
	//  : 5 - ORDERED_NODE_ITERATOR : 6 - UNORDERED_NODE_SNAPSHOT : 7 - ORDERED_NODE_SNAPSHOT
	//  : 8 - ANY_UNORDERED_NODE : 9 - FIRST_ORDERED_NODE
	evaluateXPath: function(aNode, aExpr, aType)
	{
		aType = aType == null ? 0 : Number(aType);
		var xmlDoc = aNode.ownerDocument == null ? aNode : aNode.ownerDocument;
		var nsResolver = xmlDoc.createNSResolver(xmlDoc.documentElement);
		var result = xmlDoc.evaluate(aExpr, aNode, nsResolver, aType, null);
		result.QueryInterface(Components.interfaces.nsIDOMXPathResult);  // not necessary in FF3, only 2.x and possibly earlier
		if (aType == 0)
		{
			aType = result.resultType;
		}
		switch(aType)
		{
			case 1:
				return result.numberValue;
				break;

			case 2:
				return result.stringValue;
				break;

			case 3:
				return result.booleanValue;
				break;

			default:
				return result;
		}
	},

	// Create hash of a string (used to prevent names causing problems)
	stringHash: function(stringToHash)
	{
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
* Functions to read files
***********************************************************/

	// Read remote file (synchronous)
	// returnType - xml or text
	readRemoteFile: function(urlFile, returnType)
	{
		var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
		req.open('GET', urlFile, false); 
		req.send(null);
		if (req.status == 200)
		{
			if (returnType == 'xml')
			{
				return req.responseXML;
			}
			else
			{
				return req.responseText;
			}
		}
		else
		{
			this.debugTrace('readRemoteFile', 900, 'status ' + req.status + ' url ' + urlFile);
		}
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
