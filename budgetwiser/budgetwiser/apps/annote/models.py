from django.db import models
from django.db.models.signals import post_save, pre_delete
from django.contrib.auth.models import User

class Article(models.Model):
    title = models.CharField(max_length=200)                # Title of the article
    date = models.DateField()                               # Written date of the article
    s_url = models.URLField()                               # Source URL
    s_name = models.CharField(max_length=20)                # Source Name
    user = models.ForeignKey('User', related_name="articles", null=True, blank=True)

    def __unicode__(self):
        return u'%s' % (self.title)


class Paragraph(models.Model):
    article = models.ForeignKey('Article', related_name="paragraphs")
    content = models.TextField()

    c_count = models.IntegerField()                         # Comment Count

    def __unicode__(self):
        return u'%s' % (self.id)


class Comment(models.Model):
    COMMENT_TYPES = ((0, 'question'), (1, 'answer'),)

    writer = models.CharField(max_length=200)
    typeof = models.IntegerField(choices=COMMENT_TYPES)
    content = models.TextField()
    ref = models.URLField(null=True, blank=True)
    paragraph = models.ForeignKey('Paragraph', related_name="comments")
    rangeof = models.ForeignKey('Range', related_name="comments", null=True, blank=True)
    question = models.ForeignKey('Comment', related_name="answers", null=True, blank=True)

    user = models.ForeignKey('User', related_name="articles", null=True, blank=True)
    good = models.ManyToManyField('User', null=True, blank=True)
    bad = models.ManyToManyField('User', null=True, blank=True)
    g_count = models.IntegerField(default=0)                # Good reaction count
    b_count = models.IntegerField(default=0)                # Bad reaction coutn


class Range(models.Model):
    parent_elm = models.CharField(max_length=100)
    start = models.IntegerField()
    end = models.IntegerField()
    paragraph = models.ForeignKey('Paragraph', related_name="ranges")

    f_count = models.IntegerField()                         # Factcheck Count
    f_average = models.FloatField()                         # Factcheck Average


class Factcheck(models.Model):
    FACT_SCORES = ((1, 1), (2, 2), (3, 3), (4, 4), (5, 5),)

    score = models.IntegerField(choices=FACT_SCORES)
    ref = models.URLField(null=True, blank=True)
    ref_score = models.IntegerField()
    rangeof = models.ForeignKey('Range', related_name="factchecks")

    user = models.ForeignKey('User', related_name="articles", null=True, blank=True)
    ref_users = models.ManyToManyField('User', null=True, blank=True)


# BEFORE AND AFTER, SAVE OR DELETE

def increase_comment_count(sender, **kwargs):
    c_obj = kwargs['instance']
    p_obj = c_obj.paragraph
    p_obj.c_count += 1
    p_obj.save()

def decrease_comment_count(sender, **kwargs):
    c_obj = kwargs['instance']
    p_obj = c_obj.paragraph
    p_obj.c_count -= 1
    p_obj.save()

def increase_factcheck_count(sender, **kwargs):
    f_obj = kwargs['instance']
    r_obj = f_obj.rangeof
    o_average = r_obj.f_average * r_obj.f_count
    c_average = (o_average + f_obj.score)/(r_obj.f_count + 1)
    r_obj.f_average = c_average
    r_obj.f_count += 1
    r_obj.save()

def decrease_factcheck_count(sender, **kwargs):
    f_obj = kwargs['instance']
    r_obj = f_obj.rangeof
    o_average = r_obj.f_average * r_obj.f_count
    c_average = (o_average - f_obj.score)/(r_obj.f_count - 1)
    r_obj.f_average = c_average
    r_obj.f_count -= 1
    r_obj.save()

post_save.connect(increase_comment_count, sender=Comment)
pre_delete.connect(decrease_comment_count, sender=Comment)
post_save.connect(increase_factcheck_count, sender=Factcheck)
pre_delete.connect(decrease_factcheck_count, sender=Factcheck)
