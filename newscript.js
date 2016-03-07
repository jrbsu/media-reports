/*jslint browser: true*/
/*global $, jQuery, alert, console, moment*/
$(document).ready(function () {
    "use strict";
    
    $("#resultlist").sortable({cancel: ".contenteditable,.deleteButton"});

	String.prototype.splitNewline = function () {
		return this.split(/\r\n|\r|\n/);
	};

	var reHTTP = new RegExp("h.*://"),
        website = new RegExp("www."),
        trim = new RegExp("\/.*"),
        topics = [],
        i = 0,
        u = 0,
        y = 0,
        urlarray = [], // need this
        pubarray = [], // need this
        titlearray = [], // need this
        completedarray = [], // need this
        opacity = 0.15,
        colours = ["RGBA(160, 0, 46, " + opacity + ")", "RGBA(231, 163, 58, " + opacity + ")", "RGBA(244, 202, 88, " + opacity + ")", "RGBA(167, 194, 68, " + opacity + ")", "RGBA(68, 131, 146, " + opacity + ")", "RGBA(158, 184, 254, " + opacity + ")", "RGBA(231, 154, 255, " + opacity + ")", "RGBA(186, 94, 232, " + opacity + ")", "RGBA(67, 40, 187, " + opacity + ")"],
        now = new Date(),
        monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        dayNumbers = [31, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30],
        date = parseInt(now.getDate(), 10),
        yesterday = monthNames[now.getMonth()] + " " + (date - 1),
        today = monthNames[now.getMonth()] + " " + date,
        friday = monthNames[now.getMonth()] + " " + (date - 3), //for Mondays, which usually have items from the previous Friday
        dayOfWeek = moment().day(),
        clicked = false,
        resultClicked = false;
    confirmOnPageExit = function (e) {
        e = e || window.event;
        var message = 'You are about to leave the page; any progress you\'ve made will be lost! Are you sure?';
        if (e) {
            e.returnValue = message;
        }
        return message;
    };
    window.onbeforeunload = confirmOnPageExit;
    
    if (date - 1 === 0) {
        yesterday = monthNames[parseInt(now.getMonth(), 10) - 1] + " " + dayNumbers[parseInt(now.getMonth(), 10)];
    }
    
    $('#date-entry').datepicker({ dateFormat: "MM d" });
    $('#date-entry').datepicker("setDate", today);
    if (dayOfWeek === 1) {		    
        $('#date-entry').datepicker("setDate", friday);		
    } else {		
        $('#date-entry').datepicker("setDate", yesterday);		
    }
    
    // I believe this is now redundant, but commenting out in case
/*  $('#resultlist').on('click', '.toggle', function () {
        $(this).parent('li').find('.sectiontitle').toggleClass('hidden');
        $(this).parent('li').find('.related').toggleClass('hidden');
        $(this).parent('li').find('ul.context').toggleClass('hidden');
        $(this).parent('li.meta').toggleClass('isrelated');
        $(this).parent('li.meta').toggleClass('indent');
    }); */
    
    $('#help').click(function () {
        $('.helpbox').removeClass('hidden');
    });
    
    $('.helpbox').click(function () {
        $('.helpbox').addClass('hidden');
    });
    
    $('.resultlist').on('click', '.deleteButton', function () {
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
        $('#copy').prop('disabled', false).removeClass('disabled');
        
        //inits
        $('#resultlist').html('');
        $('h2').html('');
        $('h3').html('');
        
        $('input[name="rawurl"]').val("");
        $('input[name="publication"]').val("");
        $('input[name="pagetitle"]').val("");
        
        $('#pagination').children().remove().end();
        $('#subject').children().remove().end();
        
        urlarray = [];
        pubarray = [];
        titlearray = [];
        completedarray = [];
        
        $('.header').html("Wikimedia Foundation Media Report: " + monthNames[now.getMonth()] + " " + now.getDate() + ", " + now.getFullYear());
        $('.description').append("");

        var testData = $('textarea[name="urls"]').val(),
            urls = testData.splitNewline(),
            p = $('.loading').fadeIn().promise(),
            websiteName = "",
            postdata = "",
            titleStripped = "";
        
		$(urls).each(function () {
            var fetchURL = this,
                daction = "title",
                newURL = fetchURL.replace(reHTTP, ""),
                websiteName = newURL.replace(website, "").replace(trim, ""),
                e = 0,
                postdata = { action: daction, url: newURL };
            p = p.then(function () {
                return $.ajax({
                    type: "POST",
 //                 async: false, (Well, maybe....)
                    url: "https://testwiki.jamesryanalexander.com/meta/getmeta.php",
                    data: postdata,
                    dataType: 'json',
                    success: function (data) {
                        titleStripped = JSON.stringify(data).replace(/["']/g, "").replace(/\|.*/g, "");
                        urlarray.push(fetchURL);
                        pubarray.push(websiteName);
                        titlearray.push(titleStripped);
                    },
                    error: function (data) {
                        console.log("Error!");
				        console.log(data);
				    }
                });
            }).then(function (index) {
                console.log("Done URL ", e); // log it
                completedarray.push("&#x2716;");
                e = e + 1;
            }, function () {
                return $.Deferred().resolve(); // suppress request failure
            });
        });
        p.then(function () { // when all the actions are done
            $(".loading").fadeOut(); // when all done - fade out
            $("#form").removeClass('hidden');
            $(".counter").html("<span class='completed'>" + completedarray[u] + "</span> Item ");
            $('input[name="rawurl"]').val(urlarray[0]);
            $('input[name="publication"]').val(pubarray[0]);
            $('input[name="pagetitle"]').val(titlearray[0]);
            $(completedarray).each(function (index) {
                $($('<option>', {
                    value: "page" + (index + 1),
                    text: index + 1
                })).appendTo('.pagination');
            });
            $($('<option>', {
                value: "enteratopic",
                text: "Enter a topic below!"
            })).appendTo('#subject').attr('selected', 'selected');
            $('#form').removeClass('hidden');
        });
    });
    
    $('#newTopic').click(function () {
        var newTopic = $('input[name="newtopic"]').val(),
            topicTruncated = newTopic.replace(/\s+/g, '').toLowerCase();
        topics.push(newTopic);
        $($('<option>', {
            value: topicTruncated,
            text: newTopic
        })).appendTo('#subject').attr('selected', 'selected');
        
        $('input[name="newtopic"]').val("");
    });
    
    $('input[name="newtopic"]').keypress(function (e) {
        if (e.which === 13) {
            var newTopic = $('input[name="newtopic"]').val(),
                topicTruncated = newTopic.replace(/\s+/g, '').toLowerCase();
            topics.push(newTopic);
            $($('<option>', {
                value: topicTruncated,
                text: newTopic
            })).appendTo('#subject').attr('selected', 'selected');
        
            $('input[name="newtopic"]').val("");
        }
    });
    
    $('#pagination').change(function () {
        var newPage = $("#pagination option:selected").text() - 1;
        u = newPage;
        $('input[name="rawurl"]').val(urlarray[newPage]);
        $('input[name="publication"]').val(pubarray[newPage]);
        $('input[name="pagetitle"]').val(titlearray[newPage]);
        $(".counter").html("<span class='completed'>" + completedarray[newPage] + "</span> Item ");
        if (completedarray[newPage] === "&#10004;") {
            $("#pagination").css("background", "#29BD00");
        } else {
            $("#pagination").css("background", "#fff");
        }
    });
    
    $('#addNew').click(function () {
        if (clicked === false) {
            alert("Input your urls first.");
            return false;
        }
        var newURL = $('input[name="rawurl"]').val(),
            newPublication = $('input[name="publication"]').val(),
            newTitle = $('input[name="pagetitle"]').val(),
            newSubject = $('select[name="subject"]').children("option").filter(":selected").val(),
            newSubjectText = $('select[name="subject"]').children("option").filter(":selected").text(),
            newContext = $('input[name="context"]').val(),
            newDate = $('input[name="date-entry"]').val(),
            momentDate = moment(newDate, "MMMM D").dayOfYear(),
            ifStatement = "." + newSubject,
            newItem = "",
            random = Math.floor(Math.random() * 9);
        
        if (newSubject === "enteratopic") {
            alert("Please choose or add a topic/subject.");
            return false;
        }
        
        completedarray[u] = "&#10004;";
        $(".counter").html("<span class='completed'>" + completedarray[u] + "</span> Item ");
        if (completedarray[u] === "&#10004;") {
            $("#pagination").css("background", "#29BD00");
        } else {
            $("#pagination").css("background", "#fff");
        }

        if ($(".date" + momentDate)[0]) { //If there is a date already
            if ($(ifStatement)[0]) {
                $(".date" + momentDate).next(ifStatement).last().after("<li class='meta " + newSubject + "' style='background:" + colours[random] + "'><p class='deleteButton'>&#x2716;</p><span class='related'>Related Stories:<br/></span><span class='entry contenteditable' contenteditable='true'>" + newPublication + " - " + newTitle + "<br/></span>" + newURL + "<br /></li>");
            } else {
                $('.date' + momentDate).after("<li class='meta " + newSubject + "' style='background:" + colours[random] + "'><p class='deleteButton'>&#x2716;</p><span class='sectiontitle contenteditable' contenteditable='true'>" + newSubjectText + "<br/></span><span class='related hidden'>Related Stories:<br/></span><span class='entry contenteditable' contenteditable='true'>" + newPublication + " - " + newTitle + "<br/></span>" + newURL + "<br /><br /><ul class='context'><li class='contenteditable quote' contenteditable='true'>" + newContext + "<br/></li><br/></ul><br/></li>");
            }
        } else { //if there is not this date already
            if ($('.date')[0]) {
//                momentDate < $('.resultlist').find('.date').attr('id'));
                $('.resultlist').append("<li class='date date" + momentDate + "' id='" + momentDate + "'><p>" + newDate + "</p></li>").append("<li class='meta " + newSubject + "' style='background:" + colours[random] + "'><p class='deleteButton'>&#x2716;</p><span class='sectiontitle contenteditable' contenteditable='true'>" + newSubjectText + "<br/></span><span class='related hidden'>Related Stories:<br/></span><span class='entry contenteditable' contenteditable='true'>" + newPublication + " - " + newTitle + "<br/></span>" + newURL + "<br /><br /><ul class='context'><li class='contenteditable quote' contenteditable='true'>" + newContext + "<br/></li><br/></ul><br/></li>");
            } else {
                $('.resultlist').prepend("<li class='date date" + momentDate + "' id='" + momentDate + "'><p>" + newDate + "</p></li>").append("<li class='meta " + newSubject + "' style='background:" + colours[random] + "'><p class='deleteButton'>&#x2716;</p><span class='sectiontitle contenteditable' contenteditable='true'>" + newSubjectText + "<br/></span><span class='related hidden'>Related Stories:<br/></span><span class='entry contenteditable' contenteditable='true'>" + newPublication + " - " + newTitle + "<br/></span>" + newURL + "<br /><br /><ul class='context'><li class='contenteditable quote' contenteditable='true'>" + newContext + "<br/></li><br/></ul><br/></li>");
            }
        }
        u = u + 1;
        if (u >= urlarray.length) {
            u = 0;
        }
        $('input[name="rawurl"]').val(urlarray[u]);
        $('input[name="publication"]').val(pubarray[u]);
        $('input[name="pagetitle"]').val(titlearray[u]);
        $(".counter").html("<span class='completed'>" + completedarray[u] + "</span> Item ");
        $("#pagination").val("page" + (u + 1));
        if (completedarray[u] === "&#10004;") {
            $("#pagination").css("background", "#29BD00");
        } else {
            $("#pagination").css("background", "#fff");
        }
        var firstComplete = !!completedarray.reduce(function (a, b) { return (a === b) ? a : NaN; }); // From http://stackoverflow.com/a/21266395
        if (firstComplete === true) {
            $(".counter").html("<span class='finished'>It looks like all URLs have been processed!</span><br/><span class='finished'>Hit \"copy to clipboard\" to finish.</span><br/><span class='completed'>" + completedarray[u] + "</span> Item ");
        }
    });
    
//    $('#next-url').click(function () {
        
});

    



function SelectText() { //this code from https://stackoverflow.com/questions/985272/selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
    "use strict";
    
    var doc = document,
        text = $('.results-wrapper').parent().find('.results-wrapper'),
        range,
        selection,
        successful,
        reportSummary,
        k = 0;
    
    $('#form').addClass('hidden');
    
    reportSummary = prompt("Please enter a description to go underneath the date on this media report.");
    
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
    
    $('.toggle').remove();
    $('.description').html(reportSummary);

    if (doc.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(text[0]);
        range.select();
    } else if (window.getSelection) {
        selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(text[0]);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    successful = document.execCommand('copy');
    alert('Copied to clipboard!');
    // "Optional" remove selected text
    selection.removeAllRanges();
}