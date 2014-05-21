Interface = {};

Interface.initialize = function(){
    Interface.fc_btn = $(".fc-btn-01");
    Interface.fc_sum = $(".fc-sum-01");
    Interface.fc_hl = $(".hl-01");
    Interface.menu = $(".menu-button");
    Interface.fc_list = $(".fc-list-01");

    Interface.registerHandlers();
    Interface.factCheck();
    Interface.checkHighlight();
};

Interface.registerHandlers = function(){
    $(Interface.fc_btn).click(function(){Interface.factCheckList();});
};

Interface.factCheck = function(){
    $(Interface.fc_hl).css('background', 'rgba(255,202,17,0.2)');
    $(Interface.fc_btn).mouseover(function(){
        $(Interface.fc_sum).fadeIn('fast');
        $(Interface.fc_hl).fadeIn('fast');
    });
    $(Interface.fc_btn).mouseout(function(){
        $(Interface.fc_sum).fadeOut('fast', function(){
            $(this).hide();
        });
        $(Interface.fc_hl).fadeOut('fast', function(){
            $(this).hide();
        });
    });
};

Interface.checkHighlight = function(){
    $(document).mouseup(function(){
        var sel = window.getSelection().getRangeAt(0);
        var art_sp = sel.startContainer.parentElement.id == "article-section";
        var art_ep = sel.endContainer.parentElement.id == "article-section";

        if(sel.toString() != "" && art_sp && art_ep){
            var rects = sel.getClientRects();
            var lrect = rects[rects.length-1];

            Interface.openMenu(lrect);
            $("button.add-factchecker").click(function(){
                Interface.saveRange();
            });
        }else{
            $(Interface.menu).stop();
            $(Interface.menu).fadeOut(100, function(){
                $(this).hide();
            });
        }
    });
};

Interface.openMenu = function(rect){
    var base_pos = $("#article-wrapper").position();
    var calc_pos = {
        'top': rect.top-base_pos.top,
        'left': rect.left-base_pos.left,
        'width': rect.width,
        'height': rect.height
    };
    var menu_pos = {
        'top': calc_pos.top+(calc_pos.height-2),
        'left': calc_pos.left+(calc_pos.width/2)-36
    };

    $(Interface.menu).css({
        'top': menu_pos.top,
        'left': menu_pos.left
    });
    $(Interface.menu).fadeIn(100);
};

Interface.factCheckList = function(){
    if($(Interface.fc_list).is(':hidden')){
        $(Interface.fc_btn).css({
            'background-image': 'url("/media/res/btn_fc_list_close.png")'
        });
        $(Interface.fc_list).fadeIn(100);
        $(Interface.fc_btn).unbind('mouseover').unbind('mouseout');
        $(Interface.fc_hl).css('background', 'rgba(255,202,17,0.5)');
        $(Interface.fc_sum).fadeOut(100, function(){$(this).hide();});
    }else{
        $(Interface.fc_btn).css({
            'background-image': 'url("/media/res/btn_fc_list.png")'
        });
        $(Interface.fc_list).stop();
        $(Interface.fc_list).fadeOut(100, function(){
            $(this).hide();
            $(Interface.fc_sum).fadeIn(100);
            Interface.factCheck();
        });
    }
};

Interface.saveRange = function(){
    var container = document.getElementById("article-section");
    var range = window.getSelection().getRangeAt(0);
    var pre_range = range.cloneRange();

    pre_range.selectNodeContents(container);
    pre_range.setEnd(range.startContainer, range.startOffset);

    var container_id = range.startContainer.parentElement.id;
    var start = pre_range.toString().length;
    var end = start + range.toString().length;

    $.ajax({
        type: 'GET',
        url: '/annote/saverange/',
        data: {'container_id':container_id, 'start':start, 'end':end},
        success: function(resObj){
            console.log(resObj);
        },
        error: function(xhr){
            console.log(xhr.responseText);
        }
    });
};

Interface.loadRange = function(){
    $.ajax({
        type: 'GET',
        url: '/annote/loadrange/',
        dataType:'json',
        success: function(resObj){
            Interface.makeRects(resObj);
        },
        error: function(xhr){
            console.log(xhr.responseText);
        }
    });
};

Interface.makeRects = function(ranges){
    $("#highlight-section").html("");
    var base_pos = $("#article-wrapper").position();

    for(var i=0;i<ranges.length;i++){
        var container = document.getElementById(ranges[i].container_id);
        var new_range = Interface.restoreSelection(container, {'start':ranges[i].start, 'end':ranges[i].end});
        var rects = new_range.getClientRects();
        console.log(rects);
        for(var j=0;j<rects.length;j++){
            var rect = rects[j];
            var calc_pos = {
                'top': rect.top-base_pos.top,
                'left': rect.left-base_pos.left,
                'width': rect.width,
                'height': rect.height
            };
            var span = $("<span></span>");
            span.addClass("hl-01").css({
                    'top': calc_pos.top,
                    'left': calc_pos.left,
                    'width': calc_pos.width,
                    'height': calc_pos.height,
                    'display': 'block'
            });

            $("#highlight-section").append(span);
        }
    }
};

Interface.restoreSelection = function(containerEl, savedSel) {
    var charIndex = 0, range = document.createRange();
    range.setStart(containerEl, 0);
    range.collapse(true);
    var nodeStack = [containerEl], node, foundStart = false, stop = false;
    while (!stop && (node = nodeStack.pop())) {
        if (node.nodeType == 3) {
            var nextCharIndex = charIndex + node.length;
            if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
                range.setStart(node, savedSel.start - charIndex);
                foundStart = true;
            }
            if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
                range.setEnd(node, savedSel.end - charIndex);
                stop = true;
            }
            charIndex = nextCharIndex;
        } else {
            var i = node.childNodes.length;
            while (i--) {
                nodeStack.push(node.childNodes[i]);
            }
        }
    }
    return range
};
