export function retrieveItemFromStorage(key, defaultValue)
{
	return new Promise(resolve => {
		chrome.storage.local.get(
			{[key]: defaultValue}, function(result) {
			const returnedValue = result[key];
			resolve(returnedValue);
		})
  });
}
