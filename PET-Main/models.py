from google.appengine.ext import db 
 
class Rule(db.Model): 
	mainCat = db.StringProperty(multiline=True)
	broadCat = db.StringProperty(multiline=True)
	age = db.StringProperty(multiline=True) 
	sub1 = db.StringProperty(multiline=True) 
	sub2 = db.StringProperty(multiline=True) 
	raters = db.StringProperty(multiline=True) 
	scale = db.StringProperty(multiline=True) 
	abbrev = db.StringProperty(multiline=True) 
	pattern = db.StringProperty(multiline=True) 