from django.conf.urls import patterns, include, url
from django.http import HttpResponseRedirect

urlpatterns = patterns('',
    url(r'^$', lambda request: HttpResponseRedirect('view/1')),
    url(r'^view/(\d+)/$', 'budgetwiser.apps.annote.views.index'),
    url(r'^api/loadcomments/$', 'budgetwiser.apps.annote.views.load_comment'),
    url(r'^api/writeanswer/$', 'budgetwiser.apps.annote.views.write_answer'),
    url(r'^api/writequestion/$', 'budgetwiser.apps.annote.views.write_question'),
    url(r'^api/saverange/$', 'budgetwiser.apps.annote.views.save_range'),
    url(r'^api/getrange/$', 'budgetwiser.apps.annote.views.get_range'),
    url(r'^api/savefactcheck/$', 'budgetwiser.apps.annote.views.save_factcheck'),
    url(r'^api/getfactcheck/$', 'budgetwiser.apps.annote.views.get_factcheck'),
    url(r'^api/getcomment/$', 'budgetwiser.apps.annote.views.get_comment'),
)
