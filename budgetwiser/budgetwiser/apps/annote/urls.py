from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'budgetwiser.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^$', 'budgetwiser.apps.annote.views.main'),
    url(r'^write/', 'budgetwiser.apps.annote.views.write_comment'),
)
