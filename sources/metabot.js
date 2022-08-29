var prepackaged_labels={};


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
	

		var i, x, t
	
		for (i = 0; i < a.length; i++)

			// process only tweets not processed in earlier passes			
			if (!a[i].dataset.mt_is_upd)
			{
				t = a[i]
		
				x=a[i].querySelector('a[href]').getAttribute('href').substring(1)
			
		
				isRed = (prepackaged_labels[x]=='red')
				
				isYellow = (prepackaged_labels[x]=='yellow')
		
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
		
					elementToHightlight = t.parentNode

					if (elementToHightlight.
						querySelector(
						":scope > article > div > div")
						.innerText=="" )
					// Highlight tweets only if they are not retweeted-by, no matter who retweeted or who posted the original tweet.
					{
						// подсвечиваем весь твит стилем bot_tweet_highlight
						elementToHightlight.className+=" bot_tweet_highlight"

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
				a[i].dataset.mt_is_upd = 1
			}
	}
	// repeat every 3 seconds
	setTimeout(markTweets, 3000);
}

loadPrepackagedLabels();
markTweets();
