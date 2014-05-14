from django.contrib import admin
from budgetwiser.apps.annote.models import Article, Paragraph, Comment, Range, Factcheck

class ArticleAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'date', 's_name',)
    ordering = ('id', 'date',)

class ParagraphAdmin(admin.ModelAdmin):
    list_display = ('id', 'article', 'content',)
    ordering = ('id', 'article',)

class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'writer', 'type', 'content',)
    ordering = ('id', 'type',)

class RangeAdmin(admin.ModelAdmin):
    list_display = ('id', 'parent_elm', 'start', 'end',)
    ordering = ('start', 'end', 'paragraph',)

class FactcheckAdmin(admin.ModelAdmin):
    list_display = ('id', 'score', 'ref', 'ref_score',)
    ordering = ('id', 'score',)

admin.site.register(Article, ArticleAdmin)
admin.site.register(Paragraph, ParagraphAdmin)
admin.site.register(Comment, CommentAdmin)
admin.site.register(Range, RangeAdmin)
admin.site.register(Factcheck, FactcheckAdmin)
