var screennameRegex="[A-Za-z0-9_]+"


async function commonImporter()
{
	return await import((chrome.runtime.getURL || chrome.extension.getURL)("common_impex.js"));
}

var prepackaged_labels={};

var webHostedLabelsCached = {};

async function retrieveLabelsFromStorage()
{
	retrievedLabels=await (await commonImporter()).retrieveItemFromStorage('webHostedLabels', {});

	return retrievedLabels;
}


async function initializeCachedLabelsFromStorage()
{
	const labelsFromStorage = await retrieveLabelsFromStorage();
	webHostedLabelsCached = Object.assign({}, labelsFromStorage);
}

async function updateCachedLabelsOnStorageChange(changes, area) {

  const changedItems = Object.keys(changes);

	if ((area == "local") &&
		(Object.keys(changes).includes('webHostedLabels')))
	{
		console.log("Local changes in Labels:");

// 		const newLabels = await retrieveWebHostedLabels();
		const newLabels = changes['webHostedLabels'].newValue;
				
		webHostedLabelsCached = Object.assign({}, newLabels);
	}

	//// Debug-only output:
	// for (const item of changedItems) {
	// 	console.log(`${item} has changed:`);
	// 	console.log("Old value: ", changes[item].oldValue);
	// 	console.log("New value: ", changes[item].newValue);
	// }
}

chrome.storage.onChanged.addListener(updateCachedLabelsOnStorageChange);



async function markUponStorageReady()
{
	await initializeCachedLabelsFromStorage();
/////	console.log("Storage ready, proceeding to marking tweets")

	markTweets();
}



function loadPrepackagedLabels()
{

  var rUrl = chrome.runtime.getURL('assets/labels.json');
  
  fetch(rUrl).then((response) => {
    return response.json();
  })
  .then((fileContent) => {
    prepackaged_labels=fileContent;
  }
  )
  .catch((cause) => console.log(cause));
}


function setStyle(divElement, style)
{
	divElement.innerHTML = '<style>'+style+'</style>'
}

function addStyle(s)
{
	var d = document.createElement('div')
	
	if(s) setStyle(d,s)
	
	return document.body.appendChild(d)
}



// добавляем стили для пометки ботов

// reduced-contrast style for tweet bodies posted by bots
s = '.bot_tweet_highlight .bot_text { color: #808080; }'
addStyle(s)


// стиль для пометки красноватым фоном твитов от ботов
tweetBackgroundStyle=addStyle()

function defineTweetBackgroundStyle()
{
	// dark mode: <meta name="theme-color" content="#1C2938">
	// light mode: <meta name="theme-color" content="#FFFFFF">
	dark_mode = ! (document.querySelector(
		":root > head > meta[name=theme-color]")
		.getAttribute("content").toUpperCase() == "#FFFFFF")

	if (dark_mode)
		var s = '.bot_tweet_highlight { background: #4b3333 !important; }'	// dark
	else
		var s = '.bot_tweet_highlight { background: #FEE !important; }'		// light

	setStyle(tweetBackgroundStyle, s)
}

 

function normalizedPathname()
{
	// normalize '/username/[with_replies]' to 'username'
	loc=document.location
	return (loc.pathname+loc.search).substring(1).replace("/with_replies","")
}

function isStatusView()
{
	path=document.location.pathname
	return path.includes("/status/") &&
 		(document.location.search=="") 	// Enable comments as cgi params
}

function isProfileView()
{
	pathWithRepliesRemoved=normalizedPathname()
	userNameMatch=pathWithRepliesRemoved
		.match(screennameRegex)

	return (document.location.search=="") && 
		(! pathWithRepliesRemoved.includes("/")) &&
		(userNameMatch) &&
		(userNameMatch[0]==pathWithRepliesRemoved)
}




function markTweets()
{
	if (isStatusView() || isProfileView() )
	{
		defineTweetBackgroundStyle()

		var a=document.querySelectorAll('article[role=article]');
		// In conversation view, works both for focused tweet and
		// for parent / child replies of the focused tweet.
			
		highlight_tweets=isStatusView()
	

		var i, x, t, linksInsideTweet
	
		for (i = 0; i < a.length; i++)

			// process only tweets not processed in earlier passes			
			if (!a[i].dataset.mt_is_upd)
			{
				t = a[i]
				// But don't mark it as processed if it contains no link:
				// e.g. if tweet is under extra click:
				// "Show additional replies" or similar
				linksInsideTweet = t.querySelector('a[href]')

				if (!(linksInsideTweet === null))
				{
					
					x = linksInsideTweet.getAttribute('href').substring(1)
					
					
					isRed = ((webHostedLabelsCached[x]=='red') ||
										(prepackaged_labels[x]=='red'))
					
					isYellow = ((webHostedLabelsCached[x]=='yellow') ||
										(prepackaged_labels[x]=='yellow'))

					if ((isRed || isYellow) && highlight_tweets)
					{
						label=isRed?"БОТ:" :isYellow?"⚠️":""
					
						// highlight all tweets shown on the page
						botCaption = document.createElement("span")
						botCaption.innerHTML=label+"&nbsp;"
						botCaption.style.color = 'red'

						// дописываем "БОТ: " перед именем автора твита
						fullname=t.querySelector("span")

						fullname.prepend(botCaption)
						
						elementToHighlight = t.parentNode

						//// "Highlight tweets only if they are not retweeted-by,
						//// no matter who retweeted or who posted the original tweet."
						////
						//// In case of retweet, only username of retweeting user
						//// is prepended, not username of original tweet's author.
						////
						//// How it should ideally work:
						//// - instead of parent node, two child nodes should be highlighted:
						////   (1) username,
						////   (2) tweet body
						////
						//// - bot/not bot should be determined based on node always containing
						////   username of original tweet's author
						////
						//// - it is much more important to highlight when the original
						////   tweet's author is bot, not when the account retweeted it is
						//// 
						//// - the above logic will also highlight bot-created pinned tweet

						if (isRed && (elementToHighlight.
							//// "Username retweeted" caption above original tweet is empty
							querySelector(
							":scope > article > div > div > div > div")
							.innerText=="" ))
						{
							// подсвечиваем весь твит стилем bot_tweet_highlight
							elementToHighlight.className+=" bot_tweet_highlight"

							// reduce contrast for tweet text
							tweetTextselector =
								// - for focused tweet:
								':scope > div > div > span' + ', ' +
								// - for parent / child replies of the focused tweet
								':scope > div > div > div > div > span'
							
							tweetTxts = t.querySelectorAll(tweetTextselector)
							tweetTxts.forEach(
								function(element) {
									element.className='bot_text ' + element.className;
								});
						}
					}
					
					// Mark tweet as processed to skip in subsequent passes
					t.dataset.mt_is_upd = 1
				}
			}
	}
	// repeat every 0.1 seconds
	setTimeout(markTweets, 100);
}

function requestLabels()
{
	// 1. Send the background a message requesting the user's data
	chrome.runtime.sendMessage('getLabels', (response) => {
		// 2. Got an asynchronous response with the data from the background
////		console.log('metabot received response: ', response);
	})
	
////// Production-time delay:
	setTimeout(requestLabels, 60*1000);
	
////// Debug-time delay:
// 	setTimeout(requestLabels, 15*1000);
}

requestLabels();

loadPrepackagedLabels();

markUponStorageReady();
