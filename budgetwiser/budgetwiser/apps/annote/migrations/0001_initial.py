# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Article'
        db.create_table(u'annote_article', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('subtitle', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('date', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
            ('s_url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('s_name', self.gf('django.db.models.fields.CharField')(max_length=20)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(blank=True, related_name='articles', null=True, to=orm['auth.User'])),
            ('pre_survey', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('post_survey', self.gf('django.db.models.fields.URLField')(max_length=200)),
        ))
        db.send_create_signal(u'annote', ['Article'])

        # Adding model 'Paragraph'
        db.create_table(u'annote_paragraph', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('article', self.gf('django.db.models.fields.related.ForeignKey')(related_name='paragraphs', to=orm['annote.Article'])),
            ('content', self.gf('django.db.models.fields.TextField')()),
            ('c_count', self.gf('django.db.models.fields.IntegerField')(default=0)),
        ))
        db.send_create_signal(u'annote', ['Paragraph'])

        # Adding model 'Comment'
        db.create_table(u'annote_comment', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('typeof', self.gf('django.db.models.fields.IntegerField')()),
            ('content', self.gf('django.db.models.fields.TextField')()),
            ('ref', self.gf('django.db.models.fields.URLField')(max_length=200, null=True, blank=True)),
            ('paragraph', self.gf('django.db.models.fields.related.ForeignKey')(related_name='comments', to=orm['annote.Paragraph'])),
            ('rangeof', self.gf('django.db.models.fields.related.ForeignKey')(blank=True, related_name='comments', null=True, to=orm['annote.Range'])),
            ('question', self.gf('django.db.models.fields.related.ForeignKey')(blank=True, related_name='answers', null=True, to=orm['annote.Comment'])),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(blank=True, related_name='comments', null=True, to=orm['auth.User'])),
            ('num_goods', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('num_bads', self.gf('django.db.models.fields.IntegerField')(default=0)),
        ))
        db.send_create_signal(u'annote', ['Comment'])

        # Adding M2M table for field good on 'Comment'
        m2m_table_name = db.shorten_name(u'annote_comment_good')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('comment', models.ForeignKey(orm[u'annote.comment'], null=False)),
            ('user', models.ForeignKey(orm[u'auth.user'], null=False))
        ))
        db.create_unique(m2m_table_name, ['comment_id', 'user_id'])

        # Adding M2M table for field bad on 'Comment'
        m2m_table_name = db.shorten_name(u'annote_comment_bad')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('comment', models.ForeignKey(orm[u'annote.comment'], null=False)),
            ('user', models.ForeignKey(orm[u'auth.user'], null=False))
        ))
        db.create_unique(m2m_table_name, ['comment_id', 'user_id'])

        # Adding model 'Range'
        db.create_table(u'annote_range', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('parent_elm', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('start', self.gf('django.db.models.fields.IntegerField')()),
            ('end', self.gf('django.db.models.fields.IntegerField')()),
            ('paragraph', self.gf('django.db.models.fields.related.ForeignKey')(related_name='ranges', to=orm['annote.Paragraph'])),
            ('f_count', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('f_average', self.gf('django.db.models.fields.FloatField')(default=0)),
            ('r_count', self.gf('django.db.models.fields.IntegerField')(default=0)),
        ))
        db.send_create_signal(u'annote', ['Range'])

        # Adding M2M table for field req_users on 'Range'
        m2m_table_name = db.shorten_name(u'annote_range_req_users')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('range', models.ForeignKey(orm[u'annote.range'], null=False)),
            ('user', models.ForeignKey(orm[u'auth.user'], null=False))
        ))
        db.create_unique(m2m_table_name, ['range_id', 'user_id'])

        # Adding model 'Factcheck'
        db.create_table(u'annote_factcheck', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('score', self.gf('django.db.models.fields.IntegerField')()),
            ('ref', self.gf('django.db.models.fields.URLField')(max_length=200, null=True, blank=True)),
            ('ref_score', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('rangeof', self.gf('django.db.models.fields.related.ForeignKey')(related_name='factchecks', to=orm['annote.Range'])),
            ('paragraph', self.gf('django.db.models.fields.related.ForeignKey')(related_name='factchecks', to=orm['annote.Paragraph'])),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(blank=True, related_name='factchecks', null=True, to=orm['auth.User'])),
        ))
        db.send_create_signal(u'annote', ['Factcheck'])

        # Adding M2M table for field ref_users on 'Factcheck'
        m2m_table_name = db.shorten_name(u'annote_factcheck_ref_users')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('factcheck', models.ForeignKey(orm[u'annote.factcheck'], null=False)),
            ('user', models.ForeignKey(orm[u'auth.user'], null=False))
        ))
        db.create_unique(m2m_table_name, ['factcheck_id', 'user_id'])


    def backwards(self, orm):
        # Deleting model 'Article'
        db.delete_table(u'annote_article')

        # Deleting model 'Paragraph'
        db.delete_table(u'annote_paragraph')

        # Deleting model 'Comment'
        db.delete_table(u'annote_comment')

        # Removing M2M table for field good on 'Comment'
        db.delete_table(db.shorten_name(u'annote_comment_good'))

        # Removing M2M table for field bad on 'Comment'
        db.delete_table(db.shorten_name(u'annote_comment_bad'))

        # Deleting model 'Range'
        db.delete_table(u'annote_range')

        # Removing M2M table for field req_users on 'Range'
        db.delete_table(db.shorten_name(u'annote_range_req_users'))

        # Deleting model 'Factcheck'
        db.delete_table(u'annote_factcheck')

        # Removing M2M table for field ref_users on 'Factcheck'
        db.delete_table(db.shorten_name(u'annote_factcheck_ref_users'))


    models = {
        u'annote.article': {
            'Meta': {'object_name': 'Article'},
            'date': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'post_survey': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'pre_survey': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            's_name': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            's_url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'subtitle': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'articles'", 'null': 'True', 'to': u"orm['auth.User']"})
        },
        u'annote.comment': {
            'Meta': {'object_name': 'Comment'},
            'bad': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'bads'", 'null': 'True', 'symmetrical': 'False', 'to': u"orm['auth.User']"}),
            'content': ('django.db.models.fields.TextField', [], {}),
            'good': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'goods'", 'null': 'True', 'symmetrical': 'False', 'to': u"orm['auth.User']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'num_bads': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'num_goods': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'paragraph': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'comments'", 'to': u"orm['annote.Paragraph']"}),
            'question': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'answers'", 'null': 'True', 'to': u"orm['annote.Comment']"}),
            'rangeof': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'comments'", 'null': 'True', 'to': u"orm['annote.Range']"}),
            'ref': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'typeof': ('django.db.models.fields.IntegerField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'comments'", 'null': 'True', 'to': u"orm['auth.User']"})
        },
        u'annote.factcheck': {
            'Meta': {'object_name': 'Factcheck'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'paragraph': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'factchecks'", 'to': u"orm['annote.Paragraph']"}),
            'rangeof': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'factchecks'", 'to': u"orm['annote.Range']"}),
            'ref': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'ref_score': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'ref_users': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['auth.User']", 'null': 'True', 'blank': 'True'}),
            'score': ('django.db.models.fields.IntegerField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'factchecks'", 'null': 'True', 'to': u"orm['auth.User']"})
        },
        u'annote.paragraph': {
            'Meta': {'object_name': 'Paragraph'},
            'article': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'paragraphs'", 'to': u"orm['annote.Article']"}),
            'c_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'content': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'annote.range': {
            'Meta': {'object_name': 'Range'},
            'end': ('django.db.models.fields.IntegerField', [], {}),
            'f_average': ('django.db.models.fields.FloatField', [], {'default': '0'}),
            'f_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'paragraph': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'ranges'", 'to': u"orm['annote.Paragraph']"}),
            'parent_elm': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'r_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'req_users': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'req_ranges'", 'null': 'True', 'symmetrical': 'False', 'to': u"orm['auth.User']"}),
            'start': ('django.db.models.fields.IntegerField', [], {})
        },
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'related_name': "u'user_set'", 'blank': 'True', 'to': u"orm['auth.Group']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'related_name': "u'user_set'", 'blank': 'True', 'to': u"orm['auth.Permission']"}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        }
    }

    complete_apps = ['annote']