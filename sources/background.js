const legacyLabels = {
  storageSuffix: "Legacy",
  URL: "https://api.github.com/repos/antibot4navalny/accounts_labelled/contents/labels.json",
  period: 3 * 60
};

const manualLabels = {
  storageSuffix: "Manual",
  URL: "https://api.github.com/repos/antibot4navalny/accounts_labelled/contents/labels_manual.json",
  period: 15
};


import { retrieveItemFromStorage } from './common_impex.js';

chrome.alarms.create("updateLabels", {periodInMinutes: 1})


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

function storeLastTimeUpdateChecked(labelSuffix, timeChecked)
{
	const timeCheckedJsoned = timeChecked.toJSON()
	chrome.storage.local.set(
	{
		["labelsLastTimeUpdateChecked" + labelSuffix]: timeCheckedJsoned
	}, function() {
	});
}

async function retrieveDateByKey(key)
{
	const retrievedDate = await retrieveItemFromStorage(key, 0);
	const dateConvertedTime = new Date(retrievedDate);
	return(dateConvertedTime);
}


async function retrieveLastTimeUpdateChecked(labelSuffix)
{
	const retrievedDate = retrieveDateByKey(
	  'labelsLastTimeUpdateChecked' + labelSuffix);
	return retrievedDate;
}

async function retrieveLabelsLastModified(labelSuffix)
{
	const lastModified = retrieveDateByKey(
	  'labelsLastModified' + labelSuffix)
	return lastModified;
}

function storeJSON(labelSuffix, json, lastModified)
{
    
    // Any other key/value pairs in storage will not be affected.
		chrome.storage.local.set(
		  {
        ["webHostedLabels" + labelSuffix]: json,
        ["labelsLastModified" + labelSuffix]: lastModified.toJSON()
		  },
  		function() {
        //// console.log("storeJSON: Done updating JSON")
      }
    );
}


var GitHubApiRateLimitRemaining;
var GitHubApiRateLimitReset;


function reportJsonUpdateFailed(reason)
{
	console.log("Labels update failed, reason: ", reason)
}

async function fetchLabelsUpdateIfAvailable(labelsType)
{
  const suffix = labelsType.storageSuffix
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
		const labelsLastModified=await retrieveLabelsLastModified(suffix);
		const lastTimeUpdateChecked=new Date();
		
		const response = await fetch(labelsType.URL, {
			method: 'GET',
			headers: {
				'If-Modified-Since': labelsLastModified.toUTCString()
			}
		});
		storeLastTimeUpdateChecked(
		  suffix, lastTimeUpdateChecked);
		
		const ok = response.ok;
		const status = response.status;
	
		GitHubApiRateLimitRemaining = response.headers.get("x-ratelimit-remaining");
		GitHubApiRateLimitReset = new Date(1000*response.headers.get("x-ratelimit-reset"));
		console.log(suffix + " GitHub API rate limit remaining: ", GitHubApiRateLimitRemaining)
		console.log(suffix + " GitHub API rate limit reset:\n  ",
			GitHubApiRateLimitReset);

		if (status == 304)
		{
			console.log(
			  "fetchLabelsUpdateIfAvailable: " + suffix +
			  ": No JSON update for If-Modified-Since:\n  ",
				labelsLastModified);
		} else if (status==200) {
			JsonLastModifiedRaw=response.headers.get("Last-Modified")
			JsonLastModifiedDate = new Date(JsonLastModifiedRaw);

			const rawJSON = await response.json();
			const payloadJson=JSON.parse(atob(rawJSON.content));
		
			storeJSON(suffix, payloadJson, JsonLastModifiedDate);
			console.log(
			  "fetchLabelsUpdateIfAvailable: " + suffix +
			  ": Fetched JSON updated at:\n  ",
			  JsonLastModifiedDate);
			
		} else {
			reportJsonUpdateFailed("HTTP status "+status)
		}
	}
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}


async function considerRefreshingJSON(labelsType)
{
  const suffix = labelsType.storageSuffix;
	var lastTimeUpdateChecked;

	lastTimeUpdateChecked=await retrieveLastTimeUpdateChecked(suffix);

	var currentTime=new Date();
  const timeSinceLastChecked = new Date(currentTime - lastTimeUpdateChecked);
  const timeSinceLastCheckedStr = timeSinceLastChecked.toUTCString().split(' ')[4];
  
	console.log('considerRefreshingJSON: ',
		timeSinceLastCheckedStr, ' since last update of labels: ' + suffix);

  //// Get latest JSON every 15 minutes
	if ((typeof lastTimeUpdateChecked === undefined) ||
  		! isValidDate(lastTimeUpdateChecked) ||
  		//// Production timeouts:
 			(((currentTime - lastTimeUpdateChecked) / (1000*60)) > labelsType.period))
			//// Debug timeouts:
			//(((currentTime - lastTimeUpdateChecked) / (1000)) > 15))
	{
		console.log("considerRefreshingJSON: Time to check JSON for updates: " + suffix);
		
		fetchLabelsUpdateIfAvailable(labelsType)
  } else {
  	console.log("considerRefreshingJSON: Too early to check for JSON updates: " + suffix)
  }
}

function considerRefreshingAllJSONs()
{
  considerRefreshingJSON(legacyLabels)
  considerRefreshingJSON(manualLabels)
}


/* Check whether new version is installed / updated */
chrome.runtime.onInstalled.addListener(function(details) {
   considerRefreshingAllJSONs()
});


chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === 'updateLabels')  
    considerRefreshingAllJSONs();
});


considerRefreshingAllJSONs();
