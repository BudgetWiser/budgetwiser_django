url_regexp = /(?:(?:(https?|ftp|telnet):\/\/|[\s\t\r\n\[\]\`\<\>\"\'])((?:[\w$\-_\.+!*\'\(\),]|%[0-9a-f][0-9a-f])*\:(?:[\w$\-_\.+!*\'\(\),;\?&=]|%[0-9a-f][0-9a-f])+\@)?(?:((?:(?:[a-z0-9\-가-힣]+\.)+[a-z0-9\-]{2,})|(?:[\d]{1,3}\.){3}[\d]{1,3})|localhost)(?:\:([0-9]+))?((?:\/(?:[\w$\-_\.+!*\'\(\),;:@&=ㄱ-ㅎㅏ-ㅣ가-힣]|%[0-9a-f][0-9a-f])+)*)(?:\/([^\s\/\?\.:<>|#]*(?:\.[^\s\/\?:<>|#]+)*))?(\/?[\?;](?:[a-z0-9\-]+(?:=[^\s:&<>]*)?\&)*[a-z0-9\-]+(?:=[^\s:&<>]*)?)?(#[\w\-]+)?)/gmi;

var Range = {};

Range.initialize = function(){
    Range.wrapper = $('#article-wrapper');

    Range.sec_menu = $('.menu-button');
    Range.btn_add_q = $('.menu-button>button.add-question');
    Range.btn_add_f = $('.menu-button>button.add-factcheck');
    Range.sec_add_f = $('.menu-add-factcheck');
    Range.sec_add_f_input = $('.fc-ref-input-section>input');
    Range.sec_add_f_score_btn = $('.fc-score-input-section>button');
    Range.sec_add_f_score_sec = $('.fc-score-input-section');
    Range.sec_add_f_submit = $('.fc-submit>button.submit');
    Range.sec_add_f_close = $('.fc-submit>button.cancel');

    Range.sec_range = $('#highlight-section');
    Range.sec_button = $('#button-section');
    Range.sec_average = $('#fc-sum-section');

    Range.sec_add_q = $('.menu-add-question');
    Range.sec_add_q_close = $('.menu-add-question>button.q-close');
    Range.sec_add_q_submit = $('.menu-add-question>button.q-submit');
    Range.sec_add_q_input = $('.menu-add-question>.q-input');

    Range.registerHandlers();
    Range.getRange();
};

Range.registerHandlers = function(){
    $(document).bind('mouseup', function(event){
        if($(event.target).parents().length <= 6){
            Range.check();
        }
    });
    $(document).bind('mousedown', function(event){
        if($(event.target).parents().length <= 6){
            window.getSelection().removeAllRanges()
        }
    });
    $(Range.sec_add_f_close).bind('click', function(){Range.close(Range.sec_add_f)});
    $(Range.sec_add_q_close).bind('click', function(){Range.close(Range.sec_add_q)});
};

Range.getRange = function(){
    var paragraphs = [];

    for(var i=0; i<Article.DATA.paragraphs.length; i++){
        paragraphs.push(Article.DATA.paragraphs[i].id);
    }

    $.ajax({
        type: 'GET',
        url: '/annote/api/getrange/',
        data: {
            'paragraphs': JSON.stringify(paragraphs)
        },
        dataType: 'json',
        success: function(resObj){
            Range.drawRange(resObj);
        },
        error: function(xhr){
            console.log(xhr.responseText);
        }
    });
};

Range.drawRange = function(obj){
    var base_pos = $(Range.wrapper).position();
    console.log(base_pos);

    for(var i=0; i<obj.length; i++){
        var container = document.getElementById(obj[i].parent_elm);
        var new_range = Range.restoreRange(container, {'start': obj[i].start, 'end': obj[i].end});

        var rects = new_range.getClientRects();

        for(var j=0; j<rects.length; j++){
            var rect = rects[j];
            var pos = {
                'top': rect.top - base_pos.top,
                'left': rect.left - base_pos.left,
                'width': rect.width,
                'height': rect.height
            };
            var span = $('<span></span>');
            $(span).css(pos).addClass('highlight').addClass('r-'+obj[i].id);
            $(Range.sec_range).append(span);

        }

        // for factcheck button

        if(obj[i].f_count > 0){
            var d = Range.addFactcheck.newDot(obj[i].id);
            Range.averageView(obj[i].id, obj[i].f_average);
            Range.dotAction(d);
            $(d).fadeIn(100);
        }
    }
};

Range.averageView = function(obj_id, obj_avg){
    var btn = $('#b-' + obj_id);
    var avg = $('<div></div>');
    var bar = $('<span></span>');
    var pos = {
        'top': parseInt($(btn).css('top')) - 7,
        'left': parseInt($(btn).css('left')) + 20
    }

    $(avg).addClass('fc-sum').attr('id', 'a-'+obj_id);

    var c = parseInt(obj_avg);
    var l =obj_avg % 1;
    var bar_width = 4*(c-1) + 18*c + 18*l;

    $(bar).css('width', bar_width).addClass('fc-sum-bar');
    $(avg).append($('<span class="fc-sum-front"></span>'))
          .append(bar)
          .append($('<span class="fc-sum-back"></span>'))
          .css(pos).hide();

    $(Range.sec_average).append(avg);
};

Range.restoreRange = function(containerEl, savedSel){
    var charIndex = 0, range = document.createRange();
    range.setStart(containerEl, 0);
    range.collapse(true);
    var nodeStack = [containerEl], node, foundStart = false, stop = false;
    while(!stop && (node = nodeStack.pop())){
        if(node.nodeType == 3){
            var nextCharIndex = charIndex + node.length;
            if(!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex){
                range.setStart(node, savedSel.start - charIndex);
                foundStart = true;
            }
            if(foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex){
                range.setEnd(node, savedSel.end - charIndex);
                stop = true;
            }
            charIndex = nextCharIndex;
        }else{
            var i = node.childNodes.length;
            while(i--){
                nodeStack.push(node.childNodes[i]);
            }
        }
    }
    return range;
};

Range.dotAction = function(elm){
    $(elm).unbind();

    var id_num = $(elm).attr('id').split('b-')[1];
    var r_hl = $('.r-'+id_num);
    var r_avg = $('#a-' + id_num);

    $(elm).bind('mouseover', function(){
        $(this).css('z-index', '100');
        $(r_hl).fadeIn(100);
        $(r_avg).fadeIn(100);
    });
    $(elm).bind('mouseout', function(){
        $(this).css('z-index', '20');
        $(r_hl).stop();
        $(r_hl).fadeOut(100, function(){$(this).hide()});
        $(r_avg).fadeOut(100, function(){$(this).hide()});
    });
};

Range.close = function(elm){
    $(elm).fadeOut(100, function(){
        $(this).hide();
    });
    $('.temp-range').remove();
};

Range.check = function(){
    try{
        var range = window.getSelection().getRangeAt(0);
        var sp = range.startContainer.parentElement, ep = range.endContainer.parentElement;

        if(sp.id == ep.id && sp.className == 'article-paragraph' && range.toString() != ""){
            Range.menu(1, range);
        }else{
            Range.menu(0);
        }
    }catch(err){
        Range.menu(0);
    }
};

Range.menu = function(st, range){
    if(st == 0){
        $(Range.sec_menu).stop();
        $(Range.sec_menu).fadeOut(100, function(){$(this).hide()});

        $(Range.btn_add_q).unbind('click');
        $(Range.btn_add_f).unbind('click');
    }else{
        var rects = range.getClientRects();
        var last_rect = rects[rects.length-1];

        var base_pos = $(Range.wrapper).position();
        var menu_pos = {
            'top': last_rect.top - base_pos.top + last_rect.height,
            'left': last_rect.left - base_pos.left + last_rect.width/2 - 36,
        };
        $(Range.sec_menu).css(menu_pos).fadeIn(100);

        $(Range.btn_add_q).bind('click', function(){Range.addQuestion(range)});
        $(Range.btn_add_f).bind('click', function(){Range.addFactcheck(range)});
    }
};

Range.setTempRange = function(range){
    window.getSelection().removeAllRanges();

    var rects = range.getClientRects();
    var base_pos = $(Range.wrapper).position();

    for(var i=0; i<rects.length; i++){
        var temp_rect = $('<span></span>');
        var temp_rect_pos = {
            'top': rects[i].top - base_pos.top,
            'left': rects[i].left - base_pos.left,
            'width': rects[i].width,
            'height': rects[i].height,
        };

        $(temp_rect).css(temp_rect_pos).addClass('temp-range highlight');
        $(Range.sec_range).append(temp_rect);
        $(temp_rect).fadeIn(100);
    }
};

Range.addFactcheck = function(range){
    $(Range.sec_add_f_submit).unbind('click').html('등록하기').removeAttr('disabled').css({'color': '#08afd8', 'cursor': 'pointer'});
    $(Range.sec_add_f_close).show();
    $(Range.sec_add_f_score_btn).unbind('click');
    $(Range.sec_add_f_input).val('');

    var rects = range.getClientRects();
    var last_rect = rects[rects.length-1];
    var base_pos = $(Range.wrapper).position();
    var pos = {
        'top': last_rect.top - base_pos.top + last_rect.height,
        'left': last_rect.left - base_pos.left + last_rect.width/2 - 100
    };

    Range.close(Range.sec_menu);
    Range.setTempRange(range);
    $(Range.sec_add_f).css(pos).fadeIn(100);
    Range.addFactcheck.scoreInput();

    $(Range.sec_add_f_submit).bind('click', function(){
        $(this).html('잠시만 기다리세요.').attr('disabled', 'disabled').css({'color': '#868d8e', 'cursor': 'default'});
        $(Range.sec_add_f_close).hide();

        var score_btn = Range.sec_add_f_score_btn;
        var score = -1;
        var ref = $(Range.sec_add_f_input).val();

        for(i=0; i<6; i++){
            var st = parseInt($(score_btn[i]).css('background-position').split("0px")[1]);
            if(st < 0){
                score++;
            }
        }

        if(score > -1 && url_regexp.test(ref)){
            Range.addRange(range, function(range_id, type){
                $.ajax({
                    type: 'GET',
                    url: '/annote/api/savefactcheck/',
                    data: {
                        'score': score,
                        'ref': ref,
                        'range_id': range_id,
                    },
                    success: function(resObj){
                        var fc_btn;
                        if(type == 0){
                            fc_btn = Range.addFactcheck.newDot(range_id);
                        }else{
                            fc_btn = $('#b-'+range_id);
                        }
                        $(fc_btn).fadeIn(100);
                        Range.addFactcheck.animateDot(fc_btn);
                        Range.dotAction(fc_btn);
                        Range.close(Range.sec_add_f);
                        location.reload(true);
                    },
                    error: function(xhr){
                        console.log(xhr.responseText);
                    }
                });
            });
        }else{
            alert("점수가 없거나, 근거가 바른 URL이 아닙니다.");
            $(this).html('등록하기').removeAttr('disabled').css({'color': '#08afd8', 'cursor': 'pointer'});
            $(Range.sec_add_f_close).show();
        }
        console.log(score, ref);
    });
};

Range.addFactcheck.scoreInput = function(){
    var btn_on = {'background-position': '0 -24px'},
        btn_off = {'background-position': '0 0'};

    var score_btn = Range.sec_add_f_score_btn;
    var score_sec = Range.sec_add_f_score_sec;
    var score = -1;

    $(score_btn).css(btn_off);
    $(score_btn).each(function(i, e){
        $(e).bind('mouseenter', function(){
            $(score_btn).css(btn_off);
            for(var j=0; j<=i; j++){
                $(score_btn[j]).css(btn_on);
            }
        });
        $(e).bind('click', function(){
            score = i;
        });
    });
    $(score_sec).bind('mouseleave', function(){
        $(score_btn).css(btn_off);
        if(score > -1){
            for(var i=0; i<=score; i++){
                $(score_btn[i]).css(btn_on);
            }
        }
    });
};

Range.dotPosList = [];

Range.addFactcheck.newDot = function(range_id){
    var fc_hl = $('.r-' + range_id);
    fc_hl = fc_hl[fc_hl.length-1];
    var pos = {
        'top': parseInt($(fc_hl).css('top')) + parseInt($(fc_hl).css('height')) - 9,
        'left': parseInt($(fc_hl).css('left')) + parseInt($(fc_hl).css('width')) - 9
    };
    while(Range.dotPosList.indexOf(pos.left) != -1){
        pos.left = pos.left + 7;
    }
    Range.dotPosList.push(pos.left);
    var fc_btn = $('<button type="button"></button>');
    $(fc_btn).addClass('fc-btn').attr('id', 'b-' + range_id).css(pos).hide();
    $(Range.sec_button).prepend(fc_btn);

    return fc_btn;
};

Range.addFactcheck.animateDot = function(elm){
    var anime = function(val){
        if(val > 0){
            $(elm).animate({'top': '-='+val}, 200*(val/10), function(){
                $(this).animate({'top': '+='+val}, 200*(val/10), function(){
                    anime(val-4);
                });
            });
        }
    };
    anime(12);
};

Range.addRange = function(range, comp){
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
                var hl = $('.temp-range').clone();
                $(hl).removeClass('temp-range').addClass('r-' + resObj.id).hide();
                $(Range.sec_range).append(hl);
            }
            comp(resObj.id, resObj.type);
        },
        error: function(xhr){
            console.log(xhr.responseText);
        },
    });
};

Range.addQuestion = function(range){
    $(Range.sec_add_q_input).val('');

    var rects = range.getClientRects();
    var last_rect = rects[rects.length-1];
    var base_pos = $(Range.wrapper).position();
    var pos = {
        'top': last_rect.top - base_pos.top + last_rect.height,
        'left': last_rect.left - base_pos.left + last_rect.width/2 - 100
    };

    Range.close(Range.sec_menu);
    Range.setTempRange(range);
    $(Range.sec_add_q).css(pos).fadeIn(100);
    $(Range.sec_add_q_input).focus();

    $(Range.sec_add_q_submit).bind('click', function(){
        var q_text = $(Range.sec_add_q_input).val();
        Range.addRange(range, function(range_id, type){
            $.ajax({
                type: 'GET',
                url: '/annote/api/savequestion/',
                data: {
                    'content': q_text,
                    'range_id': range_id
                },
                success: function(resObj){
                    alert(resObj);
                    Range.close(Range.sec_add_q);
                    location.reload(true);
                },
                error: function(xhr){
                    console.log(xhr.responseText);
                }
            });
        });
    });
};

