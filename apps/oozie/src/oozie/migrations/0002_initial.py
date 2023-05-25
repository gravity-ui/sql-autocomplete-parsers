# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-06-06 18:55
from __future__ import unicode_literals

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('oozie', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='node',
            name='children',
            field=models.ManyToManyField(related_name='parents', through='oozie.Link', to='oozie.Node'),
        ),
    ]
