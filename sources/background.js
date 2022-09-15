import { retrieveItemFromStorage } from './common_impex.js';


function getStorageDataPromise(sKey) {
  return new Promise(function(resolve, reject) {
    chrome.storage.local.get(sKey, function(items) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(items[sKey]);
      }
    });
  });
}

function storeLastTimeUpdateChecked(timeChecked)
{
	const timeCheckedJsoned = timeChecked.toJSON()
	chrome.storage.local.set(
	{
		labelsLastTimeUpdateChecked: timeCheckedJsoned
	}, function() {
	});
}

async function retrieveDateByKey(key)
{
	const retrievedDate = await retrieveItemFromStorage(key, 0);
	const dateConvertedTime = new Date(retrievedDate);
	return(dateConvertedTime);
}


async function retrieveLastTimeUpdateChecked()
{
	const retrievedDate = retrieveDateByKey('labelsLastTimeUpdateChecked');
	return retrievedDate;
}

async function retrieveLabelsLastModified()
{
	const lastModified = retrieveDateByKey('labelsLastModified')
	return lastModified;
}




function storeJSON(json, lastModified)
{
		chrome.storage.local.set(
		{
			webHostedLabels: json,
			labelsLastModified: lastModified.toJSON()
		}, function() {
			//// console.log("storeJSON: Done updating JSON")
		});
}

const labelsBodyGithubApiUrl = 'https://api.github.com/repos/antibot4navalny/accounts_labelled/contents/labels.json'



var GitHubApiRateLimitRemaining;
var GitHubApiRateLimitReset;


function reportJsonUpdateFailed(reason)
{
	console.log("Labels update failed, reason: ", reason)
}

async function fetchLabelsUpdateIfAvailable()
{
	var JsonLastModifiedDate;
	var JsonLastModifiedRaw;
	var JsonLastModifiedEpoch;

	if ((typeof GitHubApiRateLimitReset !== 'undefined') &&
			(typeof GitHubApiRateLimitRemaining !== 'undefined') &&
			(Date().now < GitHubApiRateLimitReset) &&
			(GitHubApiRateLimitRemaining == 0)
		)
	{
		/// Just log it to console and keep trying nicely.
		reportJsonUpdateFailed('ApiRateLimitExceeded, waiting for limit reset')
	} else {
		const labelsLastModified=await retrieveLabelsLastModified();
		const lastTimeUpdateChecked=new Date();
		
		const response = await fetch(labelsBodyGithubApiUrl, {
			method: 'GET',
			headers: {
				'If-Modified-Since': labelsLastModified.toUTCString()
			}
		});
		storeLastTimeUpdateChecked(lastTimeUpdateChecked);
		
		const ok = response.ok;
		const status = response.status;
	
		GitHubApiRateLimitRemaining = response.headers.get("x-ratelimit-remaining");
		GitHubApiRateLimitReset = new Date(1000*response.headers.get("x-ratelimit-reset"));
		console.log("GitHub API rate limit remaining: ", GitHubApiRateLimitRemaining)
		console.log("GitHub API rate limit reset:\n  ",
			GitHubApiRateLimitReset);

		if (status == 304)
		{
			console.log("fetchLabelsUpdateIfAvailable: No JSON update for If-Modified-Since:\n  ",
				labelsLastModified);
		} else if (status==200) {
			JsonLastModifiedRaw=response.headers.get("Last-Modified")
			JsonLastModifiedDate = new Date(JsonLastModifiedRaw);

			const rawJSON = await response.json();
			const payloadJson=JSON.parse(atob(rawJSON.content));
		
			storeJSON(payloadJson, JsonLastModifiedDate);
			console.log("fetchLabelsUpdateIfAvailable: Fetched JSON updated at:\n  ",
			  JsonLastModifiedDate);
			
		} else {
			reportJsonUpdateFailed("HTTP status "+status)
		}
	}
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}


async function considerRefreshingJSON()
{
	var lastTimeUpdateChecked;

	lastTimeUpdateChecked=await retrieveLastTimeUpdateChecked();

	var currentTime=new Date();
  const timeSinceLastChecked = new Date(currentTime - lastTimeUpdateChecked);
  const timeSinceLastCheckedStr = timeSinceLastChecked.toUTCString().split(' ')[4];
  
	console.log('considerRefreshingJSON: ',
		timeSinceLastCheckedStr, ' since last update of labels');

  //// Get latest JSON every 15 minutes
	if ((typeof lastTimeUpdateChecked === undefined) ||
  		! isValidDate(lastTimeUpdateChecked) ||
  		//// Production timeouts:
 			(((currentTime - lastTimeUpdateChecked) / (1000*60)) > 15))
			//// Debug timeouts:
			//(((currentTime - lastTimeUpdateChecked) / (1000)) > 15))
	{
		console.log("considerRefreshingJSON: Time to check JSON for updates");
		
		fetchLabelsUpdateIfAvailable()
  } else {
  	console.log("considerRefreshingJSON: Too early to check for JSON updates")
  }
}


/* Check whether new version is installed / updated */
chrome.runtime.onInstalled.addListener(function(details) {
   considerRefreshingJSON()
});

/*

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request === 'getLabels')
		{
			considerRefreshingJSON()
		  
     		var outcome;
				outcome="Fetched"
				sendResponse({updateResult: outcome});
				return true
		}
});

*/

function updateLabels() {
	considerRefreshingJSON()
		  
		var outcome;
		outcome="Fetched";
		sendResponse({updateResult: outcome});
		return true;
}


////// Production-time delay:
	setInterval(() => updateLabels(), 60*1000);
	
////// Debug-time delay:
//  setInterval(() => updateLabels(), 15*1000);