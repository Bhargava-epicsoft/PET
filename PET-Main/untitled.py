 import xml.etree.ElementTree as ET

        workpath = os.path.dirname(os.path.abspath(__file__)) #Returns the Path your .py file is in

        with open(os.path.join(workpath,"data","outcomes.csv"), 'rb') as f:
            reader = csv.reader(f)
            for row in reader:
                rule = models.Rule()
                rule.tag1 = row[0]
                rule.tag2 = row[1]
                rule.tag3 = row[2]
                rule.tag4 = row[3]
                rule.target = row[4]
                rule.abbrev = row[5]
                rule.pattern = "%@"
                rule.put()


from google.appengine.ext import db 
 
class Rule(db.Model): 
    tag1 = db.StringProperty(multiline=True)
    tag2 = db.StringProperty(multiline=True)
    tag3 = db.StringProperty(multiline=True) 
    tag4 = db.StringProperty(multiline=True) 
    target = db.StringProperty(multiline=True) 
    abbrev = db.StringProperty(multiline=True) 
    pattern = db.StringProperty(multiline=True) 



     workpath = os.path.dirname(os.path.abspath(__file__)) #Returns the Path your .py file is in

        root = xml.Element('root')
        child = xml.Element('child')
        root.append(child)
        child.attrib['name'] = "Charlie"
       
        c = root.find('child')
        c.append(xml.Element('ch'))
       
        a = ""
        a = xml.tostring(root)
        print a

        print ("%s %s %s %s" % (row.mainCat, row.broadCat, row.sub1, row.sub2))


/sub1 = age.find(row.sub1.decode('utf-8', 'replace').strip().replace (" ", "_"))


if row.sub1 is not None:
        print row.sub1.encode('utf-8', 'replace').replace("\"", "'")
        sub1 = age.find(row.sub1.encode('utf-8', 'replace').strip().replace (" ", "_"))
        sub1 = xml.Element(row.age.encode('utf-8', 'replace').strip().replace (" ", "_"))
        age.append(sub1)
    else:
        sub1 = age


        sub2 = sub1.find(row.sub2.decode('utf-8').strip().replace (" ", "_"))
    if sub2 is None:
        if row.sub2 is None:
            sub2 = sub1
        else:
            sub2 = xml.Element(row.sub1.decode('utf-8').strip().replace (" ", "_"))
            sub1.append(sub2)

    raters = sub2.find(row.raters.decode('utf-8').strip().replace (" ", "_"))
    if raters is None:
        if row.raters is None:
            raters = sub2
        else:
            raters = xml.Element(row.sub2.decode('utf-8').strip().replace (" ", "_"))
            sub2.append(raters)

    scale = raters.find(row.scale.decode('utf-8').strip().replace (" ", "_"))
    if scale is None:
        if row.scale is None:
            scale = raters
        else:
            scale = xml.Element(row.raters.decode('utf-8').strip().replace (" ", "_"))
            raters.append(scale)