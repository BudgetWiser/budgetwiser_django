from django.conf.urls import patterns, include, url
from django.conf import settings

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^annote/', include('budgetwiser.apps.annote.urls')),

    # Media path
    url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root':settings.MEDIA_ROOT}),

    # Admin page
    url(r'^admin/', include(admin.site.urls)),
)

# Examples:
# url(r'^$', 'budgetwiser.views.home', name='home'),
# url(r'^blog/', include('blog.urls')),
