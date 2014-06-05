from django.db import models

# Create your models here.
class Scale(models.Model):
    mainCat = models.CharField(max_length=200)
    broadCat = models.CharField(max_length=200)
    age = models.CharField(max_length=200)
    sub1 = models.CharField(max_length=200)
    sub2 = models.CharField(max_length=200)
    raters = models.CharField(max_length=200)
    scale = models.CharField(max_length=200)
    abbrev = models.CharField(max_length=200)
    def __unicode__(self):  # Python 3: def __str__(self):
        return self.mainCat