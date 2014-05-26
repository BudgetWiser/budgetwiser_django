from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponse, HttpResponseBadRequest
from django.core.serializers.json import DjangoJSONEncoder
import json

from budgetwiser.apps.annote.models import *

def list(request):
    articles = Article.objects.all()
    data = []
    for article in articles:
        item = {
            'id': article.id,
            'title': article.title,
            'date': article.date,
        }
        data.append(item)

    data_json = json.dumps(data, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)

    response_ctx = {
        'articles': data_json,
    }

    return render_to_response('list.html', response_ctx, context_instance=RequestContext(request))

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
            'c_count': paragraph.comments.all().count(),
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
        paragraphs = json.loads(request.GET.get('paragraphs', None))
        range_list = []

        for p_id in paragraphs:
            paragraph = Paragraph.objects.get(id=p_id)
            ranges = paragraph.ranges.all()
            for range in ranges:
                range_obj = {
                    'id': range.id,
                    'parent_elm': range.parent_elm,
                    'start': range.start,
                    'end': range.end,
                    'f_average': range.f_average,
                    'f_count': range.f_count,
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
        if len(range) == 0:
            paragraph_id = request.GET.get('paragraph_id', None)
            paragraph = Paragraph.objects.get(id=paragraph_id)

            new_range = Range(
                parent_elm=parent_elm,
                start=start,
                end=end,
                paragraph=paragraph,
                f_count=0,
                f_average=0,
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
                'id': range[0].id,
                'type': 1,
            }
            range_json = json.dumps(range_output, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)

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
            'num_goods': len(comment.good.all()),
        }
        child_list = []
        for child in comment.answers.all():
            child_obj = {
                'id': child.id,
                'user': child.user.username,
                'content': child.content,
                'ref': child.ref,
                'num_goods': len(child.good.all()),
                'num_bads': len(child.bad.all()),
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
    try:
        content = request.POST['content']
        ref = request.POST['ref']
        question = Comment.objects.get(id=request.POST['parent_id'])
        paragraph = question.paragraph

        if not ref.startswith('http://'):
            ref = ''
        '''
        # Code for debuggin
        content = 'test'
        ref = 'http://www.naver.com/'
        question = Comment.objects.get(id=1)
        paragraph = question.paragraph
        '''
        new_comment = Comment (
            typeof = 1,
            content = content,
            ref = ref,
            paragraph = paragraph,
            question = question,
            user = request.user,
        )

        new_comment.save()

        new_obj = {
            'id': new_comment.id,
            'user': new_comment.user,
            'content': new_comment.content,
            'ref': new_comment.ref,
            'num_goods': new_comment.num_goods,
            'num_bads': new_comment.num_bads,
        }

        new_json = _load_comment(paragraph.id)
        print new_json

        return HttpResponse(new_json)
    except:
        return HttpResponseBadRequest("error in write_answer")

def write_question(request):
    try:
    
        return HttpResponse("hahaha")
    except:
        return HttpResponseBadRequest("error in write_question")

def save_factcheck(request):
    try:
        range_id = request.GET.get('range_id', None)
        rangeof = Range.objects.get(id=range_id)
        paragraph = rangeof.paragraph
        print paragraph.id, rangeof.id

        score = request.GET.get('score', None)
        ref = request.GET.get('ref', None)
        print score, ref

        new_factcheck = Factcheck(
            score = score,
            ref = ref,
            rangeof = rangeof,
            paragraph = paragraph
        )
        new_factcheck.save()

        return HttpResponse("Factcheck saved")
    except:
        return HttpResponseBadRequest("Something wrong with 'save_factcheck'")

def get_comment(request):
    try:
        paragraph_id = request.GET.get('paragraph_id', None)
        paragraph = Paragraph.objects.get(id=paragraph_id)

        comments = paragraph.comments.all()

        comment_list = {
            'question_list': [],
            'answer_list': []
        }

        for comment in comments:
            comment_obj = {
                'id': comment.id,
                'writer': comment.writer,
                'typeof': comment.typeof,
                'content': comment.content,
                'ref': comment.ref,
                'rangeof': comment.rangeof_id,
                'question': comment.question_id,
                'num_goods': comment.num_goods,
                'num_bads': comment.num_bads,
            }
            if(comment.typeof == 0):
                comment_list['question_list'].append(comment_obj)
            else:
                comment_list['answer_list'].append(comment_obj)


        comment_list_json = json.dumps(comment_list, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)

        return HttpResponse(comment_list_json)
    except:
        return HttpResponseBadRequest("Something wrong with 'get_comment'")

def save_question(request):
    try:
        range_id = request.GET.get('range_id', None)
        content = request.GET.get('content', None)

        rangeof = Range.objects.get(id=range_id)

        new_comment = Comment (
            typeof = 0,
            content = content,
            paragraph = rangeof.paragraph,
            user = request.user,
            rangeof = rangeof,
            ref = '',
        )

        new_comment.save()

        return HttpResponse("good")
    except:
        return HttpResponseBadRequest("Something wrong with 'save_question'")
'''
return JSONObject
{'errno':   0 (if no error)
            1 (if already voted)
            2 (if already voted on other side)}
'''
def vote_good(request):
    try:
        if request.method == 'GET':
            return HttpResponseBadRequest("Invalid request on vote_good")
        else:
            user = User.objects.get(id=request.user.id)
            comment_id = request.POST['comment_id']
            comment = Comment.objects.get(id=comment_id)

            if user in comment.good.all():
                res_obj = json.dumps({'errno': 1}, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)
                return HttpResponse(res_obj)
            elif user in comment.bad.all():
                res_obj = json.dumps({'errno': 2}, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)
                return HttpResponse(res_obj)

            comment.good.add(user)
            res_obj = json.dumps({'errno': 0}, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)
            return HttpResponse(res_obj)
    except:
        return HttpResponseBadRequest("Something wrong with 'vote_good'")

'''
return JSONObject
{'errno':   0 (if no error)
            1 (if already voted)
            3 (if already voted on other side)}
'''

def vote_bad(request):
    try:
        if request.method == 'GET':
            return HttpResponseBadRequest("Invalid request on vote_bad")
        else:
            user = User.objects.get(id=request.user.id)
            comment_id = request.POST['comment_id']
            comment = Comment.objects.get(id=comment_id)

            if user in comment.bad.all():
                res_obj = json.dumps({'errno': 1}, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)
                return HttpResponse(res_obj)
            elif user in comment.good.all():
                res_obj = json.dumps({'errno': 2}, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)
                return HttpResponse(res_obj)

            comment.bad.add(user)
            res_obj = json.dumps({'errno': 0}, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)
            return HttpResponses(res_obj)
    except:
        return HttpResponseBadRequest("Something wrong with 'vote_bad'")
