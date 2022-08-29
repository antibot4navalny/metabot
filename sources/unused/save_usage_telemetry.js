function saveUsageTelemetry()
{
	// likely new design
	if (prefillGoogleForms())
	{
		extensionUser = extractExtensionUserFromBodyScript()
	
		if (! extensionUser)
			// likely old design desktop
			extensionUser=extractExtensionUserFromInitData()
	
		else if (! extensionUser)
			extensionUser=""
	}
	else
		extensionUser=""

	if(chrome.storage) if (chrome.storage.sync)
	{
		chrome.storage.sync.set(
			{
				extensionVersionUponUninstall:
					getExtensionVersion(),
				extensionUserScreenname:
					extensionUser,
				latestBrowserVersion:
					getBrowserVersionConcise()
			},
			function() {
			});
	
		chrome.runtime.sendMessage({updateTelemetry: "Request"}, function(response) {
		});
	}
}

saveUsageTelemetry();
