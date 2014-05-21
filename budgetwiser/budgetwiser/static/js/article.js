Article = {};
Article.DATA = {};
Article.paragraphs = [];

Article.initialize = function() {
	Article.alignCommentList();
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

	Article.btnCommentList();
};

Article.btnCommentList = function() {
	var plist = Article.DATA.paragraphs;
	for (var i=0; i<plist.length; i++) {
		var btnQuery = '#cmnt-summary-btn'+plist[i].id;

		$(btnQuery).click(function() {
			var btnId = $(this).attr('id').split("cmnt-summary-btn")[1];
			var data = {'paragraph_id': btnId};
			$.ajax({
				type: 'GET',
				url: '/annote/api/loadcomments/',
				data: data,
				dataType: 'json',
				success: function(resObj) {
					Comment.loadComments(resObj);
				},
				error: function(xhr) {
					console.log(xhr.responseText);
				},
			});
		});
	}
};
