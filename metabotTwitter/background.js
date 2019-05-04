/* Check whether new version is installed */

chrome.runtime.onInstalled.addListener(function(details) {
    /* other 'reason's include 'update' */
    if (details.reason == "install") {
        /* If first install, set uninstall URL */
        var uninstallUrlLink = 'https://docs.google.com/forms/d/e/1FAIpQLScwRaVyTZOSNyCjt483BQC4TfH38ZfPVfgvYDhqiLYZmcNbPg/viewform';
        
        /* If Chrome version supports it... */
        if (chrome.runtime.setUninstallURL) {
            chrome.runtime.setUninstallURL(uninstallUrlLink);
        }
    }
});
