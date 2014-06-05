import xml.etree.ElementTree as xml		

root = xml.Element('root')
child = xml.Element('child')
root.append(child)
child.attrib['name'] = "Charlie"
file = open("test.xml", 'w')
xml.ElementTree(root).write(file)
file.close()

 xml.ElementTree(root).write()

 class AddAnnotation(webapp2.RequestHandler):

    def post(self):

        global tree_global
        tree = tree_global
        annotation = self.request.get('annotation')
        tag_cls = self.request.get('class')
        tree = checkDB(annotation, tree, tag_cls)
        tree_global = tree
        #h = xml.Element("HEHE");
        #h.text = "moose";
        #tree_global.append(h);
        a = xml.tostring(tree_global)
        print a

        b = "<inventory><drink><lemonade><price>$2.50</price><amount>20</amount></lemonade><pop><price>$1.50</price><amount>10</amount></pop></drink><snack><chips><price>$4.50</price><amount>60</amount></chips></snack></inventory>"

        self.response.out.write("%s" % a)