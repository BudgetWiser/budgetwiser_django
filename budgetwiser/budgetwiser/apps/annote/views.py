from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
import json
import logging

# Create your views here.
def main(request):
    data = _read_demodb()
    
    return render(request, 'annote.html', {'comments': data})
    
def write_comment(request):
    if request.method == 'GET':
        return HttpResponseRedirect('/annote/')
    else:
        data = _read_demodb()

        username = request.POST.get('username', 0)
        content = request.POST.get('content', 0)
        reference = request.POST.get('reference', 0)
        data.append({'username': username, 'content': content, 'reference': reference})

        f = open('demodb.json', 'w')
        json.dump(data, f)

        # change to HttpResponseRedirect
        return HttpResponseRedirect('/annote/')
        
def _read_demodb():
    f = open('demodb.json', 'r')
    raw = json.loads(f.read())
    f.close()
    data = []
    for jsonobj in raw:
        data.append(jsonobj)
        
    return data
