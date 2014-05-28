from django.db import models
from django.db.models.signals import post_save, pre_delete
from django.contrib.auth.models import User

class Article(models.Model):
    title = models.CharField(max_length=200)                # Title of the article
    subtitle = models.CharField(max_length=200)             # Subtitle of the article
    date = models.DateTimeField(auto_now=True)              # Written datetime of the article
    s_url = models.URLField(null=False)                     # Source URL
    s_name = models.CharField(max_length=20)                # Source Name
    user = models.ForeignKey(User, related_name="articles", null=True, blank=True)

    def __unicode__(self):
        return u'%s' % (self.title)

class Paragraph(models.Model):
    article = models.ForeignKey('Article', related_name="paragraphs")
    content = models.TextField()

    # num_comments = models.IntegerField(default=0)                         # Comment Count
    c_count = models.IntegerField(default=0)                # Comment Count

    def __unicode__(self):
        return u'%s' % (self.id)

class Comment(models.Model):
    COMMENT_TYPES = ((0, 'question'), (1, 'answer'),)

    typeof = models.IntegerField(choices=COMMENT_TYPES, null=False)
    content = models.TextField(null=False)
    ref = models.URLField(null=True, blank=True)
    paragraph = models.ForeignKey('Paragraph', related_name="comments")
    rangeof = models.ForeignKey('Range', related_name="comments", null=True, blank=True)
    question = models.ForeignKey('Comment', related_name="answers", null=True, blank=True)

    user = models.ForeignKey(User, related_name="comments", null=True, blank=True)
    good = models.ManyToManyField(User, related_name="goods", null=True, blank=True)
    bad = models.ManyToManyField(User, related_name="bads", null=True, blank=True)
    num_goods = models.IntegerField(default=0)                # Good reaction count
    num_bads = models.IntegerField(default=0)                 # Bad reaction coutn


class Range(models.Model):
    parent_elm = models.CharField(max_length=100)
    start = models.IntegerField()
    end = models.IntegerField()
    paragraph = models.ForeignKey('Paragraph', related_name="ranges")

    # num_factchk = models.IntegerField(default=0)              # Factcheck Count
    # avg_factchk = models.FloatField(default=0)                # Factcheck Average
    f_count = models.IntegerField(default=0)                         # Factcheck Count
    f_average = models.FloatField(default=0)                         # Factcheck Average

    req_users = models.ManyToManyField(User, related_name="req_ranges", null=True, blank=True)
    r_count = models.IntegerField(default=0)                   # request count

    def __unicode__(self):
        return u'%s__%d_%d' % (self.parent_elm, self.start, self.end)

class Factcheck(models.Model):
    score = models.IntegerField()
    ref = models.URLField(null=True, blank=True)
    ref_score = models.IntegerField(default=0)
    rangeof = models.ForeignKey('Range', related_name="factchecks")
    paragraph = models.ForeignKey('Paragraph', related_name="factchecks")

    user = models.ForeignKey(User, related_name="factchecks", null=True, blank=True)
    ref_users = models.ManyToManyField(User, null=True, blank=True)


# BEFORE AND AFTER, SAVE OR DELETE

def increase_comment_count(sender, **kwargs):
    c_obj = kwargs['instance']
    p_obj = c_obj.paragraph
    # p_obj.num_comments += 1
    # p_obj.c_count += 1
    p_obj.c_count = p_obj.comments.count()
    p_obj.save()

def decrease_comment_count(sender, **kwargs):
    c_obj = kwargs['instance']
    p_obj = c_obj.paragraph
    # p_obj.num_comments -= 1
    p_obj.c_count += 1
    p_obj.save()

def increase_factcheck_count(sender, **kwargs):
    f_obj = kwargs['instance']
    r_obj = f_obj.rangeof
    o_average = r_obj.f_average * r_obj.f_count
    c_average = (o_average + int(f_obj.score))/(r_obj.f_count + 1)
    r_obj.f_average = c_average
    r_obj.f_count += 1
    r_obj.save()

def decrease_factcheck_count(sender, **kwargs):
    f_obj = kwargs['instance']
    r_obj = f_obj.rangeof
    o_average = r_obj.f_average * r_obj.f_count
    if(r_obj.f_count==1):
        r_obj.f_average = 0
    else:
        c_average = (o_average - f_obj.score)/(r_obj.f_count - 1)
        r_obj.f_average = c_average
    r_obj.f_count -= 1
    r_obj.save()

post_save.connect(increase_comment_count, sender=Comment)
pre_delete.connect(decrease_comment_count, sender=Comment)
post_save.connect(increase_factcheck_count, sender=Factcheck)
pre_delete.connect(decrease_factcheck_count, sender=Factcheck)
