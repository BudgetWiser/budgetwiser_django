List = {};

List.initialize = function() {
    Comment.list_section = $("#list-section");
    Comment.loadList();
};

Comment.loadList = function() {
    Comment.list_section.html("");
    var data = List.DATA;
    
    for (var i=0; i<data.length; i++) {
        var date = data[i].date.split("T")[0];
        //var time = data[i].date.split("T")[1].split(".")[0];

        var tagItem = 
            '<li class="list-container">' + 
                '<div class="list-item" id="list-item-'+data[i].id+'">' +
                    '<a href="/annote/view/'+data[i].id+'">'+data[i].title+'</a>' +
                    '<span class="list-item-numcmnts">'+data[i].num_comments+' Comments by ' +
                        data[i].num_users+' Viewers</span>' +
                    '<span class="list-item-date">'+date+'</span>' +
                '</div>' +
            '</li>';
        Comment.list_section.append(tagItem);
    }
};
