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

var mdci = {

	// Production list

	versionGecko: [
		['mozilla1.7', '1.7'],
		['mozilla1.8', '1.8'],
		['mozilla1.8.0', '1.8.0'],
		['mozilla1.9.1', '1.9.1'],
		['mozilla1.9.2', '1.9.2'],
		['mozilla-central', '1.9.3'],
	],

/*
	// Testing list
	versionGecko: [
		['mozilla1.7', '1.7'],
		['mozilla-central', '1.9.3'],
	],
*/
	nsIFilePicker: Components.interfaces.nsIFilePicker,
	nsILocalFile: new Components.Constructor("@mozilla.org/file/local;1", "nsILocalFile"),
	nsIConsoleService: Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService),

	nsIDOMSerializer: Components.classes["@mozilla.org/xmlextras/xmlserializer;1"].createInstance(Components.interfaces.nsIDOMSerializer),

	prefMdci: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.mdci."),
	prefDebug: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.mdci.debug."),

	debugTraceLevels: {},

	objInterfaces: {},

	arrayWarnings: [],
	countWarnings: 0,

	stringBundle: '',

	init: function()
	{
		this.stringBundle = document.getElementById('mdciStrings');
	},


/***********************************************************
* UI User Events
***********************************************************/

	userLoadIDL: function()
	{
		var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(this.nsIFilePicker);
		filePicker.init(window, this.stringBundle.getString("selectIDLTitle"), this.nsIFilePicker.modeGetFile);
		filePicker.appendFilter('IDL Files', '*.idl');
		filePicker.appendFilters(this.nsIFilePicker.filterAll);		var rv = filePicker.show();
		if (rv == this.nsIFilePicker.returnOK)
		{
			var stringSource = this.readLocalFile(filePicker.file, 'text');
			document.getElementById("sourceText").value = stringSource;
		}
	},

	userGenerateMDC: function()
	{
		if (document.getElementById("sourceText").value !== '')
		{
			this.generateMDC(document.getElementById("sourceText").value);
		}
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
		// Reset the Interfaces object
		this.objInterfaces = {};

		// Reset the Warnings array
		this.arrayWarnings = [];
		this.countWarnings = 0;

		// Loop over the Gecko versions
		for (var i=0; i<this.versionGecko.length; i++)
		{
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
						var versionGeckoMXRIdlUrl = 'http://mxr.mozilla.org/' + this.versionGecko[i][0] + '/source/' + versionGeckoMXRPath[0] +'?raw=1';
						var versionGeckoMXRIdlText = this.readRemoteFile(versionGeckoMXRIdlUrl, 'text');
						if (versionGeckoMXRIdlText !== null)
						{
							var versionGeckoMXRIdlTextClean = this.cleanupIdl(versionGeckoMXRIdlText);
							this.updateInterfaces(versionGeckoMXRIdlTextClean, versionGeckoMXRPath[0], this.versionGecko, i);
						}
					}

				}
			}
		}

		// Remove existing tabs
		this.removeInterfaceEditorTabs();

		// Create Interface MDC and add to tabs
		for each (var objInterface in this.objInterfaces)
		{
			// Generate string
			var stringMDC = this.createInterfaceMDC(objInterface, this.versionGecko);

			// Add Interface to tabs
			this.addInterfaceEditorTab(objInterface.interfaceName, stringMDC);
		}

		if (this.arrayWarnings.length > 0)
		{
			this.addInterfaceEditorTab('Warnings', this.arrayWarnings.join('\n'));
		}

	},

	updateInterfaces: function(cleanIdl, pathIdl, sourceVersionGecko, sourceVersionGeckoIndex)
	{
		var arrayConstantOrder = [];
		var countConstantOrder = 0;

		// Split IDL into lines for processing
		var stringIdlLines = cleanIdl.match(/[^\n]*(?:\n|$)/g);
		var inInterface = false;
		var inComment = false;
		var stringComment = '';
		var interfaceScriptable = false;
		var interfaceName = '';
		var interfaceInherits = '';
		for (var i=0; i<stringIdlLines.length; i++)
		{
			if (stringIdlLines[i].match(/^\/\*+/) !== null) // Start of comment
			{
				inComment = true;
			}
			else if (stringIdlLines[i].match(/^\*\//) !== null) // End of comment
			{
				inComment = false;
			}
			else if (inComment) // If in comment, add to comment
			{
				stringComment += stringIdlLines[i];
			}
			else if (stringIdlLines[i].match(/^\[.*uuid\(.*\)\]/i) !== null) // Scriptable line
			{
				interfaceScriptable = (stringIdlLines[i].match(/^\[scriptable,/i) !== null)
			}
			else if (stringIdlLines[i].match(/^INTERFACE.*{/i) !== null) // Start of interface
			{
				// Get interface name
				interfaceName = stringIdlLines[i].match(/^INTERFACE\s+(\S*)/i)[1];
				// Get interface inherits from
				if (stringIdlLines[i].match(/:/) !== null)
				{
					interfaceInherits = stringIdlLines[i].match(/:\s*([^(\s|{)]*)/)[1];
				}
				// If object for this interface does not exist then create it
				if (!this.objInterfaces[interfaceName])
				{
					this.objInterfaces[interfaceName] = {};
					this.objInterfaces[interfaceName].attributes = {};
					this.objInterfaces[interfaceName].constants = {};
					this.objInterfaces[interfaceName].methods = {};
					this.objInterfaces[interfaceName].interfaceName = interfaceName;
					this.objInterfaces[interfaceName].versionFirst = sourceVersionGeckoIndex;
					this.objInterfaces[interfaceName].constantsChanged = false;
				}
				this.objInterfaces[interfaceName].path = pathIdl;
				this.objInterfaces[interfaceName].scriptable = interfaceScriptable;
				this.objInterfaces[interfaceName].inherits = interfaceInherits;
				this.objInterfaces[interfaceName].versionLast = sourceVersionGeckoIndex;
				this.objInterfaces[interfaceName].comment = stringComment;
				stringComment = '';
				inInterface = true;
			}
			else if (stringIdlLines[i].match(/^};/) !== null) // End of interface
			{
				// Add constant array to interface
				this.objInterfaces[interfaceName].constantOrder = arrayConstantOrder;
				// Reset constant order array
				arrayConstantOrder = [];
				countConstantOrder = 0;
				// If there is a left over comment log a warning
				if (stringComment != '')
				{
					this.arrayWarnings[this.countWarnings++] = sourceVersionGecko[sourceVersionGeckoIndex][1] + ' Comment at end of Interface(' + interfaceName + '): ' + stringComment;
				}
				stringComment = '';
				inInterface = false;
			}
			else if (inInterface) // Attributes, Constants and Methods are in Interface
			{
				// Create a clean line for processing, normalise white space, remove space before trailing ; and any (
				var stringIdlLineClean = stringIdlLines[i].replace(/\s+/g, ' ').replace(/\s+(?=(;$|\())/, '')
				if (stringIdlLineClean.match(/(?:^|\s+)attribute\s/) !== null) // Found an attribute
				{
					var attributeName = stringIdlLineClean.match(/\S+(?=;)/)[0];
					// If there is a comment on the end of the line add it to the comment
					if (stringIdlLineClean.match(/;\s*\/+/) !== null)
					{
						var normalComment = stringIdlLineClean.match(/;\s*(.*)/)[1];
						// Clean // comment
						normalComment = normalComment.replace(/\/+\s*/, '')
						// Add to comment
						stringComment += '*\n' + normalComment + '\n';
						// Remove the comment form the idl line
						stringIdlLineClean = stringIdlLineClean.replace(/;.*$/, ';');
					}
					if (!this.objInterfaces[interfaceName].attributes[attributeName])
					{
						this.objInterfaces[interfaceName].attributes[attributeName] = {};
						this.objInterfaces[interfaceName].attributes[attributeName].nameText = attributeName;
						this.objInterfaces[interfaceName].attributes[attributeName].versionFirst = sourceVersionGeckoIndex;
						this.objInterfaces[interfaceName].versionLastAddition = sourceVersionGeckoIndex;
					}
					else
					{
						// If the line 'signature' changed log a warning
						if (this.objInterfaces[interfaceName].attributes[attributeName].lineIdl != stringIdlLineClean)
						{
							this.arrayWarnings[this.countWarnings++] = sourceVersionGecko[this.objInterfaces[interfaceName].attributes[attributeName].versionLast][1] + ' -> ' + sourceVersionGecko[sourceVersionGeckoIndex][1] + ' : ' + this.objInterfaces[interfaceName].attributes[attributeName].lineIdl + ' -> ' + stringIdlLineClean;
						}
					}
					this.objInterfaces[interfaceName].attributes[attributeName].lineIdl = stringIdlLineClean;
					this.objInterfaces[interfaceName].attributes[attributeName].versionLast = sourceVersionGeckoIndex;
					this.objInterfaces[interfaceName].attributes[attributeName].comment = stringComment;
					stringComment = '';
				}
				else if (stringIdlLineClean.match(/^CONST\s/i) !== null) // Found a constant
				{
					var constantName = stringIdlLineClean.match(/\S+(?=\s*\=)/)[0];
					var constantValue = stringIdlLineClean.match(/[^\=]+(?=\s*;)/)[0].replace(/^\s+/, '');
					// If there is a comment on the end of the line add it to the comment
					if (stringIdlLineClean.match(/;\s*\/+/) !== null)
					{
						var normalComment = stringIdlLineClean.match(/;\s*(.*)/)[1];
						// Clean // comment
						normalComment = normalComment.replace(/\/+\s*/, '')
						// Add to comment
						stringComment += '*\n' + normalComment + '\n';
						// Remove the comment form the idl line
						stringIdlLineClean = stringIdlLineClean.replace(/;.*$/, ';');
					}
					// Add to constant order
					arrayConstantOrder[countConstantOrder++] = constantName;

					if (!this.objInterfaces[interfaceName].constants[constantName])
					{
						this.objInterfaces[interfaceName].constants[constantName] = {};
						this.objInterfaces[interfaceName].constants[constantName].nameText = constantName;
						this.objInterfaces[interfaceName].constants[constantName].versionFirst = sourceVersionGeckoIndex;
						this.objInterfaces[interfaceName].constants[constantName].values = [];
						this.objInterfaces[interfaceName].versionLastAddition = sourceVersionGeckoIndex;
					}
					else
					{
						// If the line 'signature' changed log a warning
						if (this.objInterfaces[interfaceName].constants[constantName].lineIdl != stringIdlLineClean)
						{
							this.arrayWarnings[this.countWarnings++] = sourceVersionGecko[this.objInterfaces[interfaceName].constants[constantName].versionLast][1] + ' -> ' + sourceVersionGecko[sourceVersionGeckoIndex][1] + ' : ' + this.objInterfaces[interfaceName].constants[constantName].lineIdl + ' -> ' + stringIdlLineClean;
						}
						// If the value of the constant changed then let the iterface know so we can create a different constants table
						// (Why, oh why do we have to do this. Should not a constant be, CONSTANT!!!)
						if (this.objInterfaces[interfaceName].constants[constantName].valuePrevious != constantValue)
						{
							this.objInterfaces[interfaceName].constantsChanged = true;
						}
					}
					this.objInterfaces[interfaceName].constants[constantName].lineIdl = stringIdlLineClean;
					this.objInterfaces[interfaceName].constants[constantName].versionLast = sourceVersionGeckoIndex;
					this.objInterfaces[interfaceName].constants[constantName].comment = stringComment;
					this.objInterfaces[interfaceName].constants[constantName].values[sourceVersionGeckoIndex] = constantValue;
					this.objInterfaces[interfaceName].constants[constantName].valuePrevious = constantValue;
					stringComment = '';
				}
				else if (stringIdlLineClean != '') // Found a method (Should be nothing else left, blank line check just in case)
				{
					var methodName = stringIdlLineClean.match(/\S+(?=\()/)[0];
					if (methodName == 'toString' || !this.objInterfaces[interfaceName].methods[methodName]) // toString is special case
					{
						this.objInterfaces[interfaceName].methods[methodName] = {};
						this.objInterfaces[interfaceName].methods[methodName].nameText = methodName;
						this.objInterfaces[interfaceName].methods[methodName].versionFirst = sourceVersionGeckoIndex;
						this.objInterfaces[interfaceName].versionLastAddition = sourceVersionGeckoIndex;
					}
					else
					{
						// If the line 'signature' changed log a warning
						if (this.objInterfaces[interfaceName].methods[methodName].lineIdl != stringIdlLineClean)
						{
							this.arrayWarnings[this.countWarnings++] = sourceVersionGecko[this.objInterfaces[interfaceName].methods[methodName].versionLast][1] + ' -> ' + sourceVersionGecko[sourceVersionGeckoIndex][1] + ' : ' + this.objInterfaces[interfaceName].methods[methodName].lineIdl + ' -> ' + stringIdlLineClean;
						}
					}
					this.objInterfaces[interfaceName].methods[methodName].lineIdl = stringIdlLineClean;
					this.objInterfaces[interfaceName].methods[methodName].versionLast = sourceVersionGeckoIndex;
					this.objInterfaces[interfaceName].methods[methodName].comment = stringComment;
					stringComment = '';
				}
			}
		}
		this.objInterfaces[interfaceName].constantOrder = arrayConstantOrder;
	},

	// Create the MDC document from an Interface Object
	createInterfaceMDC: function(objInterface, sourceVersionGecko)
	{
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
		var arrayAttributes =  this.processObject(objInterface.attributes, objInterface, sourceVersionGecko);

		// Sort Attributes array
		arrayAttributes.sort(compareFunc);

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
				if (arrayConstants == objConstant.nameText)
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
		var arrayAddCode = ['null', objInterface.interfaceName];
		arrayAddCode = arrayAddCode.concat(arrayAttributes);
		arrayAddCode = arrayAddCode.concat(arrayConstants);
		regAddCode = new RegExp('\\b(' + arrayAddCode.join('|') + ')\\b', 'gi');

		// Create a regular expression for adding method templates
		var regAddMethod = null;
		if (arrayMethods.length>0)
		{
			regAddMethod = new RegExp('\\b(' + arrayMethods.join('|') + ')\\b', 'gi');
		}

		var stringMDC = '';

		// Add header to MDC string
		stringMDC += '<h1>' + objInterface.interfaceName + '</h1>\n';

		// Add technical review template (Can be removed by author)
		stringMDC += '{{NeedsTechnicalReview()}}\n';

		// If this is a new interface
		if (objInterface.versionFirst != 0)
		{
		stringMDC += '{{Gecko_minversion_header("' + sourceVersionGecko[objInterface.versionFirst][1] + '")}}';
		}

		// If this is an obsolete interface
		if (objInterface.versionLast != sourceVersionGecko.length -1)
		{
		stringMDC += '{{obsolete_header("' + sourceVersionGecko[objInterface.versionLast + 1][1] + '")}}';
		}

		// If the interface has a comment then use it
		if (objInterface.comment !== '')
		{
			// Get the status from the comment
			if (objInterface.comment.match(/\*\s*@status\s+\S/i) !== null)
			{
				objInterface.status = objInterface.comment.match(/\*\s*@status\s+(\S*)/i)[1].toLowerCase(); // I prefer lower case
			}

			var stringInterfaceCommentPretty = this.tidyComment(objInterface.comment, false, null, regInterface, regAddCode, regAddMethod);

			if (stringInterfaceCommentPretty !== '')
			{
				stringMDC += stringInterfaceCommentPretty;
			}
		}

		// Add iterface status to MDC string
		stringMDC += '<p>{{InterfaceStatus("' + objInterface.interfaceName + '", "' + objInterface.path + '", "' + objInterface.status + '", "Mozilla ' + sourceVersionGecko[objInterface.versionLastChanged][1] + '", "' + (objInterface.scriptable == true ? 'yes' : 'no') + '")}}</p>\n';

		// Add iterface inherits to MDC string
		stringMDC += '<p>Inherits from: {{Interface("' + objInterface.inherits + '")}}</p>\n';

		// Add iterface implemented to MDC string
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
		stringMDC += '<p>Implemented by: \<code\>?????????????????????????????????????\</code\>. To create an instance, use:</p>\n';
		stringMDC += '<pre class="eval">\n';
		stringMDC += 'var ' + interfaceNameShort + ' = Components.classes["@mozilla.org/????????????????????????????"]\n';
		stringMDC += (new Array(8 + interfaceNameShort.length)).join(' ') + '.createInstance(Components.interfaces.' + objInterface.interfaceName + ');\n';
		stringMDC += '</pre>\n';

		// Create Method overview table
		if (arrayMethods.length > 0)
		{
			stringMDC += '<h2 name="Method_overview">Method overview</h2>\n';
			stringMDC += '<table class="standard-table">\n';
			stringMDC += '<tbody>\n';
			for (var i=0; i<arrayMethods.length; i++)
			{
				var stringMethodLink = '<a href="#' + arrayMethods[i] + '()">' + arrayMethods[i] + '</a>';
				stringMDC += '<tr>\n';
				stringMDC += '<td>';
				stringMDC += '<code>' + objInterface.methods[arrayMethods[i]].lineIdl.replace(/\S+(?=\()/, stringMethodLink).replace(/\s+$/, '') + '</code>';
				stringMDC += objInterface.methods[arrayMethods[i]].noscriptText;
				stringMDC += objInterface.methods[arrayMethods[i]].minversionText;
				stringMDC += objInterface.methods[arrayMethods[i]].obsoleteText;
				stringMDC += '</td>\n';
				stringMDC += '</tr>\n';
			}
			stringMDC += '</tbody>\n';
			stringMDC += '</table>\n';
		}

		// Create Attributes table
		if (arrayAttributes.length > 0)
		{
			stringMDC += '<h2 name="Attributes">Attributes</h2>\n';
			stringMDC += '<table class="standard-table">\n';
			stringMDC += '<tbody>\n';
			stringMDC += '<tr>\n';
			stringMDC += '<td class="header">Attribute</td>\n';
			stringMDC += '<td class="header">Type</td>\n';
			stringMDC += '<td class="header">Description</td>\n';
			stringMDC += '</tr>\n';

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
					stringAttributePrefix = stringAttributePrefixRaw[0].replace(/(^\s+|\s+$)/g, '').replace(/\s*readonly/i, ' <strong>Read only.</strong>');
				}

				stringMDC += '<tr>\n';
				stringMDC += '<td><code>' + objInterface.attributes[arrayAttributes[i]].nameText + '</code></td>\n';
				stringMDC += '<td><code>' + stringAttributeTypeLink + '</code></td>\n';
				stringMDC += '<td>'
				stringMDC += stringAttributeCommentPretty;
				stringMDC += stringAttributePrefix
				stringMDC += objInterface.attributes[arrayAttributes[i]].noscriptText;
				stringMDC += objInterface.attributes[arrayAttributes[i]].minversionText;
				stringMDC += objInterface.attributes[arrayAttributes[i]].obsoleteText;

				// Show exceptions
				if (objInterface.attributes[arrayAttributes[i]].exceptions)
				{
					stringMDC += '<h6 name="Exceptions_thrown">Exceptions thrown</h6>\n';
					stringMDC += '<dl>\n';
					for each (var objException in objInterface.attributes[arrayAttributes[i]].exceptions)
					{
						stringMDC += '<dt><code>' + objException.nameText + '</code></dt>\n';
						stringMDC += '<dd>' + objException.description + '</dd>\n';
					}
					stringMDC += '</dl>\n';
				}

				stringMDC += '</td>\n';
				stringMDC += '</tr>\n';
			}
			stringMDC += '</tbody>\n';
			stringMDC += '</table>\n';
		}

		// Create Constants table
		if (arrayConstants.length > 0)
		{
			stringMDC += '<h2 name="Constants">Constants</h2>\n';
			stringMDC += '<table class="standard-table">\n';
			stringMDC += '<tbody>\n';
			if (objInterface.constantsChanged == false)
			{
				stringMDC += '<tr>\n';
				stringMDC += '<td class="header">Constant</td>\n';
				stringMDC += '<td class="header">Value</td>\n';
				stringMDC += '<td class="header">Description</td>\n';
				stringMDC += '</tr>\n';
			}
			else
			{
				stringMDC += '<tr>\n';
				stringMDC += '<td class="header" rowspan="2">Constant</td>\n';
				stringMDC += '<td class="header" colspan="' + (objInterface.versionLast - objInterface.versionFirst + 1) + '">Gecko version</td>\n';
				stringMDC += '<td class="header" rowspan="2">Description</td>\n';
				stringMDC += '</tr>\n';
				stringMDC += '<tr>\n';
				for (var j=objInterface.versionFirst; j<=objInterface.versionLast; j++)
				{
					stringMDC += '<td class="header">' + sourceVersionGecko[j][1] + '</td>\n';
				}
				stringMDC += '</tr>\n';
			}
			for (var i=0; i<arrayConstants.length; i++)
			{
				// If the constant has a comment
				var stringConstantCommentPretty = '';
				if (objInterface.constants[arrayConstants[i]].comment !== '')
				{
					stringConstantCommentPretty = this.tidyComment(objInterface.constants[arrayConstants[i]].comment, true, null, regInterface, regAddCode, regAddMethod);
				}

				stringMDC += '<tr>\n';
				stringMDC += '<td><code>' + objInterface.constants[arrayConstants[i]].nameText + '</code></td>\n';

				if (objInterface.constantsChanged == false)
				{
					stringMDC += '<td><code>' + objInterface.constants[arrayConstants[i]].valuePrevious + '</code></td>\n';
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
								stringMDC += '<td colspan="' + colCount + '"><code>';
							}
							else
							{
								stringMDC += '<td><code>';
							}
							stringMDC += objInterface.constants[arrayConstants[i]].values[j];
							stringMDC += '</code></td>\n';
							colCount = 1;
						}
					}
				}
				stringMDC += '<td>' + stringConstantCommentPretty + '</td>\n';
				stringMDC += '</tr>\n';
			}
			stringMDC += '</tbody>\n';
			stringMDC += '</table>\n';
		}

		// Create Methods
		if (arrayMethods.length > 0)
		{
			stringMDC += '<h2 name="Methods">Methods</h2>\n';
			for (var i=0; i<arrayMethods.length; i++)
			{
				// Blank regular expression
				var regAddCodeExtra = null;

				// Get parameters from idl line
				var stringMethodParameters = objInterface.methods[arrayMethods[i]].lineIdl.match(/(?:[^\(]*\()(.*)(?:\))/)[1];
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
					// Create a regular expression for adding code tags to parameters in comments
					regAddCodeExtra = new RegExp('\\b(' + arrayMethodParameters.join('|') + ')\\b', 'gi');
				}

				// If the method has a comment
				var stringMethodCommentPretty = '';
				if (objInterface.methods[arrayMethods[i]].comment !== '')
				{
					stringMethodCommentPretty = this.tidyComment(objInterface.methods[arrayMethods[i]].comment, false, objInterface.methods[arrayMethods[i]], regInterface, regAddCode, regAddMethod, regAddCodeExtra);
				}

				// I have decided that this is the most logical order
				if (objInterface.methods[arrayMethods[i]].noscriptText !== '') // Noscript
				{
					stringMDC += '<p>{{method_noscript("' + objInterface.methods[arrayMethods[i]].nameText + '")}}</p>\n';
					if (objInterface.methods[arrayMethods[i]].minversionText !== '')
					{
						stringMDC += '<p>{{gecko_minversion_header("' + sourceVersionGecko[objInterface.methods[arrayMethods[i]].versionFirst][1] + '")}}</p>\n'
					}
					if (objInterface.methods[arrayMethods[i]].obsoleteText !== '')
					{
						stringMDC += '<p>{{obsolete_header("' + sourceVersionGecko[objInterface.methods[arrayMethods[i]].versionLast + 1][1] + '")}}</p>\n'
					}
				}
				else if (objInterface.methods[arrayMethods[i]].minversionText !== '') // Minversion
				{
					stringMDC += '<p>{{method_gecko_minversion("' + objInterface.methods[arrayMethods[i]].nameText + '","' + sourceVersionGecko[objInterface.methods[arrayMethods[i]].versionFirst][1] + '")}}</p>\n';
					if (objInterface.methods[arrayMethods[i]].obsoleteText !== '')
					{
						stringMDC += '<p>{{obsolete_header("' + sourceVersionGecko[objInterface.methods[arrayMethods[i]].versionLast + 1][1] + '")}}</p>\n'
					}
				}
				else if (objInterface.methods[arrayMethods[i]].obsoleteText !== '') // Obsolete
				{
					stringMDC += '<p>{{method_obsolete_gecko("' + objInterface.methods[arrayMethods[i]].nameText + '","' + sourceVersionGecko[objInterface.methods[arrayMethods[i]].versionLast + 1][1] + '")}}</p>\n';
				}
				else // Clean
				{
					stringMDC += '<h3 name="' + objInterface.methods[arrayMethods[i]].nameText + '()">' + objInterface.methods[arrayMethods[i]].nameText + '()</h3>\n'
				}

				stringMDC += stringMethodCommentPretty;

				// Show syntax
				stringMDC += '<pre class="eval">\n';
				stringMDC += objInterface.methods[arrayMethods[i]].lineIdl.match(/[^\(]*\(/);
				if (arrayMethodParameters.length > 0)
				{
					for (var iParameters=0; iParameters<arrayMethodParameters.length; iParameters++)
					{
						if (iParameters > 0)
						{
							stringMDC += ',';
						}
						stringMDC += '\n  ' + arrayMethodParameters[iParameters].replace(/^\s+/, '');
					}
					stringMDC += '\n);\n';
				}
				else
				{
					stringMDC += ');\n';
				}
				stringMDC += '</pre>\n';

				// Show parameters
				stringMDC += '<h6 name="Parameters">Parameters</h6>\n';
				if (arrayMethodParameters.length > 0)
				{
					stringMDC += '<dl>\n';
					for (var iParameters=0; iParameters<arrayMethodParameters.length; iParameters++)
					{
						var stringParameterName = arrayMethodParameters[iParameters].match(/\S*$/)[0];
						var stringParameterNameLower = stringParameterName.toLowerCase();

						stringMDC += '<dt><code>' + stringParameterName + '</code></dt>\n';
						stringMDC += '<dd>';

						// If there a description for this parameter then use it
						if(objInterface.methods[arrayMethods[i]].parameters && objInterface.methods[arrayMethods[i]].parameters[stringParameterNameLower])
						{
							stringMDC += objInterface.methods[arrayMethods[i]].parameters[stringParameterNameLower].description;
						}
						else
						{
							stringMDC += 'Missing Description';
						}
						stringMDC += '</dd>\n';
					}
					stringMDC += '</dl>\n';
				}
				else
				{
					stringMDC += '<p>None.</p>\n';
				}

				// Show returns
				if (objInterface.methods[arrayMethods[i]].lineIdl.match(/^void\s+/i) === null)
				{
					stringMDC += '<h6 name="Return_value">Return value</h6>\n';
					// If there is a return (not void)
					stringMDC += '<p>';
					if (objInterface.methods[arrayMethods[i]].returns)
					{
						stringMDC += objInterface.methods[arrayMethods[i]].returns.description;
					}
					else
					{
						stringMDC += 'Missing Description'
					}
					stringMDC += '</p>\n';
				}

				// Show exceptions
				stringMDC += '<h6 name="Exceptions_thrown">Exceptions thrown</h6>\n';
				stringMDC += '<dl>';
				if (objInterface.methods[arrayMethods[i]].exceptions)
				{
					for each (var objException in objInterface.methods[arrayMethods[i]].exceptions)
					{
						stringMDC += '<dt><code>' + objException.nameText + '</code></dt>\n';
						stringMDC += '<dd>' + objException.description + '</dd>\n';
					}
				}
				else
				{
					stringMDC += '<dt><code>Missing Exception</code></dt>\n';
					stringMDC += '<dd>Missing Description</dd>\n';
				}
				stringMDC += '</dl>\n';
			}
		}

		stringMDC += '<h2 name="Remarks">Remarks</h2>\n';
		stringMDC += '<p>&nbsp;</p>\n';

		stringMDC += '<h2 name="See_also">See also</h2>\n';
		stringMDC += '<p>&nbsp;</p>\n';

		return stringMDC;
	},

/***********************************************************
* IDL Manipulation to MDC - From single source
***********************************************************/

	generateMDC: function(sourceStringIdl)
	{
		// Create dummy variables
		var dummyVersionGecko = [['', 'manual']];
		var dummyMXRPath = '||Unknown||';

		// Reset the Interfaces object
		this.objInterfaces = {};

		// Reset the Warnings array
		this.arrayWarnings =[];

		var stringIdlClean = this.cleanupIdl(sourceStringIdl);
		this.updateInterfaces(stringIdlClean, dummyMXRPath, dummyVersionGecko, 0);

		// Remove existing tabs
		this.removeInterfaceEditorTabs();

		// Create Interface MDC and add to tabs
		for each (var objInterface in this.objInterfaces)
		{
			// Generate string
			var stringMDC = this.createInterfaceMDC(objInterface, dummyVersionGecko);

			// Add Interface to tabs
			this.addInterfaceEditorTab(objInterface.interfaceName, stringMDC);
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
this.jsdump(stringStripC);
		// Strip leading spaces
		var stringStripD = stringStripC.replace(/^\s*/gm, '');

		// Strip newlines after commas in methods
		var stringStripE = stringStripD.replace(/(^(?!\*).*,)\n(?!\*)/gm, '$1 ');

		// Join following comments
		var stringJoinA = stringStripE.replace(/^\*\/\n\/\**/gm, '*');

		// Switch 'o' style lists to '-' style
		var stringSwitchA = stringJoinA.replace(/(^\*\s*)o(?=\s)/gm, '$1-');

		// Purge multiple blank comment lines, trailing blank comment lines, and blank comment lines before @ lines
		var stringPurgeA = stringSwitchA.replace(/\*\n(?=\*(\n|\/|\s*@))/g, '')

		return stringPurgeA;

	},

	// Pretty format comment, optional also add @param/@throws to object
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
					// Remove {{ and }} before adding note to allow nested templates
					arrayParagraph[i] = arrayParagraph[i].replace(/{{|}}/g, '');
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
						// Get @ type and remove from paragraph
						var atType = arrayParagraph[i].match(/@\S+(?=\s)/)[0].toLowerCase();
						arrayParagraph[i] = arrayParagraph[i].replace(/@\S+\s+/, '');
						if (atType === '@param' || atType === '@throws')
						{
							// Get @ name and remove from paragraph
							var atName = arrayParagraph[i].match(/\S+(?=\s)/)[0];
							var atNameLower = atName.toLowerCase();
							arrayParagraph[i] = arrayParagraph[i].replace(/\S+\s+/, '');
						}
						// Strip any leading -
						arrayParagraph[i] = arrayParagraph[i].replace(/^-\s*(?=\S)/, '');

						if (atType === '@param') // Parameter
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

							// Strip leading in/out from description
							arrayParagraph[i] = arrayParagraph[i].replace(/^(?:in|out|\[(?:in|out)\])\s*(?:-\s*)*/i, '');

							objGeneric.parameters[atNameLower].nameText = atName;
							objGeneric.parameters[atNameLower].description = this.firstCaps(arrayParagraph[i]);
						}
						else if (atType === '@throws') // Exception
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

/***********************************************************
* Functions to read files
***********************************************************/

	// Read a local file
	// returnType - xml or text
	readLocalFile: function(objectFile, returnType)
	{
		if (objectFile.exists() && objectFile.isFile())
		{
			var xmlPath = 'file://' + objectFile.path;
			var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
			req.open("GET", xmlPath, false); 
			req.send(null);
			if (req.status == 0)
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
				this.debugTrace('readLocalFile', 900, 'status ' + req.status + ' file ' + objectFile.path);
			}
		}
	},

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
/*			else if  (returnType == 'html')
			{
				// If it is properly formed xml then use that
				if (req.responseXML !== null)
				{
					return req.responseXML;
				}
				else
				{
					responseHTML = Components.classes["@mozilla.org/xml/xml-document;1"].createInstance(Components.interfaces.nsIDOMDocument);
					var nsIScriptableUnescapeHTML = Components.classes["@mozilla.org/feed-unescapehtml;1"].getService(Components.interfaces.nsIScriptableUnescapeHTML);
					unicodeResponseText = nsIScriptableUnescapeHTML.unescape(req.responseText);
					responseHTML.appendChild(nsIScriptableUnescapeHTML.parseFragment(unicodeResponseText, false, '', responseHTML.documentElement));
					return responseHTML;
				}
			}
*/
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
		try {this.debugLevel = this.prefMdci.getIntPref("debugLevel");}catch (err) {}

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
			this.nsIConsoleService.logStringMessage('MDCI' + stringCaller + ' ' + traceDomain + '[' + traceLevel + '] ' + stringMessage);
		}
	}

};
