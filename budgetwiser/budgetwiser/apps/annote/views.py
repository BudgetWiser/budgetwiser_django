from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseRedirect
from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.auth import login, authenticate
from django.conf import settings

from budgetwiser.apps.annote.models import *

from random import randrange
import json, os


def list(request):
    if not request.user.is_authenticated():
        with open(os.path.join(settings.PROJECT_DIR, 'pktlist.json')) as data_file:
            data = json.load(data_file)
        rand_id = randrange(len(data))
        rand_name = data[str(rand_id)]
        print rand_id, rand_name

        if User.objects.filter(username=rand_name).count():
            user = authenticate(username=rand_name, password=rand_id)
            login(request, user)
        else:
            user = User.objects.create_user(rand_name, email=None, password=rand_id)
            user.save()
            user = authenticate(username=rand_name, password=rand_id)
            login(request, user)

    articles = Article.objects.all()
    data = []
    for article in articles:
        item = {
            'id': article.id,
            'title': article.title,
            'date': article.date,
        }

        users = {}
        cnt_comments = 0
        for p in article.paragraphs.all():
            cnt_comments += p.comments.count();
            for c in p.comments.all():
                users[c.user] = c.user
        item['num_comments'] = cnt_comments
        item['num_users'] = len(users)
        data.append(item)

    data_json = json.dumps(data, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)

    response_ctx = {
        'user': request.user,
        'articles': data_json,
    }

    return render_to_response('list.html', response_ctx, context_instance=RequestContext(request))

def index(request, article_id):
    if request.user.is_authenticated():
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
                'num_comments': paragraph.comments.count(),
            }
            print paragraph.comments.count()
            data['paragraphs'].append(p_data)

        data_json = json.dumps(data, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)

        response_context = {
            'article': article,
            'paragraphs': paragraphs,
            'data': data_json,
            'user': request.user,
        }

        return render_to_response('index.html', response_context, context_instance=RequestContext(request))
    else:
        return HttpResponseRedirect('/annote/list/')

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


def _load_comment(paragraph_id, session):
    paragraph = Paragraph.objects.get(id=paragraph_id)
    comment_list = []

    for comment in paragraph.comments.filter(typeof=0):     # Only select question
        comment_obj = {
            'id': comment.id,
            'user': comment.user.username,
            'typeof': comment.typeof,
            'range': comment.rangeof.id,
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

    print session
    ctx = {
        'session': session,
        'comments': comment_list,
    }
    print ctx

    comment_list_json = json.dumps(ctx, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)

    return comment_list_json


def load_comment(request):
    try:
        comment_list_json = _load_comment(request.GET.get('paragraph_id', None), request.user.username)

        return HttpResponse(comment_list_json)
    except:
        return HttpResponseBadRequest("Error in load_comment()")

def write_answer(request):
    try:
        content = request.POST['content']
        ref = request.POST['ref']
        question = Comment.objects.get(id=request.POST['parent_id'])
        paragraph = question.paragraph

        new_comment = Comment (
            typeof = 1,
            content = content,
            ref = ref,
            paragraph = paragraph,
            rangeof = question.rangeof,
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

        new_json = _load_comment(paragraph.id, request.user.username)

        return HttpResponse(new_json)
    except:
        return HttpResponseBadRequest("error in write_answer")

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
@return JSONObject
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

'''
return JSONObject
{'errno':   0 (no error)
            1 (already requested),
 'r_count': number of requests,}
'''

def request_factcheck(request):
    try:
        if request.method == 'POST':
            return HttpResponseBadRequest("Invalid request type on request_factcheck")
        else:
            requser = User.objects.get(id=request.user.id)
            range_id = request.GET.get('range_id', None)
            
            range_obj = Range.objects.get(id=range_id)
            if requser in range_obj.req_users.all():
                res_obj = json.dumps({'errno': 1, 'r_count': range_obj.r_count}, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)
                return HttpResponse(res_obj)
            else:
                range_obj.req_users.add(requser)
                range_obj.r_count += 1
                range_obj.save()

                res_obj = json.dumps({'errno': 0, 'r_count': range_obj.r_count}, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)
                return HttpResponse(res_obj)

    except:
        return HttpResponseBadRequest('Factcheck request failed')

def list_factcheck(request):
    try:
        if request.method == 'POST':
            return HttpResponseBadRequest("Invalid request type on request_factcheck")
        else:
            range_id = request.GET.get('range_id', None)

            res = []
            for fc in Range.objects.get(id=range_id).factchecks.all():
                fc_json = {
                    'id': fc.id,
                    'score': fc.score,
                    'ref': fc.ref,
                    'ref_score': fc.ref_score,
                }
                res.append(fc_json)
            res_obj = json.dumps(res, ensure_ascii=False, indent=4, cls=DjangoJSONEncoder)
            return HttpResponse(res_obj)

    except:
        return HttpResponseBadRequest('Factcheck list failed')
