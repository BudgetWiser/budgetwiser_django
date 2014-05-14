from django.db import models

class Article(models.Model):
    title = models.CharField(max_length=200)                # Title of the article
    date = models.DateField()                               # Written date of the article
    s_url = models.URLField()                               # Source URL
    s_name = models.CharField(max_length=20)                # Source Name

    def __unicode__(self):
        return u'%s' % (self.title)

class Paragraph(models.Model):
    article = models.ForeignKey('Article', related_name="paragraphs")
    content = models.TextField()

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

class Range(models.Model):
    parent_elm = models.CharField(max_length=100)
    start = models.IntegerField()
    end = models.IntegerField()
    paragraph = models.ForeignKey('Paragraph', related_name="ranges")

class Factcheck(models.Model):
    FACT_SCORES = ((1, 1), (2, 2), (3, 3), (4, 4), (5, 5),)

    score = models.IntegerField(choices=FACT_SCORES)
    ref = models.URLField(null=True, blank=True)
    ref_score = models.IntegerField()
    paragraph = models.ForeignKey('Paragraph', related_name="factchecks")
    rangeof = models.ForeignKey('Range', related_name="factchecks")
