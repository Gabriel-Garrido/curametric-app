from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('curametric_wound_api', '0003_woundcare_wound_ia_recomendation'),
    ]

    operations = [
        migrations.RenameField(
            model_name='woundcare',
            old_name='wound_heigh',
            new_name='wound_height',
        ),
        migrations.AlterField(
            model_name='woundcare',
            name='wound_secondary_dressing',
            field=models.TextField(blank=True, default='', null=True),
        ),
        migrations.AddField(
            model_name='woundcare',
            name='wound_borders',
            field=models.TextField(blank=True, default='', null=True),
        ),
    ]
