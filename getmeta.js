$(function(){
	String.prototype.splitNewline = function(){
		return this.split(/\r\n|\r|\n/);
	};

	var tr = $('#results');
	var reHTTP = new RegExp("h.*://");
	var website = new RegExp("www.");
	var trim = new RegExp("\/.*");
	var i = 0;
	var now = new Date();
	var monthNames = new Array("January","February","March","April","May","June","July","August","September","October","November","December");
	var date = parseInt(now.getDate())-1;
	var today = monthNames[now.getMonth()] + " " + date;

	$('#go').click(function(){
		tr.append("<span class='date'>"+today+"</span><br/><br/>");
		$($('textarea[name="urls"]').val().splitNewline())
		.each(function(){
			var fetchURL = this;
			var newURL = fetchURL.replace(reHTTP, "");
			var websiteName = newURL.replace(website, "").replace(trim, "");
			console.log("https://textance.herokuapp.com/title/"+newURL);
			$.ajax({
      			url: "http://api.embed.ly/1/extract?key=6e7f14bd554242fd839bf537052a64b3&url="+encodeURIComponent(newURL)+"&format=json",
      			complete: function(data) {
      				var json = JSON.parse(data);
        			var title = json.title;
        			var description = json.description;
        			var provider = json.provider_name;
					tr.append("<div id='section"+i+"'><span class='sectiontitle'>SECTIONTITLE</span><br/>" + provider + " - " + title + "<br />");
					tr.append(fetchURL + "<br/><ul id='list"+i+"'><li>QUOTE</li></ul><br/></div>");
					$('#toggles').append("<span id='toggle"+i+"'><a href='#'>"+i+"</a></span> / ");
					i = i+1;
				}
			});
		});
	});
});

function SelectText(element) { //this code from https://stackoverflow.com/questions/985272/selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
    var doc = document
        , text = doc.getElementById(element)
        , range, selection
    ;    
    if (doc.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else if (window.getSelection) {
        selection = window.getSelection();        
        range = document.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    try {

		// The important part (copy selected text)
		var successful = document.execCommand('copy');

		// "Optional" remove selected text
		sel.removeAllRanges();

		if(successful) answer.innerHTML = 'Copied!';
		else answer.innerHTML = 'Unable to copy; please use ctrl+c!';
		} catch (err) {
		answer.innerHTML = 'Unsupported browser; please use ctrl+c!';
	}
};