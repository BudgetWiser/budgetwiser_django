Article = {};
Article.DATA = {};

Article.initialize = function(){
};

// RANGE

Range.DATA = {};

Range.initialize = function(){
    Range.menu_elm = $('.menu-button');
    Range.menu.add_q_btn = $('button.add-question');
    Range.menu.add_f_btn = $('button.add-factcheck');
    Range.menu.add_f_elm = $('div.menu-add-factcheck');
    Range.menu.add_f_elm_input = $('.fc-ref-input-section>input');
    Range.menu.add_f_elm_close = $('.fc-submit>button.cancel');
    Range.range_elm = $('#highlight-section');
    Range.button_elm = $('#button-section');

    Range.registerHandlers();
    Range.basePos();
};

Range.registerHandlers = function(){
    $(document).bind('mouseup', function(){Range.check()});
    $(document).bind('mousedown', function(){window.getSelection().removeAllRanges()});
    $(window).on('resize', function(){Range.basePos()});
    $(Range.menu.add_q_btn).bind('click', function(){Range.menu.addQuestion()});
    $(Range.menu.add_f_btn).bind('click', function(){Range.menu.addFactcheck()});
    $(Range.menu.add_f_elm_close).bind('click', function(){Range.close(Range.menu.add_f_elm)});
};

Range.close = function(elm){
    window.getSelection().removeAllRanges()
    $(elm).fadeIn(100, function(){
        $(this).hide();
    });
    $('.range-temp').remove();
};

Range.basePos = function(){
    Range.DATA.base_pos = $("#article-wrapper").position();
};

Range.check = function(){
    var range, sp;

    try{
        range = window.getSelection().getRangeAt(0);
        sp = range.startContainer.parentElement, ep = range.endContainer.parentElement;

        if(sp.id == ep.id && sp.className == "article-paragraph" && range.toString() != ""){
            Range.DATA.this_range = range;
            Range.menu.open(1);
        }else{
            Range.menu.open(0);
        }
    }catch(err){
        Range.menu.open(0);
    }
};

Range.addRange = function(comp_func){
    var range =  Range.DATA.this_range;
    var pre_range = range.cloneRange();
    var parent_elm = range.startContainer.parentElement.id;
    var container = document.getElementById(parent_elm);

    pre_range.selectNodeContents(container);
    pre_range.setEnd(range.startContainer, range.startOffset);

    var start = pre_range.toString().length;
    var end = start + range.toString().length;

    var paragraph_id = parent_elm.split("p-")[1];

    $.ajax({
        type: 'GET',
        url: '/annote/api/saverange/',
        data: {
            'parent_elm': parent_elm,
            'start': start,
            'end': end,
            'paragraph_id': paragraph_id,
        },
        dataType: 'json',
        success: function(resObj){
            if(resObj.type == 0){
                var hl = $('.range-temp').clone();
                hl.removeClass('range-temp').attr('id', 'r-' + resObj.id).hide();
                $(Range.range_elm).append(hl);
            }
            comp_func(resObj.id, resObj.type);
        },
        error: function(xhr){
            console.log(xhr.responseText);
        }
    });
};

Range.addFactcheckDot = function(range_id){
    var fc_hl = $('#r-'+range_id);
    var pos = {
        'top': parseInt($(fc_hl).css('top')) + parseInt($(fc_hl).css('height')) - 8,
        'left': parseInt($(fc_hl).css('left')) + parseInt($(fc_hl).css('width')) - 10
    };
    var fc_btn = $('<button type="button"></button>');
    $(fc_btn).addClass('fc-btn').attr('id', 'b-' + range_id).hide();
    $(fc_btn).css({
        'top': pos.top,
        'left': pos.left
    });
    $(Range.button_elm).append(fc_btn);

    return fc_btn;
};

Range.moverFactcheckDot = function(){
    var fc_btns = $('.fc-btn');

    $(fc_btns).unbind('mouseover');
    $(fc_btns).bind('mouseover', function(){
        var fc_id = parseInt((this).attr('id'));
    });
};

Range.menu = {};

Range.menu.open = function(st){
    if(st == 0){
        $(Range.menu_elm).stop();
        $(Range.menu_elm).fadeOut(100, function(){
            $(this).hide();
        });
    }else if(st == 1){
        var range = Range.DATA.this_range;
        var rects = range.getClientRects();
        var rect = rects[rects.length-1];

        var offset = $('#wrapper').offset();


        $(Range.menu_elm).css({
            'top': rect.top-Range.DATA.base_pos.top-offset.top+rect.height,
            'left': rect.left-Range.DATA.base_pos.left-offset.left+rect.width/2-36,
        });
        $(Range.menu_elm).fadeIn(100);
    }
};

Range.menu.setTempRange = function(){
    var range = Range.DATA.this_range;
    var rects = range.getClientRects();

    for(var i=0; i<rects.length; i++){
        var rect = $('<span></span>');
        var offset = $('#wrapper').offset();
        rect.addClass('range-temp highlight').css({
            'top': rects[i].top-Range.DATA.base_pos.top-offset.top,
            'left': rects[i].left-Range.DATA.base_pos.left-offset.left,
            'width': rects[i].width,
            'height': rects[i].height,
            'display': 'block',
        });
        $(Range.range_elm).append(rect);
    }
    window.getSelection().removeAllRanges();
    Range.menu.open(0);
};

Range.menu.addQuestion = function(){
    console.log("ADD QUESTION");
};

Range.menu.addFactcheck = function(){
    $(document).unbind('mouseup').unbind('mousedown');
    Range.menu.setTempRange();

    var range = Range.DATA.this_range;
    var rects = range.getClientRects();
    var rect = rects[rects.length-1];

    var offset = $('#wrapper').offset();

    $(Range.menu.add_f_elm).css({
        'top': rect.top-Range.DATA.base_pos.top-offset.top+rect.height-4,
        'left': rect.left-Range.DATA.base_pos.left-offset.left+rect.width/2-103,
    });
    $(Range.menu.add_f_elm_input).val('');
    $(Range.menu.add_f_elm).fadeIn(100);
    Range.menu.addFactcheck.scoreInput();

    $('.fc-submit>button.submit').click(function(){
        $(this).html('잠시만 기다려 주세요.').attr('disabled', 'disabled').css({'color':'#868d8e'});
        $(Range.menu.add_f_elm_close).hide();

        var score = Range.menu.addFactcheck.score;
        var ref = $(Range.menu.add_f_elm_input).val();
        var fc_btn;

        if(score > -1 && ref != ''){
            Range.addRange(function(range_id, type){
                $.ajax({
                    type: 'GET',
                    url: '/annote/api/savefactcheck/',
                    data: {
                        'score': score,
                        'ref': ref,
                        'range_id': range_id
                    },
                    success: function(resObj){
                        var fc_hl = $('#r-' + range_id);
                        if(type == 0){
                            fc_btn = Range.addFactcheckDot(range_id);
                            $(document).bind('mouseup', function(){Range.check()});
                            $(document).bind('mousedown', function(){window.getSelection().removeAllRanges()});
                        }else{
                            fc_btn = $('#b-'+range_id);
                            $(fc_btn).animate({
                                left: '+=2'
                            }, 100, function(){$(this).animate({right: '-=1'}, 100)});
                            $(document).bind('mouseup', function(){Range.check()});
                            $(document).bind('mousedown', function(){window.getSelection().removeAllRanges()});
                        }
                        $(fc_btn).fadeIn(100);
                        Range.close(Range.menu.add_f_elm);
                        $('.fc-submit>button.submit').html('등록하기').show().removeAttr('disabled').css({'color':'#08afd8'});
                        $(Range.menu.add_f_elm_close).show();
                    },
                    error: function(xhr){
                        console.log(xhr.responseText);
                    }
                });
            });
        }else{
            alert("NONO!");
            $('.fc-submit>button.submit').html('등록하기').show().removeAttr('disabled').css({'color':'#08afd8'});
            $(Range.menu.add_f_elm_close).show();
        }
    });
};

Range.menu.addFactcheck.scoreInput = function(){
    var score_btn = $('.fc-score-input-section>button');
    var score_list = $('.fc-score-input-section');
    var score = -1, btn_in = 0;
    var btn_on = {'background-position': '0 -24px'}, btn_off = {'background-position': '0 0'};

    $(score_btn).css(btn_off);

    score_btn.each(function(i, elm){
        $(elm).bind('mouseenter', function(){
            $(score_btn).css(btn_off);
            for(var j=0; j<=i; j++){
                $(score_btn[j]).css(btn_on);
            }
        });
        $(elm).bind('click', function(){
            Range.menu.addFactcheck.score  = score = i;
        });
    });
    score_list.mouseleave(function(){
        $(score_btn).css(btn_off);
        if(score>-1){
            for(var j=0; j<=score; j++){
                $(score_btn[j]).css(btn_on);
            }
        }
    });
};
