/*jslint browser: true*/
/*global $, jQuery, alert, console*/
$(document).ready(function () {
    "use strict";
    
    $("#resultlist").sortable({cancel: ".contenteditable,.deleteButton"});

	String.prototype.splitNewline = function () {
		return this.split(/\r\n|\r|\n/);
	};

	var reHTTP = new RegExp("h.*://"),
        website = new RegExp("www."),
        trim = new RegExp("\/.*"),
        i = 0,
        opacity = 0.15,
        colours = ["RGBA(160, 0, 46, " + opacity + ")", "RGBA(231, 163, 58, " + opacity + ")", "RGBA(244, 202, 88, " + opacity + ")", "RGBA(167, 194, 68, " + opacity + ")", "RGBA(68, 131, 146, " + opacity + ")", "RGBA(158, 184, 254, " + opacity + ")", "RGBA(231, 154, 255, " + opacity + ")", "RGBA(186, 94, 232, " + opacity + ")", "RGBA(67, 40, 187, " + opacity + ")"],
        testData = $('textarea[name="urls"]').val(),
        now = new Date(),
        monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        dayNumbers = [31, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30],
        date = parseInt(now.getDate(), 10),
        yesterday = monthNames[now.getMonth()] + " " + (date - 1),
        today = monthNames[now.getMonth()] + " " + date,
        clicked = false;
    
    if (date - 1 === 0) {
        yesterday = monthNames[parseInt(now.getMonth(), 10) - 1] + " " + dayNumbers[parseInt(now.getMonth(), 10)];
    }
    
    $('#date-entry').datepicker({ dateFormat: "MM d" });
    $('#date-entry').datepicker("setDate", today);
    
    $('#resultlist').on('click', '.toggle', function () {
        $(this).parent('li').find('.sectiontitle').toggleClass('hidden');
        $(this).parent('li').find('.related').toggleClass('hidden');
        $(this).parent('li').find('ul.context').toggleClass('hidden');
        $(this).parent('li.meta').toggleClass('isrelated');
        $(this).parent('li.meta').toggleClass('indent');
    });
    
    $('#add-date').click(function () {
        var newDate = $('#date-entry').val();
        $('#resultlist').append("<li class='date'><p>" + newDate + "</p></li>");
    });
    
    $('#help').click(function () {
        $('.helpbox').removeClass('hidden');
    });
    
    $('.helpbox').click(function () {
        $('.helpbox').addClass('hidden');
    });
    
    $('#resultlist').on('click', '.deleteButton', function () {
        $(this).parent().remove();
    });
    
    $('#go').click(function () {
        if (clicked === true) {
            var r = window.confirm("This will erase what you've already done!\n\nAre you sure?");
            if (r === false) {
                return false;
            }
        }
        clicked = true;
        
        //inits
        $('#resultlist').html('');
        $('h2').html('Wikimedia Foundation Media Report:&nbsp;');
        $('h3').html('');
        
        $('#header').append(monthNames[now.getMonth()] + " " + now.getDate() + ", " + now.getFullYear());
        $('#description').append("In today's report...<br/><br/>");
        $('#resultlist').append("<li class='date'><p>" + yesterday + "</p></li>");

        var urls = $('textarea[name="urls"]').val().splitNewline(),
            p = $('.loading').fadeIn().promise();
		$(urls).each(function () {
            var fetchURL = this,
                daction = "title",
                newURL = fetchURL.replace(reHTTP, ""),
                websiteName = newURL.replace(website, "").replace(trim, ""),
                randomColor = colours[i],
                e = 0,
                postdata = { action: daction, url: newURL };
            i = i + 1;
            if (i === 9) {
                i = 0;
            }
            p = p.then(function () {
                return $.ajax({
                    type: "POST",
 //                 async: false, (Well, maybe....)
                    url: "https://testwiki.jamesryanalexander.com/meta/getmeta.php",
                    data: postdata,
                    dataType: 'json',
                    success: function (data) {
                        var titleStripped = JSON.stringify(data).replace(/["']/g, "");
                        $('#resultlist').append("<li class='meta' style='background:" + randomColor + "'><p class='deleteButton'>×</p><span class='sectiontitle contenteditable' contenteditable='true'>SECTIONTITLE<br/></span><span class='related hidden'>Related Stories:<br/></span><span class='entry contenteditable'  contenteditable='true'>" + websiteName + " - " + titleStripped + "<br/></span>" + fetchURL + "<a class='toggle'> &bull; toggle</a><br /><br /><ul class='context'><li class='contenteditable quote' contenteditable='true'><br/></li><br/></ul></li>");
                    },
                    error: function (data) {
                        console.log("Error!");
				        console.log(data);
				    }
                });
            }).then(function () {
                console.log("Done URL ", e); // log it
                e = e + 1;
            }, function () {
                return $.Deferred().resolve(); // suppress request failure
            });
        });
        p.then(function () { // when all the actions are done
            $(".loading").fadeOut(); // when all done - fade out
        });
    });
    
});

function SelectText() { //this code from https://stackoverflow.com/questions/985272/selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
    "use strict";
    
    var doc = document,
        text = doc.getElementById('results-wrapper'),
        range,
        selection,
        successful,
        sectionTitle = [],
        sectionTitleHidden = [],
        k = 0;
    
    $('li.meta').each(function () {
        if ($(this).prev().hasClass('isrelated')) {
            $(this).find('.related').remove();
        }
    });
    $('.toggle').remove();
    $('li').css({"font-size": "10pt"});
    $('li.meta').css({"background": "white", "border": "none", "padding": "0", "margin": "0"});
    $('li.date').css({"background": "white", "border": "none", "padding": "0", "margin": "0"});
    $('li.quote').css({"padding": "0", "background": "none", "box-shadow": "none"});
    
    $('li.quote').each(function () {
        if ($(this).html() === "<br>") {
            console.log("Yay!");
            $(this).remove();
        }
    });
    
    $('.sectiontitle').each(function () {
        sectionTitle.push($(this).html());
        sectionTitleHidden.push($(this).hasClass('hidden'));
    });
    for (k = 0; k < sectionTitle.length; k += 1) {
        if (sectionTitle[k] === "SECTIONTITLE<br>" && sectionTitleHidden[k] === false) {
            alert("Double-check your section titles!");
            return false;
        }
    }
    $('.toggle').remove();

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
    successful = document.execCommand('copy');
    alert('Copied to clipboard!');
    // "Optional" remove selected text
    selection.removeAllRanges();
}