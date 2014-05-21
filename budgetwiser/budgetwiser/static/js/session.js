var Session = {};

Session.initialize = function() {
	$.ajaxSetup({
		crossDomain: false,
		beforeSend: function(xhr, settings) {
			if (!Session.csrfSafeMethod(settings.type)) {
				var csrftoken = Session.getCookie('csrftoken');
				xhr.setRequestHeader('X-CSRFToken', csrftoken);
			}
		},
	});
};

Session.getCookie = function(name) {
	var cookieValue = null;
	if (document.cookie && document.cookie != '') {
		var cookies = document.cookie.split(';');
		for (var i=0; i<cookies.length; i++) {
			var cookie = $.trim(cookies[i]);
			if (cookie.substring(0, name.length + 1) == (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	
	return cookieValue;
};

Session.csrfSafeMethod = function(method){
	return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
};
