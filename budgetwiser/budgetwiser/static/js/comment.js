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
    console.log("loadQuestion" + data['id']);

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
                    '<a href="'+data['ref']+'">'+data['ref']+'</a>' +
                    '<div class="cmnt-response">' +
                        '<span class="cmnt-vote">공감하기</span>' +
                        '<span class="cmnt-numvotes">'+data['num_goods']+'명</span>'+
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
};

Comment.loadAnswer = function(data) {
    console.log("loadAnswer" + data['id']);

    var tagAnswer = 
        '<div class="cmnt-answer">' +
            '<img src="/media/res/img_user_thumbnail_test01.png">' +
            '<div class="cmnt-section">' +
                '<span>'+data['user']+'</span>' +
                '<div class="cmnt-content">' +
                    '<span class="cmnt-type">A.&nbsp;</span>' +
                    '<span>'+data['content']+'</span>' +
                    '<a href="'+data['ref']+'">'+data['ref']+'</a>' +
                    '<div class="cmnt-response">' +
                        '<span class="cmnt-vote">공감하기</span>' +
                        '<span class="cmnt-numvotes">'+data['num_goods']+'명</span>' +
                        '<span class="cmnt-numvotes">&nbsp;/&nbsp;</span>' +
                        '<span class="cmnt-vote">이의제기</span>' +
                        '<span class="cmnt-numvotes">'+data['num_bads']+'명</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    
    return tagAnswer;
};

Comment.loadQuestionInput = function(data) {
    console.log("loadQuestionInput");
    
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
    console.log("loadAnswerButton "+parent_id);

    var tagAnswerButton =
        '<label class="cmnt-answer-add" id="cmnt-answer-add-'+parent_id+'" style="color: #08afd8;">답변 남기기</button>';
    console.log(tagAnswerButton);

    return tagAnswerButton;
};

Comment.loadAnswerInput = function(user, parent_id) {
    console.log("loadAnswerInput");    

    var tagAnswerInput = 
        '<div class="cmnt-answer">' +
            '<img src="/media/res/img_user_thumbnail_test01.png">' +
            '<div class="cmnt-section">' +
                '<span>'+user+'</span>' +
                '<div class="cmnt-content">' +
                    '<span class="cmnt-type">A.&nbsp;</span>' +
                    '<textarea style="border: none; resize: none;" id="cmnt-answer-input-'+parent_id+'">답변을 입력해주세요.</textarea>' +
                    '<input type="text" style="border: none;" id="cmnt-answer-ref-'+parent_id+'" value="정보의 출처를 입력해주세요.">' +
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
        data = {
            content: inputContent.val(),
            ref: inputRef.val(),
            parent_id: parent_id,
        };
        console.log(data);

        $.ajax({
            type: 'POST',
            url: '/annote/api/writeanswer/',
            data: data,
            dataType: 'json',
            success: function(resObj) {
                console.log(resObj);
            },
            error: function(xhr) {
                //console.log(xhr.responseText);
                console.log("error");
            },
        });
    });

};

Comment.generateAnswerInput = function(user, parent_id) {
    /* Write answer button */
    var btnShow = $("#cmnt-answer-add-"+parent_id);
    btnShow.click(function() {
        console.log("change!");
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
