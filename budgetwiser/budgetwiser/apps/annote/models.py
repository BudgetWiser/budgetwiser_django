from django.db import models

class Article(models.Model):
    # author = models.ForeignKey(User)
    title = models.CharField(max_length=50)
    datetime = models.DateTimeField(auto_now=True)
    content = models.TextField()
    href = models.CharField(max_length=200)

class Highlight(models.Model):
    # author = models.ForeignKey(User)
    xcor = models.IntegerField()
    ycor = models.IntegerField()
    width = models.IntegerField()
    height = models.IntegerField()

class Comment(models.Model):
    # author = models.ForeignKey(User)
    article = models.ForeignKey(Article)
    datetime = models.DateTimeField(auto_now=True)
    content = models.TextField()
    category = models.IntegerField()
    # highlight = models.ForeignKey(Highlight)
    # head = models.ForeignKey(Comment)
    num_likes = models.IntegerField()
    num_dislikes = models.IntegerField()

