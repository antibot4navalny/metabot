// шаблоны ссылок на "Сообщить о боте"

var templateReportURLPrefix = "https://twitter.com/messages/compose?recipient_id=1067060314884190209&text=${tweetInvokedFrom}"
var reportType=""

dmAction = "В кремлеботы"
var templateReportTweetUrl=templateReportURLPrefix + 
	encodeURIComponent("\n" + dmAction + ", вот почему:\n")

dmAction = "Это не кремлебот"
var templateReportUntypicalTweetUrl=templateReportURLPrefix + 
	encodeURIComponent("\n" + dmAction + ", вот почему:\n")
