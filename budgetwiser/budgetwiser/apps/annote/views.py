from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponse, HttpResponseBadRequest
from django.core.serializers.json import DjangoJSONEncoder
import json

from budgetwiser.apps.annote.models import *

def index(request, article_id):
    article = Article.objects.get(id=article_id)
    paragraphs = article.paragraphs.all()

    data = {
        'id': article.id,
        'title': article.title,
        'date': article.date,
        'url': article.s_url,
        'press': article.s_name,
        'paragraphs': [],
    }
    for paragraph in paragraphs:
        p_data = {
            'id': paragraph.id,
            'content': paragraph.content,
            'num_comments': paragraph.comments.all().count(),
        }
        data['paragraphs'].append(p_data)

    data_json = json.dumps(data, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)

    response_context = {
        'article': article,
        'paragraphs': paragraphs,
        'data': data_json,
    }

    return render_to_response('index.html', response_context, context_instance=RequestContext(request))

def get_range(request):
    try:
        paragraphs = request.GET.getlist('paragraphs', None)
        range_list = []

        for paragraph in paragraphs:
            ranges = paragraph.ranges.all()
            for range in ranges:
                range_obj = {
                    'id': range.id,
                    'parent_elm': range.parent_elm,
                    'start': range.start,
                    'end': range.end,
                    'f_average': range.f_average,
                }
                range_list.append(range_obj)

        range_list_json = json.dumps(range_list, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)

        return HttpResponse(range_list_json)
    except:
        return HttpResponseBadRequest("Something wrong with 'get_range'")

def save_range(request):
    try:
        parent_elm = request.GET.get('parent_elm', None)
        start = request.GET.get('start', None)
        end = request.GET.get('end', None)
        range = Range.objects.filter(parent_elm=parent_elm, start=start, end=end)

        if range.count() == 0:
            paragraph_id = request.GET.get('paragraph_id', None)
            paragraph = Paragraph.objects.get(id=paragraph_id)

            new_range = Range(
                parent_elm=parent_elm,
                start=start,
                end=end,
                paragraph=paragraph,
                num_factchk=0,
                avg_factchk=0,
            )
            new_range.save()

            range_output = {
                'id': new_range.id,
                'type': 0,
            }
            range_json = json.dumps(range_output, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)

            return HttpResponse(range_json)
        else:
            range_output = {
                'id': range.id,
                'type': 1,
            }
            return HttpResponse(range_json)
    except:
        return HttpResponseBadRequest("Something wrong with 'save_range'")

def get_factcheck(request):
    try:
        range_id = request.GET.get('range_id', None)
        factchecks = Factcheck.objects.filter(rangeof__id=range_id)
        factcheck_list = []

        for factcheck in factchecks:
            factcheck_obj = {
                'id': factcheck.id,
                'score': factcheck.score,
                'ref': factcheck.ref,
                'ref_score': factcheck.ref_score,
            }
            factcheck_list.append(factcheck_obj)

        factcheck_list_json = json.dumps(factcheck_list, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)

        return HttpResponse(factcheck_list_json)
    except:
        return HttpResponseBadRequest("Something wrong with 'get_factcheck'")


def _load_comment(paragraph_id):
    paragraph = Paragraph.objects.get(id=paragraph_id)
    comment_list = []

    for comment in paragraph.comments.filter(typeof=0):     # Only select question
        comment_obj = {
            'id': comment.id,
            'user': comment.user.username,
            'typeof': comment.typeof,
            'content': comment.content,
            'ref': comment.ref,
            'num_goods': comment.num_goods,
        }
        child_list = []
        for child in comment.answers.all():
            child_obj = {
                'id': child.id,
                'user': child.user.username,
                'content': child.content,
                'ref': child.ref,
                'num_goods': child.num_goods,
                'num_bads': child.num_bads,
            }
            child_list.append(child_obj)
        comment_obj['answers'] = child_list

        comment_list.append(comment_obj)

    comment_list_json = json.dumps(comment_list, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)

    return comment_list_json


def load_comment(request):
    try:
        comment_list_json = _load_comment(request.GET.get('paragraph_id', None))

        return HttpResponse(comment_list_json)
    except:
        return HttpResponseBadRequest("Error in load_comment()")


def write_answer(request):
    print 'write_answer'
    try:
        print 'try'
        '''
        content = request.POST.get('content', None)
        ref = request.POST.get('ref', None)
        question = Comment.objects.get(id=request.POST.get('parent_id', None))
        paragraph = question.paragraph

        new_comment = Comment (
            typeof = 1,
            content = content,
            ref = ref,
            paragraph = paragraph,
            question = question,
            user = request.user
        )
        new_comment.save()

        new_obj = {
            'id': new_comment.id,
            'user': new_comment.user,
            'content': new_comment.content,
            'ref': new_comment.ref,
            'num_goods': new_comment.num_goods,
            'num_bads': new_commentl.num_bads,
        }

        new_json = json.dumps(new_obj, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)
        '''

        return HttpResponse(new_json)
    except:
        print 'except'
        return HttpResponseBadRequest("error in write_answer")

def write_question(request):
    try:
    
        return HttpResponse("hahaha")
    except:
        return HttpResponseBadRequest("error in write_question")
