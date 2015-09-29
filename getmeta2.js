/*jslint browser: true*/
/*global $, jQuery, alert, console*/
$(function () {
    "use strict";
    $("#resultList").sortable();
//  $("#resultList").disableSelection();
});

$(function () {
    "use strict";
	String.prototype.splitNewline = function () {
		return this.split(/\r\n|\r|\n/);
	};

	var reHTTP = new RegExp("h.*://"),
        website = new RegExp("www."),
        trim = new RegExp("\/.*"),
        i = 0,
        now = new Date(),
        monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        date = parseInt(now.getDate(), 10) - 1,
        today = monthNames[now.getMonth()] + " " + date;
    
    $('#results').on('click', 'span.toggle', function () {
        $(this).parent('li').find('.sectiontitle').toggleClass('hidden');
        $(this).parent('li').find('.related').toggleClass('hidden');
        $(this).parent('li').toggleClass('indent');
    });
    
    $('#clearToggles').click(function () {
        $('.toggle').addClass('hidden');
    });

	$('#go').click(function () {
        $('#header').append(monthNames[now.getMonth()] + " " + now.getDate() + ", " + now.getFullYear());
        var descriptionText = $('textarea[name="desc"]').val();
        $('#description').append(descriptionText + "<br/><br/>");
        $('.date').append(today + "<br/><br/>");
        
		$($('textarea[name="urls"]').val().splitNewline())
            .each(function () {
                var fetchURL = this,
                    newURL = fetchURL.replace(reHTTP, ""),
                    websiteName = newURL.replace(website, "").replace(trim, "");
                $.ajax({
                    url: "http://textance.herokuapp.com/title/" + encodeURIComponent(newURL),
                    complete: function (data) {
                        var title = data.responseText;
                        $('#resultList').append("<li id='section" + i + "' class='withTitle'><span class='sectiontitle' contenteditable='true'>SECTIONTITLE</span><span class='related hidden'>Related Stories:</span><br/>" + websiteName + " - " + data.responseText + "<br />" + fetchURL + "<span class='toggle'> &bull; toggle</span><br /><br /></li>");
                        i = i + 1;
                    }
                });
            });
    });
});

function SelectText() { //this code from https://stackoverflow.com/questions/985272/selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
    "use strict";
    var doc = document,
        text = doc.getElementById('results'),
        range,
        selection;
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
    var successful = document.execCommand('copy');
    // "Optional" remove selected text
    sel.removeAllRanges();
}