/* Annotation Library */

(function($){
}(jQuery));

Annot = {};

Annot.initialize = function(elem){
    Annot.elem = $(elem).children(".article-content");
};
Annot.getSelection = function(){
    var sel = window.getSelection();
    

};


Selection = {};

Selection.initialize = function() {
    Selection.article = $("#article-content");
    Selection.wrapper = $("#wrapper-popup");
    Selection.sec_select = $("#popup-select");
    Selection.btn_write = $("button.write");
    Selection.btn_cancel = $("button.cancel");
    Selection.sec_write = $("#popup-write");
    Selection.btn_close = $("button.close");
    
    Selection.handle();
    
    Selection.selected = false;
    Selection.range = document.createRange();
};

Selection.handle = function() {
    /*Selection.btn_close.bind('click', Selection.cancel);*/
    Selection.btn_cancel.click(Selection.cancel_select);
    Selection.btn_write.click(Selection.write);
    Selection.btn_close.click(Selection.close_write);
    
    Selection.article.mouseup(function(event) {
        var userhighlight = window.getSelection().getRangeAt(0);
        if (userhighlight.toString().length != 0) {
            /* Set element CSS */
            
            
            $(Selection.wrapper).fadeTo(50, 1);
            $(Selection.sec_select).fadeTo(200, 1);
            
            console.log(userhighlight.toString());
            document.getElementById("popup-select").style.left = event.clientX/2;
            document.getElementById("popup-select").style.top = event.clientY;
            
            Selection.selected = true;
            Selection.range.setStart(userhighlight.startContainer, userhighlight.startOffset);
            Selection.range.setEnd(userhighlight.endContainer, userhighlight.endOffset);
        }
        else {
            if (!Selection.selected) {
                Selection.cancel_select();

                /* Reset variables and elements */
                document.getElementById("popup-select").style.left = 0;
                document.getElementById("popup-select").style.top = 0;
            }
        }
    });
};

Selection.write = function(elem){
    $(Selection.wrapper).fadeTo(50, 1);
    $(Selection.sec_write).fadeTo(200, 1);
    $(Selection.sec_select).fadeTo(100, 0, function(){
        $(this).hide();
    });
}

Selection.cancel_select = function(elem){
    $(Selection.wrapper).fadeTo(100, 0, function(){
        $(this).hide();
    });
    $(Selection.sec_select).fadeTo(100, 0, function(){
        $(this).hide();
    });
    Selection.selected = false;
}

Selection.close_write = function(elem){
    $(Selection.wrapper).fadeTo(100, 0, function(){
        $(this).hide();
    });
    $(Selection.sec_write).fadeTo(100, 0, function(){
        $(this).hide();
    });
    Selection.selected = false;
}
