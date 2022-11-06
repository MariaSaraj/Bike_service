"""
Testing application

Not in work now :(

"""

from django.db import models
import geocoder
from django.contrib.gis.db import models

STATUS_CHOICES = (
    (0, 'free'),
    (1, 'ordered')
)


class Polygon(models.Model):

    id = models.AutoField(primary_key=True)
    date = models.DateTimeField()
    status = models.IntegerField(choices=STATUS_CHOICES)
    #user = models.IntegerField(choices=Users_CHOICES)
    geometry = models.PolygonField()

class Survey(models.Model):
    region = models.ForeignKey(Polygon, on_delete=models.CASCADE)
    identificator = models.IntegerField()
    path = models.CharField(max_length=250)




    '''def save(self, *args, **kwargs):

        self.latitude = geocoder.osm(self.address).lat
        self.longitude = geocoder.osm(self.address).lng
        return super(Address, self).save(*args, **kwargs)

        return super(Polygon, self).save(*args, **kwargs)'''

