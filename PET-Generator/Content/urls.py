from django.conf.urls import patterns, url

from Content import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'generate/$', views.generate, name='generate'),
    url(r'generate/pdf/$', views.pdf_download, name='pdf'),
    url(r'generate/xml/$', views.xml_download, name='xml')
)