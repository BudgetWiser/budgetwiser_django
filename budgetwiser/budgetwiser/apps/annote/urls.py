from django.conf.urls import patterns, include, url
from django.http import HttpResponseRedirect

urlpatterns = patterns('',
    url(r'^$', lambda request: HttpResponseRedirect('list/')),
    url(r'^list/$', 'budgetwiser.apps.annote.views.list'),
    url(r'^view/(\d+)/$', 'budgetwiser.apps.annote.views.index'),
    url(r'^api/loadcomments/$', 'budgetwiser.apps.annote.views.load_comment'),
    url(r'^api/writeanswer/$', 'budgetwiser.apps.annote.views.write_answer'),
    url(r'^api/saverange/$', 'budgetwiser.apps.annote.views.save_range'),
    url(r'^api/getrange/$', 'budgetwiser.apps.annote.views.get_range'),
    url(r'^api/savefactcheck/$', 'budgetwiser.apps.annote.views.save_factcheck'),
    url(r'^api/getfactcheck/$', 'budgetwiser.apps.annote.views.get_factcheck'),
    url(r'^api/savequestion/$', 'budgetwiser.apps.annote.views.save_question'),
    url(r'^api/votegood/$', 'budgetwiser.apps.annote.views.vote_good'),
    url(r'^api/votebad/$', 'budgetwiser.apps.annote.views.vote_bad'),
    url(r'^api/requestfactcheck/$', 'budgetwiser.apps.annote.views.request_factcheck'),
    url(r'^api/listfactcheck/$', 'budgetwiser.apps.annote.views.list_factcheck'),
)
