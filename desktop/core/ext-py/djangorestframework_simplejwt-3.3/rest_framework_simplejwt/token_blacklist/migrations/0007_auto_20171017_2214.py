# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-10-17 22:14
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('token_blacklist', '0006_auto_20171017_2113'),
    ]

    operations = [
        migrations.AlterField(
            model_name='outstandingtoken',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='outstandingtoken',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
