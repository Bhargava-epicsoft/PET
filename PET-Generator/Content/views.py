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

    create_pet_dest = subprocess.call(['mkdir', '/tmp/pet'])
    delete_dest = subprocess.call(['rm', '/tmp/pet/dest.csv'])
    create_dest = subprocess.call(['touch', '/tmp/pet/dest.csv'])

    csvfile = open("/tmp/pet/dest.csv", "r+")
    csvfile.write(data)
    csvfile.close()

    print data

    delete_dest = subprocess.call(['rm', '/tmp/pet/data.xml'])
    create_dest = subprocess.call(['touch', '/tmp/pet/data.xml'])

    csvfile = open("/tmp/pet/data.xml", "r+")
    csvfile.write(xml_data)
    csvfile.close()

    download_original_pdf = subprocess.call(['curl','-o','/tmp/pet/temp.pdf','http://localhost:8080/serve/'+pdf_url])
    embed_named_destinations = subprocess.call(['PDFNamedDestination', '/tmp/pet/temp.pdf', '/tmp/pet/new_temp.pdf' ,'/tmp/pet/dest.csv'])

    template = loader.get_template('main.html')
    context = RequestContext(request, {
        'base_template': 'template.html',
    })

    return HttpResponse(template.render(context))

def pdf_download(request):

    filename = '/tmp/pet/new_temp.pdf'
    wrapper = FileWrapper(file(filename))
    response = HttpResponse(wrapper, mimetype='application/force-download')
    response['Content-Disposition'] = 'attachment; filename=%s' % os.path.basename(filename)
    response['Content-Length'] = os.path.getsize(filename)
    return response

    ##filepath = '/tmp/pet/new_temp.pdf'
    ##return serve(request, os.path.basename(filepath), os.path.dirname(filepath))

def xml_download(request):

    filename = '/tmp/pet/data.xml'
    wrapper = FileWrapper(file(filename))
    response = HttpResponse(wrapper, mimetype='application/force-download')
    response['Content-Disposition'] = 'attachment; filename=%s' % os.path.basename(filename)
    response['Content-Length'] = os.path.getsize(filename)
    return response




