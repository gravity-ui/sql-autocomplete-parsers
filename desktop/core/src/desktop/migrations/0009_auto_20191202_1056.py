# -*- coding: utf-8 -*-
# Generated by Django 1.11.20 on 2019-12-02 18:56
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('desktop', '0008_auto_20191031_0704'),
    ]

    operations = [
        migrations.AddField(
            model_name='document2permission',
            name='is_link_on',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='document2permission',
            name='perms',
            field=models.CharField(choices=[('read', 'read'), ('write', 'write'), ('comment', 'comment'), ('link_read', 'link read'), ('link_write', 'link write')], db_index=True, default='read', max_length=10),
        ),
    ]
