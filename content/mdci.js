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
/*
	versionGecko: [
		['mozilla1.7', '1.7'],
		['mozilla1.8', '1.8'],
		['mozilla1.8.0', '1.8.0'],
		['mozilla1.9.1', '1.9.1'],
		['mozilla1.9.2', '1.9.2'],
		['mozilla-central', '1.9.3'],
	],
*/

	// Testing list
	versionGecko: [
		['mozilla1.7', '1.7'],
		['mozilla-central', '1.9.3'],
	],

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
			this.generateMDC();
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
		this.arrayWarnings =[];

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

	updateInterfaces: function(cleanIdl, pathIdl, sourceVersionGeko, sourceVersionGekoIndex)
	{
		var arrayConstantOrder = [];
		var countConstantOrder = 0;

		// Split IDL into lines for processing
this.jsdump(cleanIdl);
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
					this.objInterfaces[interfaceName].versionFirst = sourceVersionGekoIndex;
				}
				this.objInterfaces[interfaceName].path = pathIdl;
				this.objInterfaces[interfaceName].scriptable = interfaceScriptable;
				this.objInterfaces[interfaceName].inherits = interfaceInherits;
				this.objInterfaces[interfaceName].versionLast = sourceVersionGekoIndex;
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
					this.arrayWarnings[this.countWarnings++] = sourceVersionGeko[sourceVersionGekoIndex][1] + ' Comment at end of Interface(' + interfaceName + '): ' + stringComment;
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
					if (!this.objInterfaces[interfaceName].attributes[attributeName])
					{
						this.objInterfaces[interfaceName].attributes[attributeName] = {};
						this.objInterfaces[interfaceName].attributes[attributeName].attributeName = attributeName;
						this.objInterfaces[interfaceName].attributes[attributeName].versionFirst = sourceVersionGekoIndex;
					}
					else
					{
						// If the line 'signature' changed log a warning
						if (this.objInterfaces[interfaceName].attributes[attributeName].lineIdl != stringIdlLineClean)
						{
							this.arrayWarnings[this.countWarnings++] = sourceVersionGeko[this.objInterfaces[interfaceName].attributes[attributeName].versionLast][1] + ' -> ' + sourceVersionGeko[sourceVersionGekoIndex][1] + ' : ' + this.objInterfaces[interfaceName].attributes[attributeName].lineIdl + ' -> ' + stringIdlLineClean;
						}
					}
					this.objInterfaces[interfaceName].attributes[attributeName].lineIdl = stringIdlLineClean;
					this.objInterfaces[interfaceName].attributes[attributeName].versionLast = sourceVersionGekoIndex;
					this.objInterfaces[interfaceName].attributes[attributeName].comment = stringComment;
					stringComment = '';
				}
				else if (stringIdlLineClean.match(/^CONST\s/i) !== null) // Found a constant
				{
					var constantName = stringIdlLineClean.match(/\S+(?=;)/)[0];
					var constantValue = stringIdlLineClean.match(/[^\=]+(?=\s*;$)/)[0].replace(/^\s+/, '');
					// Add to constant order
					arrayConstantOrder[countConstantOrder++] = constantName;

					if (!this.objInterfaces[interfaceName].constants[constantName])
					{
						this.objInterfaces[interfaceName].constants[constantName] = {};
						this.objInterfaces[interfaceName].constants[constantName].constantName = constantName;
						this.objInterfaces[interfaceName].constants[constantName].versionFirst = sourceVersionGekoIndex;
						this.objInterfaces[interfaceName].constants[constantName].values = [];
					}
					else
					{
						// If the line 'signature' changed log a warning
						if (this.objInterfaces[interfaceName].constants[constantName].lineIdl != stringIdlLineClean)
						{
							this.arrayWarnings[this.countWarnings++] = sourceVersionGeko[this.objInterfaces[interfaceName].constants[constantName].versionLast][1] + ' -> ' + sourceVersionGeko[sourceVersionGekoIndex][1] + ' : ' + this.objInterfaces[interfaceName].constants[constantName].lineIdl + ' -> ' + stringIdlLineClean;
						}
						// If the value of the constant changed then let the iterface know so we can create a different constants table
						// (Why, oh why do we have to do this. Should not a constant be, CONSTANT!!!)
						if (this.objInterfaces[interfaceName].constants[constantName].valuePrevious != constantValue)
						{
							this.objInterfaces[interfaceName].constantsChanged = true;
						}
					}
					this.objInterfaces[interfaceName].constants[constantName].lineIdl = stringIdlLineClean;
					this.objInterfaces[interfaceName].constants[constantName].versionLast = sourceVersionGekoIndex;
					this.objInterfaces[interfaceName].constants[constantName].comment = stringComment;
					this.objInterfaces[interfaceName].constants[constantName].values[sourceVersionGekoIndex] = constantValue;
					this.objInterfaces[interfaceName].constants[constantName].valuePrevious = constantValue;
					stringComment = '';
				}
				else // Found a method (Should be nothing else left)
				{
					var methodName = stringIdlLineClean.match(/\S+(?=\()/)[0];
					if (!this.objInterfaces[interfaceName].methods[methodName])
					{
						this.objInterfaces[interfaceName].methods[methodName] = {};
						this.objInterfaces[interfaceName].methods[methodName].methodName = methodName;
						this.objInterfaces[interfaceName].methods[methodName].versionFirst = sourceVersionGekoIndex;
					}
					else
					{
						// If the line 'signature' changed log a warning
						if (this.objInterfaces[interfaceName].methods[methodName].lineIdl != stringIdlLineClean)
						{
							this.arrayWarnings[this.countWarnings++] = sourceVersionGeko[this.objInterfaces[interfaceName].methods[methodName].versionLast][1] + ' -> ' + sourceVersionGeko[sourceVersionGekoIndex][1] + ' : ' + this.objInterfaces[interfaceName].methods[methodName].lineIdl + ' -> ' + stringIdlLineClean;
						}
					}
					this.objInterfaces[interfaceName].methods[methodName].lineIdl = stringIdlLineClean;
					this.objInterfaces[interfaceName].methods[methodName].versionLast = sourceVersionGekoIndex;
					this.objInterfaces[interfaceName].methods[methodName].comment = stringComment;
					stringComment = '';
				}
			}
		}
	},

	// Create the MDC document from an Interface Object
	createInterfaceMDC: function(objInterface, sourceVersionGeko)
	{
		// Set status to default
		objInterface.status = 'unfrozen';

		// Get the 'short' name of the interface (useful for a number of things)
		var interfaceNameShort = objInterface.interfaceName.replace(/^nsI/, '');

		// Regular expression used to create links to interfaces
		var notThisInterface = new RegExp('\\bnsI(?!' + interfaceNameShort + ')\\w*', 'i');

		// Create array of Methods and sort
		var arrayMethods = [];
		for (var objMethod in objInterface.methods)
		{
			arrayMethods.push(objMethod.methodName);
//			arrayMethods[arrayMethods.length] = objMethod.methodName;
		}
		arrayMethods.sort();
		// Create array of Attributes and sort
		var arrayAttributes = [];
		for (var objAttribute in objInterface.attributes)
		{
			arrayAttributes[arrayAttributes.length] = objAttribute.attributeName;
		}
		arrayAttributes.sort();
		// Create array of Constants and DO NOT SORT!!
		var arrayConstants = [];
		for (var objConstant in objInterface.constants)
		{
			arrayConstants[arrayConstants.length] = objConstant.constantName;
		}

// TODO: Code to find the last changed version
// TODO: Sort methods, attributes
// TODO: Remember to create links to methods etc in comments

		var stringMDC = '';

		// Add header to MDC string
		stringMDC += '<h1>' + objInterface.interfaceName + '</h1>\n';

		// Add technical review template (Can be removed by author)
		stringMDC += '{{NeedsTechnicalReview()}}\n';

		// If the interface has a comment then use it
		if (objInterface.comment !== '')
		{
			// Get the status from the comment
			if (objInterface.comment.match(/\*\s*@status\s+\S/i) !== null)
			{
				objInterface.status = objInterface.comment.match(/\*\s*@status\s+(\S*)/i)[1].toLowerCase(); // I prefer lower case
			}

			var stringInterfaceCommentPretty = this.tidyComment(objInterface.comment, false);

			if (stringInterfaceCommentPretty !== '')
			{
				stringMDC += stringInterfaceCommentPretty;
			}
		}

		// Add iterface status to MDC string
		stringMDC += '<p>{{InterfaceStatus("' + objInterface.interfaceName + '", "' + objInterface.path + '", "' + objInterface.status + '", "Mozilla 1.x", "' + objInterface.scriptable + '")}}</p>\n';

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
		stringMDC += (new Array(18 + interfaceNameShort.length)).join(' ') + '.createInstance(Components.interfaces.' + objInterface.interfaceName + ');\n';
		stringMDC += '</pre>\n';

// TODO: actual code to do this here.

		return stringMDC;
	},

/***********************************************************
* Old IDL Manipulation to MDC
***********************************************************/

	XXXgenerateMDC: function()
	{

		this.removeInterfaceEditorTabs();

		// Reference the tabs
		var tabsInterfaceEditor = document.getElementById("tabsInterfaceEditor");

		// Reference the tabpanels
		var tabpanelsInterfaceEditor = document.getElementById("tabpanelsInterfaceEditor");

		// Get the source
		var stringSource = document.getElementById("sourceText").value;

		// Clean up the source
		var stringClean = this.cleanupIdl(stringSource);

		var interfaceStatus = 'unfrozen';

		// Get global doxygen comment
		var stringGlobalLines = stringClean.match(/.*\n/g);
		var stringGlobalComment = '';
		var inCommentDoxygen = false;
		var inInterface = false;
		for (var i=0; i<stringGlobalLines.length; i++)
		{
			if (stringGlobalLines[i].match(/^\s*\{/) !== null)
			{
				inInterface = true;
				inCommentDoxygen = false;
			}
			else if (stringGlobalLines[i].match(/^\s*\}/) !== null)
			{
				inInterface = false;
			}
			else if (!inInterface && stringGlobalLines[i].match(/^\s*\/\*{2,2}/) !== null)
			{
				inCommentDoxygen = true;
			}
			else if (!inInterface && stringGlobalLines[i].match(/^\s*\*\//) !== null)
			{
				inCommentDoxygen = false;
				stringGlobalComment += '* \n'; // Tack on an extra line in case there are multiple blocks
			}
			else if (inCommentDoxygen && !inInterface)
			{
				stringGlobalComment += stringGlobalLines[i];
			}
		}

		var stringGlobalCommentParaPretty = '';
		if (stringGlobalComment !== '')
		{

			// Turn global doxygen comment into paragraphs
			var stringGlobalCommentPara = this.getParagraphs(stringGlobalCommentContent);

			// Create pretty paragraphs
			for (var iGlobalPara=1; iGlobalPara<stringGlobalCommentPara.length; iGlobalPara++)
			{
				if (stringGlobalCommentPara[iGlobalPara].match(/\*\s+@(?!note)/) === null) // Ignore @ paragraphs except @note
				{
					stringGlobalCommentParaPretty += this.prettyParagraph(stringGlobalCommentPara[iGlobalPara].replace(/^\s+/, ''));
				}
				else if (stringGlobalCommentPara[iGlobalPara].match(/\*\s+@status\s+FROZEN/) !== null) // Status is frozen
				{
					var interfaceStatus = 'frozen';
				}
				else if (stringGlobalCommentPara[iGlobalPara].match(/\*\s+@status\s+UNDER_REVIEW/) !== null) // Status is under review
				{
					var interfaceStatus = 'UNDER_REVIEW';
				}
			}
		}

		// Isolate the interfaces
		var stringInterfaces = stringClean.match(/\[[^\]]*uuid[^\]]*\]\s*interface[^}]*};/gi);

		// Display the results
		for (var iInterfaces=0; iInterfaces<stringInterfaces.length; iInterfaces++)
		{
			var stringMDC = '';
			var stringMDCConstants = '';

			var arrayMDCAttributesIndex = [];
			var integerMDCAttributesIndexCount = 0;
			var arrayMDCAttributes = [];

			var arrayMDCMethodIndex = [];
			var integerMDCMethodIndexCount = 0;
			var arrayMDCMethodOverview = [];
			var arrayMDCMethods = [];

			var interfaceScriptable = stringInterfaces[iInterfaces].match(/(?:un)?scriptable/i) == 'scriptable' ? 'yes' : 'no';
			var interfaceName = stringInterfaces[iInterfaces].match(/(?:interface\s)(\S*)/i)[1];
			var interfaceInherits = stringInterfaces[iInterfaces].match(/(?:interface\s\S*\s+:\s)(\S*)/i)[1];

			// Add header to MDC string
			stringMDC += '<h1>' + interfaceName + '</h1>\n';

			// Add technical review template (Can be removed my author)
			stringMDC += '{{NeedsTechnicalReview()}}\n';

			if (stringGlobalCommentParaPretty !== '')
			{
				stringMDC += stringGlobalCommentParaPretty;
			}

			// Add iterface status to MDC string
			stringMDC += '<p>{{InterfaceStatus("' + interfaceName + '", "?????????????????.idl", "' + interfaceStatus + '", "Mozilla 1.x", "' + interfaceScriptable + '")}}\n</p>';

			// Add iterface inherits to MDC string
			stringMDC += '<p>Inherits from: {{Interface("' + interfaceInherits + '")}}</p>\n';

			// Add iterface implemented to MDC string
			var interfaceNameShort = interfaceName.replace(/^nsI/, '');
			var interfaceNameShortFirst = interfaceNameShort.match(/^./)[0].toLowerCase();
			interfaceNameShort = interfaceNameShort.replace(/^./, interfaceNameShortFirst);
			stringMDC += '<p>Implemented by: \<code\>?????????????????????????????????????\</code\>. To create an instance, use:</p>\n';
			stringMDC += '<pre class="eval">\n';
			stringMDC += 'var ' + interfaceNameShort + ' = Components.classes["@mozilla.org/????????????????????????????"]\n';
			stringMDC += (new Array(18 + interfaceNameShort.length)).join(' ') + '.createInstance(Components.interfaces.' + interfaceName + ');\n';
			stringMDC += '</pre>\n';

			// Get Interface content
			var stringInterfaceContent = stringInterfaces[iInterfaces].match(/(?:{)([^}]*)/)[1];

			// Get clean Interface content
			var stringInterfaceContentClean = this.cleanContent(stringInterfaceContent);

			// Create Interface Content Sections (Methods, Attributes, Constants and their detail)
			var stringInterfaceContentLine = stringInterfaceContentClean.match(/.*\n/g);
			var stringInterfaceContentSection = [];
			var interfaceSectionCount = -1;
			var inDoxygenComment = false;
			var hasDescription = false;
			for (var iLine=0; iLine<stringInterfaceContentLine.length; iLine++)
			{
				if (!inDoxygenComment && stringInterfaceContentLine[iLine].match(/\s*\/\*{2,2}/) !== null) // Start of new comment
				{
					interfaceSectionCount++;
					stringInterfaceContentSection[interfaceSectionCount] = '';
					inDoxygenComment = true;
				}
				else if (stringInterfaceContentLine[iLine].match(/\s*\*\//) !== null) // End of comment
				{
					inDoxygenComment = false;
					hasDescription = true;
				}
				else
				{
					if (!hasDescription && !inDoxygenComment)
					{
						interfaceSectionCount++;
						stringInterfaceContentSection[interfaceSectionCount] = '* Missing description\n';
					}
					stringInterfaceContentSection[interfaceSectionCount] += stringInterfaceContentLine[iLine];
					hasDescription = false;
				}
			}

			// Get the content paragraphs
			for (var iSection=0; iSection<stringInterfaceContentSection.length; iSection++)
			{
				var stringMDCAttributes = '';
				var stringMDCMethodOverview = '';
				var stringMDCMethods = '';
				var stringInterfaceContentSectionPara = this.getParagraphs(stringInterfaceContentSection[iSection]);

				// Create pretty paragraphs
				var stringInterfaceContentSectionParaPretty = '';
				for (var iSectionPara=1; iSectionPara<stringInterfaceContentSectionPara.length; iSectionPara++)
				{
					if (stringInterfaceContentSectionPara[iSectionPara].match(/\*\s@(?!note)/) === null) // Ignore @ paragraphs except @note
					{
						stringInterfaceContentSectionParaPretty += this.prettyParagraph(stringInterfaceContentSectionPara[iSectionPara].replace(/^\s+/, ''));
					}
				}

				// Add to attributes/constants/methods tables and content
				if (stringInterfaceContentSectionPara[0].match(/(?:^|\s+)attribute\s/) !== null) // Attribute
				{
					var stringAttributeName = stringInterfaceContentSectionPara[0].match(/\S+(?=;)/)[0];
					var stringAttributePrefixRaw = stringInterfaceContentSectionPara[0].match(/^.*(?=\s+attribute)/)
					var stringAttributePrefix = '';
					var stringAttributeNoscript = '';
					if (stringAttributePrefixRaw !== null)
					{
						if (stringAttributePrefixRaw[0].match(/\[noscript\]/i) !== null)
						{
							stringAttributeNoscript = ' {{noscript_inline()}}';
						}
						stringAttributePrefix = stringAttributePrefixRaw[0].replace(/\[noscript\]\s+/i, '').replace(/(^\s+|\s+$)/g, '').replace(/readonly/i, ' <strong>Read only.</strong>');
					}
					var stringAttributeType = stringInterfaceContentSectionPara[0].match(/(?:^|\s+)attribute\s+(.*)(?=\s+\S+\s*;)/)[1];
					var stringAttributeTypeLink = stringAttributeType;
					if (stringAttributeType.match(/(nsI\S+)(?=\b)/) !== null) // Is an nsI type
					{
						stringAttributeTypeLink = stringAttributeType.replace(/(nsI\S+)(?=\b)/, '{{Interface("$1")}}')
					}
					else // Is another type
					{
						stringAttributeTypeLink = '<a href="mks://localhost/en/' + stringAttributeType.replace(/\s+/g, '_') + '" title="en/' + stringAttributeType + '">' + stringAttributeType + '</a>';
					}
					// Strip the last 'p' tag from the description so the table does not get extra white space
					var stringAttributeDescription = stringInterfaceContentSectionParaPretty.replace(/<p>\s*(.*)<\/p>\n*$/, '$1');

					stringMDCAttributes += '<tr>\n';
					stringMDCAttributes += '<td><code>' + stringAttributeName + '</code></td>\n';
					stringMDCAttributes += '<td><code>';
					stringMDCAttributes += stringAttributeTypeLink + '</code></td>\n';
					stringMDCAttributes += '<td>' + stringAttributeDescription;
					stringMDCAttributes += stringAttributePrefix += stringAttributeNoscript;
					stringMDCAttributes += '</td>\n';
					stringMDCAttributes += '</tr>\n';

					arrayMDCAttributesIndex[integerMDCAttributesIndexCount++] = stringAttributeName.toLowerCase();
					arrayMDCAttributes[stringAttributeName.toLowerCase()] = stringMDCAttributes;
				}
				else if (stringInterfaceContentSectionPara[0].match(/^const/) !== null) // Constant
				{
					var stringConstantName = stringInterfaceContentSectionPara[0].match(/\S+(?=\s*\=)/);
					var stringConstantValue = stringInterfaceContentSectionPara[0].match(/[^\=]+(?=\s*;$)/)[0].replace(/^\s+/, '');
					// Strip the last 'p' tag fromt the description so the table does not get extra white space
					var stringConstantDescription = stringInterfaceContentSectionParaPretty.replace(/<p>\s*(.*)<\/p>\n*$/, '$1');

					stringMDCConstants += '<tr>\n';
					stringMDCConstants += '<td><code>' + stringConstantName + '</code></td>\n';
					stringMDCConstants += '<td><code>' + stringConstantValue + '</code></td>\n';
					stringMDCConstants += '<td>' + stringConstantDescription + '</td>\n';
					stringMDCConstants += '</tr>\n';
				}
				else // Method
				{
					var stringMethod = stringInterfaceContentSectionPara[0];
					var stringMethodNoscript = '';
					var hasNoscript = (stringMethod.match(/\[noscript\]/i) !== null);
					var stringMethodClean = stringMethod.replace(/\[noscript\]\s+/i, '');
					var stringMethodName = stringMethodClean.match(/\S+(?=\()/)[0];
					var stringMethodTitle = '<h3 name="' + stringMethodName + '.28.29">' + stringMethodName + '()</h3>\n';
					if (hasNoscript)
					{
						stringMethodNoscript = ' {{noscript_inline()}}';
						stringMethodTitle = '<p>{{method_noscript("' + stringMethodName + '")}}</p>\n';
					}
					var stringMethodLink = '<a href="#' + stringMethodName + '.28.29">' + stringMethodName + '</a>';
					stringMDCMethodOverview += '<tr>\n';
					stringMDCMethodOverview += '<td><code>' + stringMethodClean.replace(/\S+(?=\()/, stringMethodLink) + stringMethodNoscript +'</code></td>\n';
					stringMDCMethodOverview += '</tr>\n';

					// Parameters
					stringMDCMethods += stringMethodTitle;
					stringMDCMethods += stringInterfaceContentSectionParaPretty;
					stringMDCMethods += '<pre class="eval">\n';
					stringMDCMethods += ' ' + stringMethodClean.match(/[^\(]*\(/);


					var stringMethodCleanParameters = stringMethodClean.match(/(?:[^\(]*\()(.*)(?:\))/)[1];

					var stringMethodParameters = [];
					var countPatameters = 0;
					var levelBracket = 0;
					stringMethodParameters[0] = '';
					for (var iParametersChar=0; iParametersChar<stringMethodCleanParameters.length; iParametersChar++)
					{
						var currentChar = stringMethodCleanParameters.charAt(iParametersChar);
						if (currentChar == '[' || currentChar == '(')
						{
							stringMethodParameters[countPatameters] += currentChar;
							levelBracket++;
						}
						else if (currentChar == ']' || currentChar == ')')
						{
							stringMethodParameters[countPatameters] += currentChar;
							levelBracket--;
						}
						else if (currentChar == ',' && levelBracket == 0)
						{
							countPatameters++;
							stringMethodParameters[countPatameters] = '';
						}
						else
						{
							stringMethodParameters[countPatameters] += currentChar;
						}
					}

					var stringMDCMethodsParameters ='';
					if (stringMethodParameters[0] !== '')
					{
						for (var iSectionParameters=0; iSectionParameters<stringMethodParameters.length; iSectionParameters++)
						{
							if (iSectionParameters > 0)
							{
								stringMDCMethods += ',';
							}
							stringMDCMethods += '\n   ' + stringMethodParameters[iSectionParameters].replace(/^\s+/, '');
							var stringParameter = stringMethodParameters[iSectionParameters].match(/\S*$/)[0];
							stringMDCMethodsParameters += '<dt><code>' + stringParameter + '</code></dt>\n';
							stringMDCMethodsParameters += '<dd>';
							var stringParameterDetail = 'Missing Description';
							// Find the @param paragraph if it exists
							var stringParameterNoBracket = stringParameter.replace(/\s*\[[^\]]*\]\s*/g, '');
							var stringExpressionParameter = new RegExp('\\*\\s*@param\\s+' + stringParameterNoBracket + '\\s+', 'i');
							for (var iSectionPara=1; iSectionPara<stringInterfaceContentSectionPara.length; iSectionPara++)
							{
								if(stringInterfaceContentSectionPara[iSectionPara].match(stringExpressionParameter) !== null)
								{
									stringParameterDetail = this.prettyParagraph(stringInterfaceContentSectionPara[iSectionPara].replace(stringExpressionParameter, ''))
								}
							}
							stringMDCMethodsParameters += stringParameterDetail;
							stringMDCMethodsParameters += '</dd>\n';
						}
						stringMDCMethods += '\n );\n';
					}
					else
					{
						stringMDCMethods += ');\n';
					}
					stringMDCMethods += '</pre>\n';

					if (stringMDCMethodsParameters == '')
					{
						stringMDCMethodsParameters = '<p>None.</p>';
					}

					stringMDCMethods += '<h6 name="Parameters">Parameters</h6>\n';
					stringMDCMethods += '<dl>\n';
					stringMDCMethods += stringMDCMethodsParameters
					stringMDCMethods += '</dl>\n';

					// Returns
					var stringMDCMethodsReturns ='';
					// If there is a return (not void)
					if (stringInterfaceContentSectionPara[0].match(/(?:^|\s+)void\s+/i) === null)
					{
						var stringReturn = stringInterfaceContentSectionPara[0].match(/(?:\[[^\]]*\])*(.*)(?:\s+\S+\()/)[1];
						var stringReturnDetail = '<p>Missing Description</p>';
						for (var iSectionPara=1; iSectionPara<stringInterfaceContentSectionPara.length; iSectionPara++)
						{
							if(stringInterfaceContentSectionPara[iSectionPara].match(/\*\s*@returns?\s+/i) !== null)
							{
								var stringExpressionReturn = new RegExp('\\*\\s*@returns?\\s+(?:' + stringReturn + '\\s+)?', 'i');
								stringReturnDetail = this.prettyParagraph(stringInterfaceContentSectionPara[iSectionPara].replace(stringExpressionReturn, ''))
							}
						}
						stringMDCMethodsReturns += stringReturnDetail;

					}

					stringMDCMethods += '<h6 name="Return_value">Return value</h6>\n';
					if (stringMDCMethodsReturns !== '')
					{
						stringMDCMethods += stringMDCMethodsReturns + '\n';
					}
					else
					{
						stringMDCMethods += '<p>None.</p>\n';
					}

					// Exceptions
					var stringMDCMethodsExceptions ='';
					for (var iSectionPara=1; iSectionPara<stringInterfaceContentSectionPara.length; iSectionPara++)
					{
						if(stringInterfaceContentSectionPara[iSectionPara].match(/\*\s*@throws\s+/i) !== null)
						{
							var stringException = stringInterfaceContentSectionPara[iSectionPara].match(/\*\s*@throws\s+(\S+)/)[1];
							var stringExceptionDetail = this.prettyParagraph(stringInterfaceContentSectionPara[iSectionPara].replace(/\*\s*@throws\s+\S+\s+/i, ''))
							stringMDCMethodsExceptions += '<dt><code>' + stringException + '</code></dt>\n';
							stringMDCMethodsExceptions += '<dd>' + stringExceptionDetail + '</dd>\n';
						}
					}

					stringMDCMethods += '<h6 name="Exceptions_thrown">Exceptions thrown</h6>\n';
					stringMDCMethods += '<dl>';
					if (stringMDCMethodsExceptions !== '')
					{
						stringMDCMethods += stringMDCMethodsExceptions
					}
					else
					{
						stringMDCMethods += '<dt><code>Missing Exception</code></dt>\n';
						stringMDCMethods += '<dd>Missing Description</dd>\n';
					}
					stringMDCMethods += '</dl>\n';

					arrayMDCMethodIndex[integerMDCMethodIndexCount++] = stringMethodName.toLowerCase();
					arrayMDCMethodOverview[stringMethodName.toLowerCase()] = stringMDCMethodOverview;
					arrayMDCMethods[stringMethodName.toLowerCase()] = stringMDCMethods;
				}
/*
				for (var iBuild=0; iBuild<stringInterfaceContentSectionPara.length; iBuild++)
				{
					stringMDC += iSection + '-' + iBuild + ' ' + stringInterfaceContentSectionPara[iBuild] + '\n';
				}*/
			}

			if (arrayMDCMethodIndex.length > 0)
			{
				arrayMDCMethodIndex.sort();
				stringMDC += '<h2 name="Method_overview">Method overview</h2>\n';
				stringMDC += '<table class="standard-table">\n';
				stringMDC += '<tbody>\n';
				for (var i=0; i<arrayMDCMethodIndex.length; i++)
				{
					stringMDC += arrayMDCMethodOverview[arrayMDCMethodIndex[i]];
				}
				stringMDC += '</tbody>\n';
				stringMDC += '</table>\n';
			}

			if (arrayMDCAttributesIndex.length > 0)
			{
				arrayMDCAttributesIndex.sort();
				stringMDC += '<h2 name="Attributes">Attributes</h2>\n';
				stringMDC += '<table class="standard-table">\n';
				stringMDC += '<tbody>\n';
				stringMDC += '<tr>\n';
				stringMDC += '<td class="header">Attribute</td>\n';
				stringMDC += '<td class="header">Type</td>\n';
				stringMDC += '<td class="header">Description</td>\n';
				stringMDC += '</tr>\n';
				for (var i=0; i<arrayMDCAttributesIndex.length; i++)
				{
					stringMDC += arrayMDCAttributes[arrayMDCAttributesIndex[i]];
				}
				stringMDC += '</tbody>\n';
				stringMDC += '</table>\n';
			}

			if (stringMDCConstants !== '')
			{
				stringMDC += '<h2 name="Constants">Constants</h2>\n';
				stringMDC += '<table class="standard-table">\n';
				stringMDC += '<tbody>\n';
				stringMDC += '<tr>\n';
				stringMDC += '<td class="header">Constant</td>\n';
				stringMDC += '<td class="header">Value</td>\n';
				stringMDC += '<td class="header">Description</td>\n';
				stringMDC += '</tr>\n';
				stringMDC += stringMDCConstants;
				stringMDC += '</tbody>\n';
				stringMDC += '</table>\n';
			}

			if (arrayMDCMethodIndex.length > 0)
			{
				stringMDC += '<h2 name="Methods">Methods</h2>\n';
				for (var i=0; i<arrayMDCMethodIndex.length; i++)
				{
					stringMDC += arrayMDCMethods[arrayMDCMethodIndex[i]];
				}
			}

			stringMDC += '<h2 name="Remarks">Remarks</h2>\n';
			stringMDC += '<p>&nbsp;</p>\n';

			stringMDC += '<h2 name="See_also">See also</h2>\n';
			stringMDC += '<p>&nbsp;</p>\n';

			// Strip Interface template references to self
			var selfReference = new RegExp('\{\{Interface\\\(\"' + interfaceName + '\"\\\)\}\}', 'gi');
			var stringMDCOut = stringMDC.replace(selfReference, '<code>' + interfaceName + '</code>');

			// Create new tab
			var newTab = document.createElement('tab');
			newTab.setAttribute('label', interfaceName);
			tabsInterfaceEditor.appendChild(newTab);

			// Create new tabpanel
			var newTabpanel = document.createElement('tabpanel');
			newTabpanel.setAttribute('flex', '1');
			var newTextBox = document.createElement('textbox');
			newTextBox.setAttribute('newlines', 'pasteintact');
			newTextBox.setAttribute('multiline', 'true');
			newTextBox.setAttribute('wrap', 'off');
			newTextBox.setAttribute('flex', '1');
			newTextBox.setAttribute('spellcheck', 'true');
			newTabpanel.appendChild(newTextBox);
			tabpanelsInterfaceEditor.appendChild(newTabpanel);
			newTextBox.value = stringMDCOut;

		}
	},

	cleanContent: function(stringText)
	{
		var returnText = stringText;

		return returnText;
	},

	getParagraphs: function(stringText)
	{

		var stringTextPara = [];
		var stringTextLine = stringText.match(/.*\n/g);
		var integerTextParaCount = 0;
		var lastBullet = false;
		for (var iTextLine=0; iTextLine<stringTextLine.length; iTextLine++)
		{
			if (stringTextLine[iTextLine].match(/^\*\s*@/) !== null) // Found @ line
			{
				integerTextParaCount++;
				stringTextPara[integerTextParaCount] = stringTextLine[iTextLine].replace(/\n/, '');
				lastBullet = false;
			}
			else if (stringTextLine[iTextLine].match(/^\*\n/) !== null) // Found blank line
			{
				integerTextParaCount++;
				stringTextPara[integerTextParaCount] = '';
				lastBullet = false;
			}
			else if (stringTextLine[iTextLine].match(/^[^\*]+\n/) !== null) // Found object
			{
				stringTextPara[0] = stringTextLine[iTextLine].replace(/\n/, '').replace(/(?:\s*)(\(|\))(?:\s*)/g, '$1').replace(/\s+/g, ' '); // Remove new line, spaces around '(', ')', ',' and duplicate spaces
				lastBullet = false;
			}
			else if (integerTextParaCount == 0) // Is first line
			{
				integerTextParaCount++;
				stringTextPara[integerTextParaCount] = stringTextLine[iTextLine].replace(/\n/, '');
				lastBullet = false;
			}
			else if (stringTextLine[iTextLine].match(/^\*\s+(?:o\s|-#{0,1}\s|.[\n|$])/) !== null) // Found list
			{
				stringTextPara[integerTextParaCount] += '\n' + stringTextLine[iTextLine].replace(/\n/, '').replace(/(^\*\s*)o/, '$1-'); // Switch 'o' style to '-'
				lastBullet = true;
			}
			else
			{
				if (lastBullet)
				{
					if (stringTextLine[iTextLine].match(/^\*\s{5,}/) !== null) // Continue bullet
					{
						stringTextPara[integerTextParaCount] += stringTextLine[iTextLine].replace(/^\*\s+/, ' ').replace(/\n/, '');
						lastBullet = true;
					}
					else // Continue paragraph
					{
						stringTextPara[integerTextParaCount] += '\n' + stringTextLine[iTextLine].replace(/\n/, '');
						lastBullet = false;
					}
				}
				else
				{
					stringTextPara[integerTextParaCount] += stringTextLine[iTextLine].replace(/^\*\s+/, ' ').replace(/\n/, '');
				}
			}
		}
		return stringTextPara;
	},

	prettyParagraph: function(stringParagraph)
	{
		var returnParagraph = '';
		var inList = false;

		stringParagraphLine = stringParagraph.match(/.*(\n|$)/g);
		for (var i=0; i<stringParagraphLine.length; i++)
		{
			var isList = (stringParagraphLine[i].match(/^\*\s+-/) !== null);

			// Cleanup the line - strip leading *, add finsihing punctuation if missing, remove newline, multiple spaces and make null lowercase
			var stringParagraphLineClean = stringParagraphLine[i].replace(/^\*\s+(?:-#?\s)?/, '').replace(/(\d|\w)\n/, '$1\.').replace(/\n/, '').replace(/\s+/g, ' ').replace(/\b(null)\b/gi, 'null');

			// Strip leading [in/out]
			var stringParagraphLineInOut = stringParagraphLineClean.replace(/^\[(in|out)\]\s*/i, '');

			// Put code tags around x()
			var stringParagraphLineCode = stringParagraphLineInOut.replace(/(\S+\(\s*\))/g, '<code>$1</code>');

			// Put links to nsIx
			var stringParagraphLineLink = stringParagraphLineCode.replace(/\b(nsI\S+)(?=\b)/g, '{{Interface("$1")}}');

			// Make first letter caps
			var stringParagraphLineCaps = this.firstCaps(stringParagraphLineLink);

			// Put code tags around null
			var stringParagraphLineNull = stringParagraphLineCaps.replace(/\b(null)\b/gi, '<code>$1</code>');

			// Add notes
			var stringParagraphLineNotes = this.makeNotes(stringParagraphLineNull);

			if (isList) // Do list items first
			{
				if (!inList)
				{
					returnParagraph += '<ul>\n';
				}
				returnParagraph += '<li>' + stringParagraphLineNotes + '</li>\n';
				inList = true;
			}
			else // Should be a regular paragraph
			{
				if (inList)
				{
					returnParagraph += '</ul>\n';
					inList = false;
				}
				returnParagraph += '<p>' + stringParagraphLineNotes + '</p>\n';
			}
		}
		// Close list if necessary
		if (inList)
		{
			returnParagraph += '</ul>\n';
		}
		return returnParagraph;
	},

	makeNotes: function(stringParagraph)
	{
		var returnParagraph = stringParagraph;
		// Turn note paragraphs into notes
		if (stringParagraph.match(/^@?note:?\s+/i) !== null)
		{
			returnParagraph = '{{note("' + this.firstCaps(stringParagraph.replace(/^@?note:?\s+/i, '')) + '")}}';
		}
		return returnParagraph;
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
		// Add * to doxygen comments that are missing them
		var stringStripLines = stringStripB.match(/[^\n]*(?:\n|$)/g);
		var stringStripC = '';
		var spaceStar = 0;
		var inInterface = false;
		var inCommentRegular = false;
		var inCommentDoxygen = false;
		for (var i=0; i<stringStripLines.length; i++)
		{
			// If this is the beginning of a comment
			if (stringStripLines[i].match(/\s*\/\*(?!\*)/) !== null)
			{
				inCommentRegular = true;
			}
			else if (stringStripLines[i].match(/\s*\/\*{2,2}/) !== null)
			{
				stringStripC += stringStripLines[i];
				inCommentDoxygen = true;
			}
			else if (stringStripLines[i].match(/INTERFACE[^\{]*{/i) !== null)
			{
				stringStripC += stringStripLines[i];
				inInterface = true;
			}
			else if (!inCommentRegular)
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
		}

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

//this.jsdump(stringPurgeA);

		return stringPurgeA;

	},

	tidyComment: function(sourceComment, forTable)
	{
		var stringReturn = '';

		// Convert null to lowercase
		sourceCommentA = sourceComment.replace(/\bnull\b/gi, 'null');

		// Convert 'note:'/'note:' to @note
		sourceCommentB = sourceCommentA.replace(/^\*\s*note:?\s+/i, '* @note ');

		var arrayParagraph = [];
		var currentParagraph = 0;
		var listTracker = [];
		var listLevel = 0;
		listTracker[listLevel] = {};
		listTracker[listLevel].indent = -10;
		var inAt = false;
		var sourceCommentLines = sourceCommentB.match(/[^\n]*(?:\n|$)/g);
		for (var i=0; i<sourceCommentLines.length; i++)
		{
			// Start new paragraph if a blank line
			if (sourceCommentLines[i].match(/^\*\s*$/) !== null)
			{
				// Close any lists
				while (listLevel > 0)
				{
					arrayParagraph[currentParagraph] += '</' + listTracker[listLevel].type + '>';
					listLevel--;
				}
				currentParagraph++;
				inAt = false;
			}
			// Check for @ paragraphs
			else if (sourceCommentLines[i].match(/\*\s*@/) === null)
			{
				// Close any lists
				while (listLevel > 0)
				{
					arrayParagraph[currentParagraph] += '</' + listTracker[listLevel].type + '>';
					listLevel--;
				}
				currentParagraph++;
				if (sourceCommentLines[i].match(/^\*\s@note/i) !== null) // @note
				{
					arrayParagraph[currentParagraph] = '@note ' + this.firstCaps(sourceCommentLines[i].replace(/^\*\s*@note/, ''));
				}
				else // Ignore anything other than a note
				{
					inAt = true;
				}
			}
			// Check for list
			else if (sourceCommentLines[i].match(/^\*\s*(?=(-#?\s|\.$))/) !== null)
			{
				var listType = sourceCommentLines[i].match(/^\*\s*(-#?(?=\s)|\.(?=$))/)[1].replace(/^\*\s*-#/, 'ol').replace(/^\*\s*-/, 'ul'); // List type or .
				var levelIndent = sourceCommentLines[i].match(/^\*\s*(?=\S)/).length -1; // Get the indent of the list item
				// If end of list level '.'
				if (listType == '.')
				{
					do
					{
						arrayParagraph[currentParagraph] += '</' + listTracker[listLevel].type + '>\n';
						listLevel--;
					}
					while (levelIndent >= listTracker[listLevel].indent)
					currentParagraph++;
				}
				// If the indent is higher than the current indent
				else if (levelIndent > listTracker[listLevel].indent)
				{
					do
					{
						arrayParagraph[currentParagraph] += '</' + listTracker[listLevel].type + '>\n';
						listLevel--;
					}
					while (levelIndent > listTracker[listLevel].indent)
				}
				// If the indent is deeper than the current indent
				else if (levelIndent > listTracker[listLevel].indent)
				{
					listLevel++;
					listTracker[listLevel] = {};
					listTracker[listLevel].indent = levelIndent;
					listTracker[listLevel].type = listType;
					arrayParagraph[currentParagraph] += '<' + listType + '>\n';
				}
				// If the indent is the current indent (use the indent of the higher level just in case...)
				else if (levelIndent > listTracker[listLevel - 1].indent)
				{
					// If the list type changes
					if (listTracker[listLevel].type !== listType)
					{
						arrayParagraph[currentParagraph] += '</' + listTracker[listLevel].type + '>\n';
						listTracker[listLevel].type = listType;
						arrayParagraph[currentParagraph] += '<' + listType + '>\n';
					}
				}
				if (listType !== '.')
				{
					arrayParagraph[currentParagraph] += '<li>';
					arrayParagraph[currentParagraph] += this.firstCaps(sourceCommentLines[i].replace(/^\*\s*(-#?\s*)/, ''));
				}

				inAt = false;
			}
			// Continue the paragraph
			else if (!inAt)
			{
				arrayParagraph[currentParagraph] += sourceCommentLines[i].replace(/\*\s*/, ' ');
			}
		}
		if (arrayParagraph[currentParagraph] == '')
		{
			arrayParagraph.splice(currentParagraph, 1);
			currentParagraph--;
		}

		for (var i=0; i<=currentParagraph; i++)
		{
			// Add missing punctuation
			arrayParagraph[i] = arrayParagraph[i].replace(/(\d|\w)(?=\n)/, '$1\.');

			// Add note template to notes
			if (arrayParagraph[i].match(/@note\s/) !== null)
			{
				arrayParagraph[i] = '{{note("' + arrayParagraph[i].replace(/@note/, '') + '")}}';
			}

			// Put 'p' tags around paragraphs
			if (i = currentParagraph && forTable)
			{
				stringReturn = arrayParagraph[i];
			}
			else
			{
				stringReturn = '<p>' + arrayParagraph[i] + '</p>';
			}
		}
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
