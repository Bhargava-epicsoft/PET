import webapp2

import jinja2
import os
import models
import json

import types
import sys
import urllib

import csv
import hashlib
import xml.etree.ElementTree as xml
from google.appengine.ext import db
from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers


JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname('templates')),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

noHash = 3 * 2
resource = ""
tree_global = xml.Element('PDF')

class MainPage(webapp2.RequestHandler):

    def get(self):

        global tree_global
        tree_global = xml.Element('PDF')

        upload_url = blobstore.create_upload_url('/upload')

        template_parameters = { 'upload_url' : upload_url }
    	template = JINJA_ENVIRONMENT.get_template('layout_templates/main.html')
    	self.response.write(template.render(template_parameters))

class UploadPDF(blobstore_handlers.BlobstoreUploadHandler):

    def post(self):
        
        upload_files = self.get_uploads('file')  # 'file' is file upload field in the form
        blob_info = upload_files[0]

        self.response.write('{ "blob_key" : "%s" }' % blob_info.key())


        ##blob_key = blob_info.key();
        ##self.redirect('/serve/%s' % blob_info.key())
        ##self.redirect('/home')

class ServeHandler(blobstore_handlers.BlobstoreDownloadHandler):
  
    def get(self, resource):
  
        ##resource = 'Ygsucq3gvHbqnygkkbJP9w=='
        ##resource = 'Ygsucq3gvHbqnygkkbJP9w=='
        ##resource = self.request.get('resource')
        resource = str(urllib.unquote(resource))
        blob_info = blobstore.BlobInfo.get(resource)
        self.send_blob(blob_info)

class UploadUrl(webapp2.RequestHandler):

    def post(self):

        upload_url = blobstore.create_upload_url('/upload')
        self.response.write('{ "upload_url" : "%s" }' % upload_url)


class AutoTag(webapp2.RequestHandler):

    def post(self):

        text_extracted = self.request.get('text_extracted')

        docText = []
        tree = xml.Element('document')
        
        for line in text_extracted:
            for word in line.split():
                docText.append(word)

        for x in xrange(len(docText)):
            str = ""
            print "working" 
            if x+10 > len(docText):
                for y in xrange(x,len(docText)):
                    str = ("%s %s" % (str, docText[y]))
                    tree = checkDB(str, tree)
            else:
                for y in xrange(x,x+10):
                    str = ("%s %s" % (str, docText[y]))
                    tree = checkDB(str, tree)
            
        a = xml.tostring(tree)
        print a

        self.response.out.write(text_extracted)
       


def checkDB(str, tree, tag_cls):
    
    from google.appengine.ext import db

    rules = models.Rule()

    rules = db.GqlQuery("SELECT * FROM Rule WHERE scale = '%s'" % str.strip().lower())
    for row in rules:
        tree = addXML(row,tree, tag_cls)
        

    rules = db.GqlQuery("SELECT * FROM Rule WHERE abbrev = '%s'" % str.strip().lower())
    for row in rules:
        tree = addXML(row,tree, tag_cls)

    return tree   

def addXML(row,tree, tag_cls):


    if row.mainCat is not None:
        main = tree.find(row.mainCat.encode('utf-8', 'replace').strip().replace (" ", "_").replace("'", ""))
        if main is None:
            main = xml.Element(row.mainCat.encode('utf-8', 'replace').strip().replace (" ", "_").replace("'", ""))
            main.set('class', tag_cls)
            tree.append(main)
        else:
            atr = main.get('class');
            main.set('class', atr + " " + tag_cls)
    else:
        atr = tree.get('class');
        tree.set('class', atr + " " + tag_cls)
        main = tree

    if row.broadCat is not None:
        broad = main.find(row.broadCat.encode('utf-8', 'replace').strip().replace (" ", "_").replace("'", ""))
        if broad is None:
            broad = xml.Element(row.broadCat.encode('utf-8', 'replace').strip().replace (" ", "_").replace("'", ""))
            broad.set('class', tag_cls)
            main.append(broad)
    else:
        atr = main.get('class');
        main.set('class', atr + " " + tag_cls)
        broad = main

    if row.age is not None:
        age = broad.find(row.age.encode('utf-8', 'replace').strip().replace (" ", "_").replace("'", ""))
        if age is None:
            age = xml.Element(row.age.encode('utf-8', 'replace').strip().replace (" ", "_").replace("'", ""))
            age.set('class', tag_cls)
            broad.append(age)
    else:
        atr = broad.get('class');
        broad.set('class', atr + " " + tag_cls)
        age = broad

    if row.sub1 is not None:
        sub1 = age.find(row.sub1.encode('utf-8', 'replace').strip().replace (" ", "_").replace("'", ""))
        if sub1 is None:
            sub1 = xml.Element(row.sub1.encode('utf-8', 'replace').strip().replace (" ", "_").replace("'", ""))
            sub1.set('class', tag_cls)
            age.append(sub1)
    else:
        atr = age.get('class');
        age.set('class', atr + " " + tag_cls)
        sub1 = age

    if row.sub2 is not None:
        sub2 = sub1.find(row.sub2.encode('utf-8', 'replace').strip().replace (" ", "_").replace("'", ""))
        if sub2 is None:
            sub2 = xml.Element(row.sub2.encode('utf-8', 'replace').strip().replace (" ", "_").replace("'", ""))
            sub2.set('class', tag_cls)
            sub1.append(sub2)
    else:
        atr = sub1.get('class');
        sub1.set('class', atr + " " + tag_cls)
        sub2 = sub1
        
    if row.raters is not None:
        raters = sub2.find(row.raters.encode('utf-8', 'replace').strip().replace (" ", "_").replace("'", ""))
        if raters is None:
            raters = xml.Element(row.raters.encode('utf-8', 'replace').strip().replace (" ", "_").replace("'", ""))
            raters.set('class', tag_cls)
            sub2.append(raters)
    else:
        atr = sub2.get('class');
        sub2.set('class', atr + " " + tag_cls)
        raters = sub2

    return tree

class AddAnnotation(webapp2.RequestHandler):

    def post(self):

        global tree_global
        tree = tree_global
        annotation = self.request.get('annotation')
        tag_cls = self.request.get('class')
        tree = checkDB(annotation, tree, tag_cls)
        tree_global = tree
        a = xml.tostring(tree_global)

        print a
        self.response.out.write("%s" % a)
        

class GetRules(webapp2.RequestHandler):

    def get(self):

        arr = []

        from google.appengine.ext import db

        rules = db.GqlQuery("SELECT * FROM Rule LIMIT 1, 1")

        x = 0

        for row in rules:
            a = {}
            a['scale'] = row.scale
            a['abbrev'] = row.abbrev
            arr.append(a)
            print(a);


        output=json.dumps(arr)
        self.response.out.write(output)

class GetRulesJSON(webapp2.RequestHandler):

    def get(self):

        workpath = os.path.dirname(os.path.abspath(__file__)) #Returns the Path your .py file is in

        with open(os.path.join(workpath,"data","scales_json.txt"), 'r') as f:
            rules_json = f.read()

        self.response.out.write(rules_json)

class PopulateRules(webapp2.RequestHandler):

    def get(self):

        workpath = os.path.dirname(os.path.abspath(__file__)) #Returns the Path your .py file is in

        with open(os.path.join(workpath,"data","scales.csv"), 'rb') as f:
            reader = csv.reader(f)
            
            for row in reader:

                rule = models.Rule()
                if row[1]:
                    rule.mainCat = row[1].decode('utf-8').strip().lower()
                if row[2]:
                    rule.broadCat = row[2].decode('utf-8').strip().lower()
                if row[3]:
                    rule.age = row[3].decode('utf-8').strip().lower()
                if row[4]:
                    rule.sub1 = row[4].decode('utf-8').strip().lower()
                if row[5]:
                    rule.sub2 = row[5].decode('utf-8').strip().lower()
                if row[6]:
                    rule.raters = row[6].decode('utf-8').strip().lower()
                if row[7]:
                    rule.scale = row[7].decode('utf-8').strip().lower()
                if row[8]:
                    rule.abbrev = row[8].decode('utf-8').strip().lower()
                rule.pattern = "[term]"
                rule.put() 

class bulkdelete(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/plain'
        try:
            while True:
                q = db.GqlQuery("SELECT __key__ FROM Rule")
                assert q.count()
                db.delete(q.fetch(10000))
                time.sleep(0.5)
        except Exception, e:
            self.response.out.write(repr(e)+'\n')
            pass

