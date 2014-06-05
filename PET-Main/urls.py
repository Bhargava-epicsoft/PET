import webapp2
import views
 
urls = [(r'/home', views.MainPage), (r'/getUrl', views.UploadUrl),(r'/serve/([^/]+)?', views.ServeHandler), (r'/upload', views.UploadPDF),  (r'/populate', views.PopulateRules), (r'/home', views.MainPage), (r'/autoTag', views.AutoTag), (r'/getRules', views.GetRules), (r'/getRulesJSON', views.GetRulesJSON), (r'/addAnnotation', views.AddAnnotation), (r'/delete', views.bulkdelete),]
 
app = webapp2.WSGIApplication(urls, debug=True)