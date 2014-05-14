from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponse, HttpResponseBadRequest
from django.core.serializers.json import DjangoJSONEncoder
import json

from budgetwiser.apps.annote.models import Article, Range

def index(request, article_id):
    article = Article.objects.get(id=article_id)
    paragraphs = article.paragraphs.all()

    response_context = {
        'article': article,
        'paragraphs': paragraphs,
    }

    return render_to_response('index.html', response_context, context_instance=RequestContext(request))

def save_range(request):
    try:
        container_id = request.GET.get('container_id', None)
        start = request.GET.get('start', None)
        end = request.GET.get('end', None)
        print (Range.objects.filter(start=start, end=end))

        if len(Range.objects.filter(start=start, end=end)) == 0:
            new_range = Range(container_id=container_id, start=start, end=end)
            new_range.save()
            return HttpResponse("saved")
        else:
            return HttpResponse("dup")

    except:
        return HttpResponseBadRequest("error")

def load_range(request):
    try:
        ranges = Range.objects.all()
        ranges_list = []

        for item in ranges:
            range_item = {
                'container_id':item.container_id,
                'start':item.start,
                'end':item.end
            }
            ranges_list.append(range_item)

        output = json.dumps(ranges_list, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)
        print output

        return HttpResponse(output)
    except:
        return HttpResponseBadRequest("XXX")
