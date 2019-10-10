function saveUsageTelemetry()
{
	// likely new design
	extensionUser = extractExtensionUserFromBodyScript()

	if (! extensionUser)
		// likely old design desktop
		extensionUser=extractExtensionUserFromInitData()

	else if (! extensionUser)
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
