from django.shortcuts import render
from django.http import HttpResponse
from django.template import RequestContext, loader
import subprocess
import tempfile
import os

import csv
import json

from django.core.servers.basehttp import FileWrapper

from django.views.static import serve

from Content.models import Scale

def index(request):

    template = loader.get_template('main.html')
    context = RequestContext(request, {
        'base_template': 'template.html',
    })

    return HttpResponse(template.render(context))

def generate(request):

    pdf_url = request.POST.get("pdf_url")
    data = request.POST.get("file")
    xml_data = request.POST.get("xml_file")

    create_pet_dest = subprocess.call(['mkdir', '%TEMP%\pet'], shell=True)
    delete_dest = subprocess.call(['rm', '%TEMP%\pet/dest.csv'], shell=True)
    create_dest = subprocess.call(['type','NUL','>','%TEMP%\pet/dest.csv'], shell=True)
	
	temp_addr = subprocess.call(['echo','%TEMP%'],shell=True)
	
    #csvfile = open(temp_addr + "/pet/dest.csv", "r+")
    #csvfile.write(data)
    #csvfile.close()

    #print data

    #delete_dest = subprocess.call(['rm', '%TEMP%\pet/data.xml'], shell=True)
    #create_dest = subprocess.call(['type','NUL','>','%TEMP%\pet/data.xml'], shell=True)

    #xmlfile = open("%TEMP%\pet/data.xml", "r+")
    #xmlfile.write(xml_data)
    #xmlfile.close()

    #download_original_pdf = subprocess.call(['curl','-o','%TEMP%\pet/temp.pdf','http://localhost:8080/serve/'+pdf_url], shell=True)
    #embed_named_destinations = subprocess.call(['PDFNamedDestination', '%TEMP%\pet/temp.pdf', '%TEMP%\pet/new_temp.pdf' ,'%TEMP%\pet/dest.csv'], shell=True)

    template = loader.get_template('main.html')
    context = RequestContext(request, {
        'base_template': 'template.html',
    })

    return HttpResponse(template.render(context))

def pdf_download(request):

    filename = '%TEMP%/pet/new_temp.pdf'
    wrapper = FileWrapper(file(filename))
    response = HttpResponse(wrapper, mimetype='application/force-download')
    response['Content-Disposition'] = 'attachment; filename=%s' % os.path.basename(filename)
    response['Content-Length'] = os.path.getsize(filename)
    return response

    ##filepath = '%TEMP%/pet/new_temp.pdf'
    ##return serve(request, os.path.basename(filepath), os.path.dirname(filepath))

def xml_download(request):

    filename = '%TEMP%/pet/data.xml'
    wrapper = FileWrapper(file(filename))
    response = HttpResponse(wrapper, mimetype='application/force-download')
    response['Content-Disposition'] = 'attachment; filename=%s' % os.path.basename(filename)
    response['Content-Length'] = os.path.getsize(filename)
    return response




