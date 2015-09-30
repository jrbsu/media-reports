/*jslint browser: true*/
/*global $, jQuery, alert, console*/
$(function () {
    "use strict";
    $("#resultlist").sortable({cancel: ".contenteditable"});
    //$("#resultlist").disableSelection();

	String.prototype.splitNewline = function () {
		return this.split(/\r\n|\r|\n/);
	};

	var reHTTP = new RegExp("h.*://"),
        website = new RegExp("www."),
        trim = new RegExp("\/.*"),
        i = 0,
        now = new Date(),
        monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        dayNumbers = [31, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30],
        date = parseInt(now.getDate(), 10),
        yesterday = monthNames[now.getMonth()] + " " + (date - 1),
        today = monthNames[now.getMonth()] + " " + date;
    if (date - 1 === 0) {
        yesterday = monthNames[parseInt(now.getMonth(), 10) - 1] + " " + dayNumbers[parseInt(now.getMonth(), 10)];
    }
    
    $('#date-entry').datepicker({ dateFormat: "MM d" });
    $('#date-entry').datepicker("setDate", today);
    
    $('#resultlist').on('click', '.toggle', function () {
        $(this).parent('li').find('.sectiontitle').toggleClass('hidden');
        $(this).parent('li').find('.related').toggleClass('hidden');
        $(this).parent('li').toggleClass('isrelated');
        $(this).parent('li').toggleClass('indent');
    });
    
    $('#clean').click(function () {
        $('li').each(function () {
            if ($(this).prev().hasClass('isrelated')) {
                $(this).find('.related').remove();
            }
        });
        $('.toggle').remove();
        $('.meta').css({"background": "white", "border": "none"});
    });
    
    $('#add-date').click(function () {
        var newDate = $('#date-entry').val();
        $('#resultlist').append("<li class='date'>" + newDate + "<br/><br/></li>");
    });
    
    $('#help').click(function () {
        $('.helpbox').removeClass('hidden');
    });
    
    $('.helpbox').click(function () {
        $('.helpbox').addClass('hidden');
    });

	$('#go').click(function () {
        //inits
        //$('#results').html('<span class="date"></span><ul id="resultlist"></ul>');
        $('h2').html('Wikimedia Foundation Media Report:&nbsp;');
        $('h3').html('');
        
        $('#header').append(monthNames[now.getMonth()] + " " + now.getDate() + ", " + now.getFullYear());
        var descriptionText = $('textarea[name="desc"]').val();
        $('#description').append("In today's report...<br/><br/>");
        $('#resultlist').append("<li class='date'>" + yesterday + "<br/><br/></li>");
        
		$($('textarea[name="urls"]').val().splitNewline())
            .each(function () {
                var fetchURL = this,
                    newURL = fetchURL.replace(reHTTP, ""),
                    websiteName = newURL.replace(website, "").replace(trim, "");
                $.ajax({
                    url: "http://textance.herokuapp.com/title/" + encodeURIComponent(newURL),
                    complete: function (data) {
                        var title = data.responseText;
                        $('#resultlist').append("<li id='section" + i + "' class='meta'><span class='sectiontitle contenteditable' contenteditable='true'>SECTIONTITLE<br/></span><span class='related hidden'>Related Stories:<br/></span><span class='entry contenteditable'  contenteditable='true'>" + websiteName + " - " + data.responseText + "<br/></span>" + fetchURL + "<a class='toggle'> &bull; toggle</a><br /><br /></li>");
                        i = i + 1;
                    }
                });
            });
    });
});

function SelectText() { //this code from https://stackoverflow.com/questions/985272/selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
    "use strict";
    $('.toggle').remove();
    var doc = document,
        text = doc.getElementById('results-wrapper'),
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