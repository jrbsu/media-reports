/*jslint browser: true*/
/*global $, jQuery, alert, console, moment, window, document*/
$(document).ready(function () {
    "use strict";
    
    $(".resultlist").sortable({cancel: ".contenteditable,.deleteButton,.isrelated"});

	String.prototype.splitNewline = function () {
		return this.split(/\r\n|\r|\n/);
	};
    
    function confirmExit() {
        return 'Are you sure you want to quit?';
    }

    window.onbeforeunload = confirmExit;

	var reHTTP = new RegExp("h.*://"),
        website = new RegExp("www."),
        trim = new RegExp("\/.*"),
        topics = [],
        i = 0,
        sessions = 0,
        u = 0,
        y = 0,
        urlarray = [], // need this
        pubarray = [], // need this
        titlearray = [], // need this
        completediconarray = [], // need this
        completedarray = [],
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
    
    if (date - 1 === 0) {
        yesterday = monthNames[parseInt(now.getMonth(), 10) - 1] + " " + dayNumbers[parseInt(now.getMonth(), 10)];
    }
    
    $('#date-entry').datepicker({
        dateFormat: "MM d",
        showOtherMonths: true,
        selectOtherMonths: true
    });
    if (dayOfWeek === 1) {
        $('#date-entry').datepicker("setDate", friday);
    } else {
        $('#date-entry').datepicker("setDate", yesterday);
    }
    
    $('.date-yesterday').click(function () {
        $('#date-entry').datepicker("setDate", yesterday);
    });
    
    $('.date-today').click(function () {
        $('#date-entry').datepicker("setDate", today);
    });
    
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
        var currentItem = 0;
        if (clicked === true) {
            var r = window.confirm("This will erase what you've already done!\n\nAre you sure?");
            if (r === false) {
                return false;
            }
        }
        clicked = true;
        sessions++;
        $('#copy').prop('disabled', false).removeClass('disabled');
        $('#errorlog-content').prepend("<ul class='errorlog-entry'><span style='font-weight: 700; color: purple;'>Session number " + sessions + " started!</span>")

        
        //inits
        $('.resultlist').html('');
        $('h2').html('');
        $('h3').html('');
        u = 0;
        
        $('input[name="rawurl"]').val("");
        $('input[name="publication"]').val("");
        $('input[name="pagetitle"]').val("");
        $('.overview').html('<tr class="table-row"><th>Title</th><th>Publisher</th><th>Status</th></tr>');
        
        $('#pagination').children().remove().end();
        $('#subject').children().remove().end();
        
        urlarray = [];
        pubarray = [];
        titlearray = [];
        completediconarray = [];
        
        $('.header').html("Wikimedia Foundation Media Report: " + monthNames[now.getMonth()] + " " + now.getDate() + ", " + now.getFullYear());
        $('.description').append("");

        var testData = $('textarea[name="urls"]').val(),
            urls = testData.splitNewline(),
            p = $('.loading').fadeIn().promise(),
            websiteName = "",
            postdata = "",
            titleStripped = "";
        
        $('#errorlog').removeClass('hidden');
        
		$(urls).each(function (index) {
            var fetchURL = this,
                daction = "title",
                newURL = fetchURL.replace(reHTTP, ""),
                websiteName = newURL.replace(website, "").replace(trim, ""),
                postdata = { action: daction, url: newURL };
            currentItem = currentItem + 1;
            p = p.then(function () {
                return $.ajax({
                    type: "POST",
 //                 async: false, (Well, maybe....)
                    url: "https://tools.wmflabs.org/media-reports/getmetadata/getmeta.php",
                    data: postdata,
                    dataType: 'json',
                    success: function (data) {
                        titleStripped = JSON
                            .stringify(data)
                            .replace(/\"/g, "")
                            .replace(/\\/g, "\"")
                            .replace(/\|.*/g, "")
                            .replace(/\|.*/g, "")
                            .replace(/(\\t|\\n|\s\s|\\r)/g, "");
                        urlarray.push(fetchURL);
                        pubarray.push(websiteName);
                        titlearray.push(titleStripped);
                    },
                    error: function (data) {
                        console.log("Error fetching URL " + (index + 1) + " (" + urls[index] + "). Perhaps the internet is unreachable.");
                        $('#errorlog-content').prepend("<ul class='errorlog-entry'><span style='font-weight: 700; color: red;'>Error</span> fetching URL " + (index + 1) + " (" + urls[index] + "). Perhaps the internet is unreachable, or there was a problem accessing the PHP data. See the console for more info.</ul>")
				        console.log(data);
                    }
                });
            }).then(function (index) {
                console.log("Done URL ", currentItem + " (" + titleStripped + ")"); // log it
                $('#errorlog-content').prepend("<ul class='errorlog-entry'><span style='font-weight: 700; color: green;'>Done</span> fetching URL " + (index + 1) + " (" + urls[index] + ")!</ul>")
                $('.loadbar').css("width", currentItem / urls.length+"%");
                completedarray.push(false);
                completediconarray.push("&#x2716;");
            }, function () {
                return $.Deferred().resolve(); // suppress request failure
            });
        });
        p.then(function () { // when all the actions are done
            $(".loading").fadeOut(); // when all done - fade out
            $("#form").removeClass('hidden');
            $(".counter").html("<span class='completed'>" + completediconarray[u] + "</span> Item ");
            $('input[name="rawurl"]').val(urlarray[0]);
            $('input[name="publication"]').val(pubarray[0]);
            $('input[name="pagetitle"]').val(titlearray[0]);
            $(completediconarray).each(function (index) {
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
            
            $("#pagination").css("background", "#fff");
            for (var i = 0; i < completediconarray.length; i++) {
                $('.overview').append('<tr><td>' + titlearray[i] + '</td><td>' + pubarray[i] + '</td><td class="status">' + completediconarray[i] + '</td></tr>');
            }
        });
    });
    
    $('#overview-button').click(function () {
        $('.overview').toggleClass('hidden');
    });
    
    $('#newTopic').click(function () {
        var newTopic = $('input[name="newtopic"]').val(),
            topicTruncated = newTopic.replace(/[$-/:-?\{-~!"^_`\[\]@\s\\#]/g, '').toLowerCase();
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
                topicTruncated = newTopic
                    .replace(/[$-/:-?{-~!"^_`\[\]@\s\\#]/g, '')
                    .toLowerCase();
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
        $(".counter").html("<span class='completed'>" + completediconarray[newPage] + "</span> Item ");
        if (completediconarray[u] === "&#10004;") {
            $("#pagination").css("background", "#29BD00");
        } else if (completediconarray[u] === "&#9716;") {
            $("#pagination").css("background", "#c60");
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
            ifStatement = ".date" + momentDate + " ~  ." + newSubject,
            newItem = "",
            random = Math.floor(Math.random() * 9);
        
        if ($('input[name="newtopic"]').val() !== "") {
            var newTopic = $('input[name="newtopic"]').val(),
                topicTruncated = newTopic.replace(/[$-/:-?{-~!"^_`\[\]@\s\\#]/g, '').toLowerCase();
            topics.push(newTopic);
            $($('<option>', {
                value: topicTruncated,
                text: newTopic
            })).appendTo('#subject').attr('selected', 'selected');
            newSubject = topicTruncated;
            newSubjectText = newTopic;
            $('input[name="newtopic"]').val("");
        } else if (newSubject === "enteratopic") {
            alert("Please choose or add a topic/subject.");
            return false;
        }
        
        completediconarray[u] = "&#10004;";
        completedarray[u] = true;
        $(".counter").html("<span class='completed'>" + completediconarray[u] + "</span> Item ");
        if (completediconarray[u] === "&#10004;") {
            $("#pagination").css("background", "#29BD00");
        } else if (completediconarray[u] === "&#9716;") {
            $("#pagination").css("background", "#c60");
        } else {
            $("#pagination").css("background", "#fff");
        }

        if ($(".date" + momentDate)[0]) { //If there is this date already
            if ($(ifStatement)[0]) { //This is a related
                $(ifStatement).append("<li class='meta-li " + newSubject + " isrelated related' style='background:" + colours[random] + "'><p class='deleteButton'>&#x2716;</p><span class='entry contenteditable' contenteditable='true'>" + newPublication + " - " + newTitle + "<br/></span><a class='article-link' href='" + newURL + "'>" + newURL + "</a><br /></li>");
            } else {
                $('.date' + momentDate).after("<div class='meta " + newSubject + "' style='background:" + colours[random] + "'><p class='deleteButton'>&#x2716;</p><span class='sectiontitle contenteditable' contenteditable='true'>" + newSubjectText + "<br/></span><span class='entry contenteditable' contenteditable='true'>" + newPublication + " - " + newTitle + "<br/></span><a class='article-link' href='" + newURL + "'>" + newURL + "</a><br /><br /><ul class='context'><li class='contenteditable quote' contenteditable='true'>" + newContext + "<br/></li><br/></ul></div>");
                $('.sortkey').append("<li class='sortitem' id='" + newSubject + "'><p>" + newSubjectText + "</p></li>");
            }
        } else { //if there is not this date already
            if ($('.date')[0]) { //...but there is *a* date of some kind
/*              if ($($('.date')[0]).attr('id') ==  */
                $('.resultlist').append("<li class='date date" + momentDate + "' id='" + momentDate + "'><p>" + newDate + "</p></li>").append("<div class='meta " + newSubject + "' style='background:" + colours[random] + "'><p class='deleteButton'>&#x2716;</p><span class='sectiontitle contenteditable' contenteditable='true'>" + newSubjectText + "<br/></span><span class='entry contenteditable' contenteditable='true'>" + newPublication + " - " + newTitle + "<br/></span><a class='article-link' href='" + newURL + "'>" + newURL + "</a><br /><br /><ul class='context'><li class='contenteditable quote' contenteditable='true'>" + newContext + "<br/></li><br/></ul></div>");
                $('.sortkey').append("<li class='sortitem-date' id='" + momentDate + "'><p>" + newDate + "</p></li>").append("<li class='sortitem' id='" + newSubject + "'><p>" + newSubjectText + "</p></li>");
            } else {
                $('.resultlist').prepend("<li class='date date" + momentDate + "' id='" + momentDate + "'><p>" + newDate + "</p></li>").append("<div class='meta " + newSubject + "' style='background:" + colours[random] + "'><p class='deleteButton'>&#x2716;</p><span class='sectiontitle contenteditable' contenteditable='true'>" + newSubjectText + "<br/></span><span class='entry contenteditable' contenteditable='true'>" + newPublication + " - " + newTitle + "<br/></span><a class='article-link' href='" + newURL + "'>" + newURL + "</a><br /><br /><ul class='context'><li class='contenteditable quote' contenteditable='true'>" + newContext + "<br/></li><br/></ul></div>");
                $('.sortkey').append("<li class='sortitem-date' id='" + momentDate + "'><p>" + newDate + "</p></li>").append("<li class='sortitem' id='" + newSubject + "'><p>" + newSubjectText + "</p></li>");
            }
        }
        $('.status').eq(u).html("&#10004;");
        u = u + 1;
        $(".overview tr:nth-child(" + (u + 1) + ")").css("background","#9AF500");
        if (u >= urlarray.length) {
            u = 0;
        }
        $('input[name="rawurl"]').val(urlarray[u]);
        $('input[name="publication"]').val(pubarray[u]);
        $('input[name="pagetitle"]').val(titlearray[u]);
        $('input[name="context"]').val("");
        $(".counter").html("<span class='completed'>" + completediconarray[u] + "</span> Item ");
        $("#pagination").val("page" + (u + 1));
        if (completediconarray[u] === "&#10004;") {
            $("#pagination").css("background", "#29BD00");
        } else if (completediconarray[u] === "&#9716;") {
            $("#pagination").css("background", "#c60");
        } else {
            $("#pagination").css("background", "#fff");
        }
        var firstComplete = !!completedarray.reduce(function (a, b) { return (a === b) ? a : NaN; }); // From http://stackoverflow.com/a/21266395
        if (firstComplete === true) {
            $(".counter").html("<span class='finished'>It looks like all URLs have been processed!</span><br/><span class='finished'>Sort them into your preferred order, then hit \"copy to clipboard\" to finish.</span><br/><span class='completed'>" + completediconarray[u] + "</span> Item ");
        }
    });
    
    $('#ignore').click(function () {
        completediconarray[u] = "&#9716;";
        $('.status').eq(u).html("&#9716;");
        completedarray[u] = true;
        u = u + 1;
        $(".overview tr:nth-child(" + (u + 1) + ")").css("background","#F5B42A");
        if (u >= urlarray.length) {
            u = 0;
        }
        $(".counter").html("<span class='completed'>" + completediconarray[u] + "</span> Item ");
        $("#pagination").val("page" + (u + 1));
        if (completediconarray[u] === "&#10004;") {
            $("#pagination").css("background", "#29BD00");
        } else if (completediconarray[u] === "&#9716;") {
            $("#pagination").css("background", "#c60");
        } else {
            $("#pagination").css("background", "#fff");
        }
        $('input[name="rawurl"]').val(urlarray[u]);
        $('input[name="publication"]').val(pubarray[u]);
        $('input[name="pagetitle"]').val(titlearray[u]);
        $('input[name="context"]').val("");
        var firstComplete = !!completedarray.reduce(function (a, b) { return (a === b) ? a : NaN; }); // From http://stackoverflow.com/a/21266395
        if (firstComplete === true) {
            $(".counter").html("<span class='finished'>It looks like all URLs have been processed!</span><br/><span class='finished'>Hit \"copy to clipboard\" to finish.</span><br/><span class='completed'>" + completediconarray[u] + "</span> Item ");
        }
    });
    
    // SORTING CODE - NOT ACTIVE
    
    $(".sortkey").sortable({
        start: function (event, ui) {
            $(this).data("elPos", ui.item.index());
        },
        update: function (event, ui) {
            var origPos = $(this).data("elPos");
            $(".resultlist").each(function (i, e) {
                if (origPos > ui.item.index()) {
                    $(this).children("li:eq(" + origPos + ")").insertBefore($(this).children("li:eq(" + ui.item.index() + ")"));
                } else {
                    $(this).children("li:eq(" + origPos + ")").insertAfter($(this).children("li:eq(" + ui.item.index() + ")"));
                }
            })
        }
    }).disableSelection();
        
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
    
    $('.quote').each(function () {
        if ($(this).html() === "<br>") {
            $(this).parent().remove();
        }
    });
    
    $('.meta').each(function () {
        $(this).append("<br />");
        if ($(this).find(".related")) {
            $(this).find(".related").eq(0).prepend('<span class="related">Related Stories:</span><br />');
        }
    });
    
    $('.meta-li').each(function () {
        $(this).append("<br />");
    });
    
    $('.toggle').remove();
    $('li').css({"font-size": "10pt"});
    $('div').css({"font-size": "10pt"});
    $('.meta').css({"background": "none", "border": "none", "padding": "0", "margin": "0"});
    $('.meta-li').css({"background": "none", "border": "none", "padding": "0", "margin": "0"});
    $('.date').css({"background": "none", "border": "none", "padding": "0", "margin": "0"});
    $('li.quote').css({"padding": "0", "background": "none", "box-shadow": "none"});
    
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