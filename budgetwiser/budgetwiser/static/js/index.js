Article = {};
Article.DATA = {};

Article.initialize = function(){
	Article.fc_btn = $(".fc-btn-01");
	Article.fc_sum = $(".fc-sum-01");
	Article.fc_hl = $(".hl-01");
	Article.menu = $(".menu-button");
	Article.fc_list = $(".fc-list-01");

	/* Handling for bizzard behavior of comment list alignment */
	var i=0;
	var timer = setInterval(function() {
		Article.alignCommentList();
		console.log("align!\n");
		if (i++ > 500)
			clearInterval(timer);
	}, 1);
	Article.registerBtns();
};

Article.registerBtns = function() {
	Article.btnCommentList();
};

Article.alignCommentList = function() {
	var plist = Article.DATA.paragraphs;
	for (var i=0; i<plist.length; i++) {
		var btnQuery = '#cmnt-summary-'+plist[i].id;
		var pQuery = '#p-'+plist[i].id;
		var pOfs = $(pQuery).position();

		$(btnQuery).css({
			'top': pOfs.top + 40
		});
	}
};

/* This function should be moved inside alignCommentList()
 * when timer in initialize() can be removed. */
Article.btnCommentList = function() {
	var plist = Article.DATA.paragraphs;
	for (var i=0; i<plist.length; i++) {
		var btnQuery = '#cmnt-summary-btn'+plist[i].id;

		$(btnQuery).click(function() {
			var data = {'id': $(this).attr('id').split("cmnt-summary-btn")[1]};
			$.ajax({
				type: 'GET',
				url: '/annote/loadcomment/',
				data: data,
				dataType: 'json',
				success: function(resObj) {
					Article.loadComments(resObj);
				},
				error: function(xhr) {
					console.log(xhr.responseTest);
				}
			});
		});
	}
};

Article.loadComments = function(comments_all) {
	$("#cmntlist-section").html("");
	console.log(comments_all);

	for (var i=0; i<comments_all.length; i++) {
		/* Generate questions */
		var family = $("<div class='cmnt-family'></div>");

		var question = $("<div class='cmnt-question'></div>");

		var q_userimg = $("<img class='user-image'></img>");
		q_userimg.attr("src", "/media/res/img_user_thumbnail_test01.png");

		var q_section = $("<div class='cmnt-section'></div>");
		var q_username = $("<span class='user-name'>" + comments_all[i]['user'] + comments_all[i]['id'] + "</span>");

		var q_content_section = $("<div></div>");
		var q_comment_content_p = $("<p id='cmnt-" + comments_all[i]['id'] + "'></p>");
		var q_comment_type = $("<span class='cmnt-type'>Q.&nbsp;</span>");
		var q_comment_content = $("<span class='cmnt-content'>" + comments_all[i]['content'] + "</span>");
		var q_comment_ref = $("<a class='cmnt-reference'>" + comments_all[i]['ref'] + "</a>");
		q_comment_ref.attr("href", comments_all[i]['ref']);

		var q_response_section = $("<div class='cmnt-response-section'></div>");
		var q_comment_response_p = $("<p class='cmnt-response'></p>");
		var q_good = $("<span class='cmnt-vote'>공감하기</span>");
		q_good.attr("id", "cmnt-good-" + comments_all[i]['id']);
		var q_num_goods = $("<span class='cmnt-numvotes'>" + comments_all[i]['num_goods'] + "명</span>");
		
		q_comment_content_p.append(q_comment_type);
		q_comment_content_p.append(q_comment_content);
		q_comment_content_p.append(q_comment_ref);

		q_comment_response_p.append(q_good);
		if (parseInt(comments_all[i]['num_goods']) > 0) {
			q_comment_response_p.append(q_num_goods);
		}

		q_content_section.append(q_comment_content_p);
		q_response_section.append(q_comment_response_p);
		q_section.append(q_username);
		q_section.append(q_content_section);
		q_section.append(q_response_section);
		question.append(q_userimg);
		question.append(q_section);
		family.append(question);


		for (var j=0; j<comments_all[i]['answers'].length; j++) {
			/* Generate answers to question */
			var child = comments_all[i]['answers'][j];

			var answer = $("<div class='cmnt-answer'></div>");
			
			var a_userimg = $("<img class='user-image'></img>");
			a_userimg.attr("src", "/media/res/img_user_thumbnail_test01.png");

			var a_section = $("<div class='cmnt-section'></div>");
			var a_username = $("<span class='user-name'>" + child['user'] + child['id'] + "</span>");

			var a_content_section = $("<div></div>");
			var a_comment_content_p = $("<p id='cmnt-" + child['id'] + "'></p>");
			var a_comment_type = $("<span class='cmnt-type'>A.&nbsp;</span>");
			var a_comment_content = $("<span class='cmnt-content'>" + child['content'] + "</span>");
			var a_comment_ref = $("<a class='cmnt-reference'>" + child['ref'] + "</a>");
			a_comment_ref.attr("href", child['ref']);

			var a_response_section = $("<div class='cmnt-response-section'></div>");
			var a_comment_response_p = $("<p class='cmnt-response'></p>");
			var a_good = $("<span class='cmnt-vote'>공감하기</span>");
			a_good.attr("id", "cmnt-good-" + child['id']);
			var a_num_goods = $("<span class='cmnt-numvotes'>" + child['num_goods'] + "명</span>");
			var a_vote_separator = $("<span class='cmnt-numvotes'>&nbsp;/&nbsp;</span>");
			var a_bad = $("<span class='cmnt-vote'>이의제기</span>:");
			a_bad.attr("id", "cmnt-bad-" + child['id']);
			var a_num_bads = $("<span class='cmnt-numvotes'>" + child['num_bads'] + "명</span>");

			a_comment_content_p.append(a_comment_type);
			a_comment_content_p.append(a_comment_content);
			a_comment_content_p.append(a_comment_ref);

			a_comment_response_p.append(a_good);
			if (parseInt(child['num_goods']) > 0) {
				a_comment_response_p.append(a_num_goods);
			}
			a_comment_response_p.append(a_vote_separator);
			a_comment_response_p.append(a_bad);
			if (parseInt(child['num_bads']) > 0) {
				a_comment_response_p.append(a_num_bads);
			}

			a_content_section.append(a_comment_content_p);
			a_response_section.append(a_comment_response_p);
			a_section.append(a_username);
			a_section.append(a_content_section);
			a_section.append(a_response_section);
			answer.append(a_userimg);
			answer.append(a_section);
			family.append(answer);
		}

		if (comments_all[i]['answers'].length > 0) {
			/* Generate answer field */
			var answer = $("<div class='cmnt-answer'></div>");

			var a_userimg = $("<img class='user-image'></img>");
			a_userimg.attr("src", "/media/res/img_user_thumbnail_test01.png");

			var a_section = $("<div class='cmnt-section'></div>");
			var a_username = $("<span class='user-name'>" + child['user'] + child['id'] + "</span>");

			var a_answer_section = $("<div></div>");

			var a_answer = $("<form id='cmnt-answer'></form>");
			var a_answer_type = $("<span class='cmnt-type'>A.&nbsp;</span>");
			var a_answer_content = $("<textarea class='cmnt-content' style='border: none;'>답변을 입력해주세요.</textarea>");
			a_answer_content.attr("id", "cmnt-answer-content");
			var a_answer_ref = $("<input type='text' class='cmnt-reference' style='border: none;' value='정보의 출처를 입력해주세요.'>");
			a_answer_ref.attr("id", "cmnt-answer-ref");
			var a_answer_btn_section = $("<div class='cmnt-answer-btn-section'></div>");
			var a_answer_submit = $("<input type='submit' value='답변 남기기'>");
			a_answer_submit.attr("id", "cmnt-answer-submit-" + comments_all[i]['id']);
			var a_answer_cancel = $("<button id='cmnt-answer-cancel'>취소하기</button>");
			a_answer_cancel.attr("id", "cmnt-answer-cancel");

			a_answer.append(a_answer_type);
			a_answer.append(a_answer_content);
			a_answer.append(a_answer_ref);
			a_answer_btn_section.append(a_answer_submit);
			a_answer_btn_section.append(a_answer_cancel);
			a_answer.append(a_answer_btn_section);
			a_answer_section.append(a_answer);
			a_section.append(a_username);
			a_section.append(a_answer_section);
			answer.append(a_userimg);
			answer.append(a_section);
			family.append(answer);
		}
		else {
			/* Generate answer button */
			var answer = $("<div class='cmnt-answer'></div>");
			
			var a_answer_img = $("<img class='cmnt-answer-img'></img>");
			a_answer_img.attr("src", "/media/res/img_user_thumbnail_test01.png");
			
			var a_section = $("<div class='cmnt-section'></div>");
			var a_answer_section = $("<div></div>");
			var a_answer_btn = $("<button>답변 남기기</button>");
			a_answer_btn.attr("id", "cmnt-answer-btn");

			a_answer_section.append(a_answer_btn);
			a_section.append(a_answer_section);
			answer.append(a_answer_img);
			answer.append(a_section);
			family.append(answer);
		}

		$("#cmntlist-section").append(family);
	}

	/* Generate question field */
	var family = $("<div class='cmnt-family'></div>");
	
	var question = $("<div class='cmnt-question'></div>");

	var q_question_img = $("<img class='user-image'></img>");
	q_question_img.attr("src", "/media/res/img_user_thumbnail_test01.png");
	var q_section = $("<div class='cmnt-section'></div>");
	var q_instruction = $("<span class='user-name'>질문 남기기</span>");
	var q_content_section = $("<div></div>");
	var q_type = $("<span class='cmnt-type'>Q.&nbsp;</span>");
	var q_form = $("<form id='cmnt-write'></form>");
	var q_form_label = $("<label>먼저 질문할 부분을 드래깅하세요.</label>");
	q_form_label.css({
		'font-size': 13
	});
	var q_input = $("<textarea id='cmnt-write-content' style='display: none;'>코멘트를 입력하세요.</textarea>");
	var q_submit = $("<input type='submit' value='질문 남기기'></input>");

	q_form.append(q_input);
	q_form.append(q_form_label);
	q_form.append(q_submit);
	q_content_section.append(q_type);
	q_content_section.append(q_form);
	q_section.append(q_instruction);
	q_section.append(q_content_section);
	question.append(q_question_img);
	question.append(q_section);	
	family.append(question);
	$("#cmntlist-section").append(family);
};
