var labels={};


function loadLabels()
{

  var rUrl = chrome.runtime.getURL('assets/labels.json');
  
  fetch(rUrl).then((response) => {
    return response.json();
  })
  .then((fileContent) => {
    labels=fileContent;
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
	if (document.querySelector('#init-data') === null) // likely mobile mode / new design
		// dark mode: <meta name="theme-color" content="#1C2938">
		// light mode: <meta name="theme-color" content="#FFFFFF">
		dark_mode = ! (document.querySelector(
			":root > head > meta[name=theme-color]")
			.getAttribute("content").toUpperCase() == "#FFFFFF")
	else  // likely desktop mode, old design
		dark_mode = getInitData()["night_mode_activated"] ? true : false

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

		var a=document.querySelectorAll('#permalink-overlay div.tweet')
			// get all tweets on tweet focus page for old design, desktop
	
		if (a.length>0)
		{
			mobile_mode=false
			highlight_tweets=true
		}
		else
		{
			var a=document.querySelectorAll('div.stream div.tweet')
				// get all tweets on user profile page for old design, desktop
			mobile_mode=false
			highlight_tweets=false
		}
		if (a.length==0)
		{
			mobile_mode=true
			a=document.querySelectorAll('article[role=article]');
			// In conversation view, works both for focused tweet and
			// for parent / child replies of the focused tweet.
				
			highlight_tweets=isStatusView()
		}
	

		var i, x, t
	
		for (i = 0; i < a.length; i++)

			// process only tweets not processed in earlier passes			
			if (!a[i].dataset.mt_is_upd)
			{
				t = a[i]
		
				x=mobile_mode ?
					a[i].querySelector('a[href]').getAttribute('href').substring(1) :						
					(isStatusView() ?
						a[i].getAttribute("data-user-id") :
						document.querySelector("div.ProfileNav")
							.getAttribute("data-user-id") )
						// getInitData()["profile_user"]["id_str"]
			
		
				isRed = (labels[x]=='red')
				
				isYellow = (labels[x]=='yellow')
		
				if ((isRed || isYellow) && highlight_tweets)
				{
				  label=isRed?"БОТ:" :isYellow?"⚠️":""
				  
					// highlight all tweets shown on the page
					botCaption = document.createElement("span")
					botCaption.innerHTML=label+"&nbsp;"
					botCaption.style.color = 'red'

					// дописываем "БОТ: " перед именем автора твита
					fullname=t.querySelector(mobile_mode?
						"span" :
						'span.FullNameGroup')

					fullname.prepend(botCaption)
		
					elementToHightlight=mobile_mode ?
						t.parentNode :
						t

					if (elementToHightlight.
						querySelector(
						":scope > article > div > div")
						.innerText=="" )
					// Highlight tweets only if they are not retweeted-by, no matter who retweeted or who posted the original tweet.
					{
						// подсвечиваем весь твит стилем bot_tweet_highlight
						elementToHightlight.className+=" bot_tweet_highlight"

						// reduce contrast for tweet text
						tweetTextselector = mobile_mode ?
							// - for focused tweet:
							':scope > div > div > span' + ', ' +
							// - for parent / child replies of the focused tweet
							':scope > div > div > div > div > span'
							:
							// for desktop, old design
							'div.js-tweet-text-container p.tweet-text'

						tweetTxts = t.querySelectorAll(tweetTextselector)
						tweetTxts.forEach(
							function(element) {
								element.className='bot_text ' + element.className;
							});						
					}			
				}
		
		
				if (! mobile_mode)
				{
					// old design, desktop:
					menuAction = reportTweetCaption(isRed)

					// inject custom menu item: "Tweet non/typical for a bot"
					 
					tweetPermalink=DOMPurify.sanitize(
						(new URL(t.getAttribute("data-permalink-path"),
							document.location)).href
					)

					reportedAccount=
						isStatusView() ?
							t.getAttribute("data-screen-name") :
						isProfileView() ?
							normalizedPathname() :
							""
//							getInitData()["profile_user"]["screen_name"]
							// ^^ not ready as of initial load of user profile page

					var parameters = {
						reportedAccount: reportedAccount, 
						tweetInvokedFrom:
							encodeURIComponent(tweetPermalink)}


					template = isRed ?
						templateReportUntypicalTweetUrl :
						templateReportTweetUrl

					addOldDesignMenuItemSeparted(
						t,
						template,
						parameters,
						menuAction,
						false)
				}

				// Mark tweet as processed to skip in subsequent passes
				a[i].dataset.mt_is_upd = 1
			}
	}
	// repeat every 3 seconds
	setTimeout(markTweets, 3000);
}

loadLabels();
markTweets();
