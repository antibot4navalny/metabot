// const fillTemplate = function(templateString, templateVars){
function fillTemplate(templateString, templateVars)
{
	var func = new Function(...Object.keys(templateVars),  "return `"+templateString +"`;")
	return func(...Object.values(templateVars));
}

function prefillGoogleForms()
{
	if ((typeof flagPrefillGoogleForms !== 'undefined') && (flagPrefillGoogleForms == true))
		return true;
	else
		return false;
}

function changeToTimezone(date,IanaTZ)
// source: https://stackoverflow.com/a/53652131/10085368
{

     // suppose the date is 12:00 UTC
     var invdate = new Date(date.toLocaleString('en-US', { 
        timeZone: IanaTZ 
     }));

     // then invdate will be 07:00 in Toronto
     // and the diff is 5 hours
     var diff = date.getTime()-invdate.getTime();

     // so 12:00 in Toronto is 17:00 UTC
     return new Date(date.getTime()-diff);
   }


function currentDateTime()
{
	// source: https://stackoverflow.com/a/50405988

	nowTimeZoneAdjusted=changeToTimezone(new Date(), "Europe/Moscow")
	return encodeURIComponent(
		new Date(
			nowTimeZoneAdjusted.toString().
			split('GMT')[0]+'UTC').
			toISOString().split('.')[0].
			replace('T',' ') )
}

function currentDate()
{
	// source: https://stackoverflow.com/a/50405988

	return encodeURIComponent(
		new Date(
			new Date().toString().
			split('GMT')[0]+'UTC').
			toISOString().split('T')[0])
}


function getBrowserVersion()
{
	return encodeURIComponent(navigator.userAgent)
}


function getBrowserVersionConcise()
{
// source: https://stackoverflow.com/a/11219680/10085368
// > http://www.javascripter.net/faq/browsern.htm


	var nVer = navigator.appVersion;
	var nAgt = navigator.userAgent;
	var browserName  = navigator.appName;
	var fullVersion  = ''+parseFloat(navigator.appVersion); 
	var majorVersion = parseInt(navigator.appVersion,10);
	var nameOffset,verOffset,ix;

	// In Opera, the true version is after "Opera" or after "Version"
	if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
	 browserName = "Opera";
	 fullVersion = nAgt.substring(verOffset+6);
	 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
	   fullVersion = nAgt.substring(verOffset+8);
	}
	// In MSIE, the true version is after "MSIE" in userAgent
	else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
	 browserName = "Microsoft Internet Explorer";
	 fullVersion = nAgt.substring(verOffset+5);
	}
	// In Chrome, the true version is after "Chrome" 
	else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
	 browserName = "Chrome";
	 fullVersion = nAgt.substring(verOffset+7);
	}
	// In Safari, the true version is after "Safari" or after "Version" 
	else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
	 browserName = "Safari";
	 fullVersion = nAgt.substring(verOffset+7);
	 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
	   fullVersion = nAgt.substring(verOffset+8);
	}
	// In Firefox, the true version is after "Firefox" 
	else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
	 browserName = "Firefox";
	 fullVersion = nAgt.substring(verOffset+8);
	}
	// In most other browsers, "name/version" is at the end of userAgent 
	else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < 
		  (verOffset=nAgt.lastIndexOf('/')) ) 
	{
	 browserName = nAgt.substring(nameOffset,verOffset);
	 fullVersion = nAgt.substring(verOffset+1);
	 if (browserName.toLowerCase()==browserName.toUpperCase()) {
	  browserName = navigator.appName;
	 }
	}
	// trim the fullVersion string at semicolon/space if present
	if ((ix=fullVersion.indexOf(";"))!=-1)
	   fullVersion=fullVersion.substring(0,ix);
	if ((ix=fullVersion.indexOf(" "))!=-1)
	   fullVersion=fullVersion.substring(0,ix);

	majorVersion = parseInt(''+fullVersion,10);
	if (isNaN(majorVersion)) {
	 fullVersion  = ''+parseFloat(navigator.appVersion); 
	 majorVersion = parseInt(navigator.appVersion,10);
	}
	
	conciseInfo=browserName+' '+fullVersion

	return encodeURIComponent(conciseInfo)
}


function getExtensionVersion()
{
	if(chrome.runtime) if (chrome.runtime.getManifest())
		return chrome.runtime.getManifest().version
	else
		return ""
}



function getInitData()
{
	initData=
		document.querySelector('#init-data')
	if (initData)
		return JSON.parse(initData.value)
	else
		return null
}

var screennameRegex="[A-Za-z0-9_]+"


function extractExtensionUserFromBodyScript()
{
	// works for new Twitter design

	inlineScript=document.querySelector(
		'body script')
	if (inlineScript)
	{
		scriptRegexp=new RegExp(
			'\"screen_name\":\"('+screennameRegex+')\"')
			
		matchScreenName=inlineScript.innerHTML
			.match(scriptRegexp)

		if (matchScreenName)
			return matchScreenName[1]
	}
}

function extractExtensionUserFromInitData()
{
		// works for old design desktop

		initData=getInitData()
		if (initData)
			return initData["screenName"]
}


function fillInMenuItem(
			targetNode, nodeForCaption,
			template, parameters,
			reportingUser,
			menuItemCaption)
{
	parameters=Object.assign(parameters, {reportingUser: reportingUser} )
	targetNode.href=fillTemplate(template, parameters);
	targetNode.target="_blank"
	nodeForCaption.textContent=menuItemCaption
}



function addOldDesignMenuItemSeparted(
			dropdownMenuParent,
			template,
			parameters,
			menuItemCaption,
			isUserMenu)
{
	dropdownMenu=dropdownMenuParent
			.querySelector(
				'div.dropdown-menu ul')
	
	reportingUser=prefillGoogleForms() ? extractExtensionUserFromInitData() : ""

	dropdownDivider = document.createElement("li")
	dropdownDivider.className=
		"dropdown-divider is-embeddable"

	dropdownMenu.appendChild(dropdownDivider)


	newAction = document.createElement("li")
	newAction.role = "presentation"
	if (isUserMenu)
		newAction.style="display: block;"

	newActionLink = document.createElement("a")


	fillInMenuItem(
		newActionLink,
		newActionLink,
		template, parameters,
		reportingUser,
		menuItemCaption)

	newAction.appendChild(newActionLink)	
	dropdownMenu.appendChild(newAction)
}

