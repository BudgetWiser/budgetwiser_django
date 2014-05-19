from django.conf.urls import patterns, include, url
from django.http import HttpResponseRedirect

urlpatterns = patterns('',
    url(r'^$', lambda request: HttpResponseRedirect('view/1')),
    url(r'^view/(\d+)/$', 'budgetwiser.apps.annote.views.index'),
    url(r'^loadcomment/$', 'budgetwiser.apps.annote.views.load_comment'),
)
