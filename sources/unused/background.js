function fillUninstallURL(installationTimestamp, browserVersionUponInstall, extensionVersionUponInstall, extensionUserScreenname) {

return `https://docs.google.com/forms/d/e/1FAIpQLScwRaVyTZOSNyCjt483BQC4TfH38ZfPVfgvYDhqiLYZmcNbPg/viewform?usp=pp_url&entry.1813334385=${extensionUserScreenname}&entry.1669520664=${installationTimestamp}&entry.1000353045=${extensionVersionUponInstall}&entry.1265234860=${browserVersionUponInstall}`

// 		'&entry.600723940=${extensionVersionUponUninstall}'+
// 		'&entry.318989038=${latestBrowserVersion}'
}



function updateUninstallUrlFromStorage()
{
        chrome.storage.sync.get([
		'installationTimestamp',
		'extensionVersionUponInstall',
		'browserVersionUponInstall',
		'extensionUserScreenname',
 		'extensionVersionUponUninstall',
 		'latestBrowserVersion'			
	],
	function(result) {


		uninstallUrlLink = fillUninstallURL(
			result.installationTimestamp,
			result.browserVersionUponInstall,
			result.extensionVersionUponInstall,
			result.extensionUserScreenname )


		/* If Chrome version supports it... */
		if (chrome.runtime.setUninstallURL)
		{
			chrome.runtime.setUninstallURL(uninstallUrlLink)
			console.log("updateFromStorage: Set UninstallURL for Chrome" /*  + ": "+uninstallUrlLink*/ )
		}		
		else if(browser.runtime.setUninstallURL)
		// otherwise try Firefox method
		{
			browser.runtime.setUninstallURL(uninstallUrlLink)
			console.log("updateFromStorage: Set UninstallURL for Firefox" /*  + ": "+uninstallUrlLink*/ )
		} else
			console.log("updateFromStorage: Failed to set UninstallURL")

		console.log("updateFromStorage: URL Length: ", uninstallUrlLink.length)
        });
}


/* Check whether new version is installed */
chrome.runtime.onInstalled.addListener(function(details) {

    /* other 'reason's include 'update' */

    if (details.reason == "install") {
    
		/* If first install, save initial telemetry data, uninstall URL */

		chrome.storage.sync.set(
		{
			installationTimestamp: currentDateTime(),
			browserVersionUponInstall: getBrowserVersionConcise(),
			extensionVersionUponInstall: getExtensionVersion(),
		}, function() {});
		
	updateUninstallUrlFromStorage()
    }
});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.updateTelemetry)
		{
			updateUninstallUrlFromStorage()
			outcome="Updating"
			sendResponse({updateResult: outcome})
		}
	  });
