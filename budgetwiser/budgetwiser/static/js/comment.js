url_regexp = /(?:(?:(https?|ftp|telnet):\/\/|[\s\t\r\n\[\]\`\<\>\"\'])((?:[\w$\-_\.+!*\'\(\),]|%[0-9a-f][0-9a-f])*\:(?:[\w$\-_\.+!*\'\(\),;\?&=]|%[0-9a-f][0-9a-f])+\@)?(?:((?:(?:[a-z0-9\-가-힣]+\.)+[a-z0-9\-]{2,})|(?:[\d]{1,3}\.){3}[\d]{1,3})|localhost)(?:\:([0-9]+))?((?:\/(?:[\w$\-_\.+!*\'\(\),;:@&=ㄱ-ㅎㅏ-ㅣ가-힣]|%[0-9a-f][0-9a-f])+)*)(?:\/([^\s\/\?\.:<>|#]*(?:\.[^\s\/\?:<>|#]+)*))?(\/?[\?;](?:[a-z0-9\-]+(?:=[^\s:&<>]*)?\&)*[a-z0-9\-]+(?:=[^\s:&<>]*)?)?(#[\w\-]+)?)/gmi;



Comment = {};

Comment.initialize = function(paragraph_id) {
	Comment.cmntlist = $("#cmntlist-section");
	Comment.paragraph_id = paragraph_id;
};

Comment.loadComments = function(data) {
	Comment.cmntlist.html("");

	for (var i=0; i<data.length; i++) {
		Comment.loadQuestion(data[i]);
	}
	Comment.loadQuestionInput();
};

Comment.loadQuestion = function(data) {
    var family = $('<div></div>');
    family.addClass('cmnt-family');

    var tagQuestion =
        '<div class="cmnt-question">' +
            '<img src="/media/res/img_user_thumbnail_test01.png">' +
            '<div class="cmnt-section">' +
                '<span>'+data['user']+'</span>' +
                '<div class="cmnt-content">' +
                    '<span class="cmnt-type">Q.&nbsp;</span>' +
                    '<span>'+data['content']+'</span>' +
                    '<a href="'+data['ref']+'" target="_blank">'+data['ref']+'</a>' +
                    '<div class="cmnt-response">' +
                        '<span class="cmnt-vote" id="cmnt-good-'+data['id']+'">공감하기</span>' +
                        '<span class="cmnt-numvotes" id="cmnt-numgoods-'+data['id']+'">'+data['num_goods']+'명</span>'+
                    '</div>'+
                '</div>' +
            '</div>' +
        '</div>';

    family.append(tagQuestion);

    /* Add answers */
    var clist = data['answers'];
    if (clist.length > 0) {
        for (var i=0; i<clist.length; i++) {
            family.append(Comment.loadAnswer(clist[i]));
        }
        family.append(Comment.loadAnswerInput(data['user'], data['id']));
    }
    else {
        family.append(Comment.loadAnswerButton(data['id']));
    }

    Comment.cmntlist.append(family);
    
    Comment.behaveInput(data['id']);
    Comment.generateAnswerInput(data['user'], data['id']);

    /* Register vote handlers */
    Comment.registerVote(data['id']);
    for (var i=0; i<clist.length; i++) {
        Comment.registerVote(clist[i]['id']);
    }
};

Comment.loadAnswer = function(data) {
    var tagAnswer = 
        '<div class="cmnt-answer">' +
            '<img src="/media/res/img_user_thumbnail_test01.png">' +
            '<div class="cmnt-section">' +
                '<span>'+data['user']+'</span>' +
                '<div class="cmnt-content">' +
                    '<span class="cmnt-type">A.&nbsp;</span>' +
                    '<span>'+data['content']+'</span>' +
                    '<a href="'+data['ref']+'" target="_blank">'+data['ref']+'</a>' +
                    '<div class="cmnt-response">' +
                        '<span class="cmnt-vote" id="cmnt-good-'+data['id']+'">공감하기</span>' +
                        '<span class="cmnt-numvotes" id="cmnt-numgoods-'+data['id']+'">'+data['num_goods']+'명</span>' +
                        '<span class="cmnt-numvotes">&nbsp;/&nbsp;</span>' +
                        '<span class="cmnt-vote" id="cmnt-bad-'+data['id']+'">이의제기</span>' +
                        '<span class="cmnt-numvotes" id="cmnt-numbads-'+data['id']+'">'+data['num_bads']+'명</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    
    return tagAnswer;
};

Comment.loadQuestionInput = function(data) {
	var tagQuestionInput =
		'<div class="cmnt-family">' + 
			'<div class="cmnt-question">' + 
				'<img src="/media/res/img_user_thumbnail_test01.png">' + 
				'<div class="cmnt-section">' +
					'<span>질문 남기기</span>' + 
					'<div class="cmnt-content">' + 
						'<span class="cmnt-type">Q.&nbsp;</span>' + 
						'<label>먼저 질문할 부분을 드래깅하세요.</label>' + 
					'</div>' + 
				'</div>' + 
			'</div>' + 
		'</div>';
	
    Comment.cmntlist.append(tagQuestionInput);
};

Comment.loadAnswerButton = function(parent_id) {
    var tagAnswerButton =
        '<label class="cmnt-answer-add" id="cmnt-answer-add-'+parent_id+'" style="color: #08afd8;">답변 남기기</button>';

    return tagAnswerButton;
};

Comment.loadAnswerInput = function(user, parent_id) {

    var tagAnswerInput = 
        '<div class="cmnt-answer">' +
            '<img src="/media/res/img_user_thumbnail_test01.png">' +
            '<div class="cmnt-section">' +
                '<span>'+user+'</span>' +
                '<div class="cmnt-content">' +
                    '<span class="cmnt-type">A.&nbsp;</span>' +
                    '<textarea accept-charset="UTF-8" style="border: none; resize: none;" id="cmnt-answer-input-'+parent_id+'">답변을 입력해주세요.</textarea>' +
                    '<input accept-charset="UTF-8" type="text" style="border: none;" id="cmnt-answer-ref-'+parent_id+'" value="정보의 출처를 입력해주세요.">' +
                    '<button class="cmnt-answer-write" id="cmnt-answer-write-'+parent_id+'">답변 남기기</button>' +
                    '<button class="cmnt-answer-cancel">취소하기</button>' +
                '<div>' +
            '</div>' +
        '</div>';

    return tagAnswerInput;
};

Comment.behaveInput = function(parent_id) {
    /* Input field behaviors */
    var inputContent = $("#cmnt-answer-input-"+parent_id);
    inputContent.focus(function() {
        if ($(this).val() === "답변을 입력해주세요.") {
            $(this).val("");
        }
    });
    inputContent.on('blur', function() {
        if ($(this).val() === "") {
            $(this).val("답변을 입력해주세요.");
        }
    });
    inputContent.on('keydown', function() {
        $(this).autosize();
    });

    var inputRef = $("#cmnt-answer-ref-"+parent_id);
    inputRef.focus(function() {
        if ($(this).val() === "정보의 출처를 입력해주세요.") {
            $(this).val("");
        }
    });
    inputRef.on('blur', function() {
        if ($(this).val() === "") {
            $(this).val("정보의 출처를 입력해주세요.");
        }
    });

    /* Submit button */
    var btnWrite = $("#cmnt-answer-write-"+parent_id);
    btnWrite.click(function() {

        if (inputContent.val() === "답변을 입력해주세요.") {
            alert("답변을 입력해주세요!");
        }
        else if (inputRef.val() === "정보의 출처를 입력해주세요.") {
            data = {
                'content': inputContent.val(),
                'ref': null,
                'parent_id': parent_id,
            };

            $.ajax({
                type: 'POST',
                url: '/annote/api/writeanswer/',
                data: data,
                dataType: 'json',
                success: function(resObj) {
                    Comment.loadComments(resObj);
                },
                error: function(xhr) {
                    console.log("error in wrtie (js)");
                },
            });
        }
        else if (url_regexp.test(inputRef.val())) {
            data = {
                'content': inputContent.val(),
                'ref': inputRef.val(),
                'parent_id': parent_id,
            };

            $.ajax({
                type: 'POST',
                url: '/annote/api/writeanswer/',
                data: data,
                dataType: 'json',
                success: function(resObj) {
                    Comment.loadComments(resObj);
                },
                error: function(xhr) {
                    console.log("error in wrtie (js)");
                },
            });
        }
        else {
            alert("올바른 URL이 아닙니다!");
        }
    });

};

Comment.generateAnswerInput = function(user, parent_id) {
    /* Write answer button */
    var btnShow = $("#cmnt-answer-add-"+parent_id);
    btnShow.click(function() {
        $(this).off('click');
        $(this).html("");
        $(this).append(Comment.loadAnswerInput(user, parent_id));
        $(this).css({
            'margin-left': '0px',
            'color': '#000000',
            'cursor': 'default',
        });
        Comment.behaveInput(parent_id);
    });
};

Comment.registerVote = function(comment_id) {
    var goodBtn = $("#cmnt-good-"+comment_id);
    var badBtn = $("#cmnt-bad-"+comment_id);

    goodBtn.click(function() {
        $.ajax({
            type: 'POST',
            url: '/annote/api/votegood/',
            data: {'comment_id': comment_id},
            dataType: 'json',
            success: function(resObj) {
                switch(resObj['errno']) {
                    case 0:
                        var numGood = parseInt($("#cmnt-numgoods-"+comment_id).text());
                        document.getElementById("cmnt-numgoods-"+comment_id).innerHTML = (numGood+1)+"명";
                        alert("댓글에 공감하였습니다.");
                        break;
                    case 1:
                        alert("이미 공감한 댓글입니다.");
                        break;
                    case 2:
                        alert("이미 이의를 제기한 댓글입니다.");
                        break;
                    default:
                        alert("FATAL_ERROR: COMMENT_VOTE_FOR!");
                }
            },
            error: function(xhr) {
                console.log("error");
            },
        });
    });

    badBtn.click(function() {
        $.ajax({
            type: 'POST',
            url: '/annote/api/votebad/',
            data: {'comment_id': comment_id},
            dataType: 'json',
            success: function(resObj) {
                switch(resObj['errno']) {
                    case 0:
                        var numBad = parseInt($("#cmnt-numbads-"+comment_id).text());
                        document.getElementById("cmnt-numbads-"+comment_id).innerHTML = (numBad+1)+"명";
                        alert("댓글에 이의를 제기하였습니다.");
                        break;
                    case 1:
                        alert("이미 이의를 제기한 댓글입니다.");
                        break;
                    case 2:
                        alert("이미 공감한 댓글입니다.");
                        break;
                    default:
                        alert("FATAL_ERROR: COMMENT_VOTE_AGAINST!");
                }
            },
            error: function(xhr) {
                console.log("error");
            },
        });
    });

};
