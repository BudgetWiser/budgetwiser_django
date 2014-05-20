from django.conf.urls import patterns, include, url
from django.http import HttpResponseRedirect

urlpatterns = patterns('',
    url(r'^$', lambda request: HttpResponseRedirect('view/1')),
    url(r'^view/(\d+)/$', 'budgetwiser.apps.annote.views.index'),
    url(r'^loadcomment/$', 'budgetwiser.apps.annote.views.load_comment'),
    url(r'^writeanswer/$', 'budgetwiser.apps.annote.views.write_answer'),
    url(r'^writequestion/$', 'budgetwiser.apps.annote.views.write_question'),
)
