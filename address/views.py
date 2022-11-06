"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
* Name: View handlers
*version: 0.3a
* Done:
* 1. Fetching polygons from the postgresql database and displaying them on the map
* 2. Editing polygonal objects
* 3. Display of attribute information
*
* In progress
* 4. Communication with the database on changing objects
* 5. Adding users to polygons
* 6. Adding a shooting folder on the server when selecting a polygon

* Author: Sarazhinskaya Maria
* Date: 07.02.2022
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

from django.shortcuts import render
from django.views.generic.edit import CreateView
from .models import Polygon
from django.http import JsonResponse, HttpResponse
import psycopg2 as ps2
from .Elements.polys_export import polys_export
import json

# Create your views here.

class PolygonView(CreateView):
    model = Polygon
    fields = ['geometry']
    template_name = 'addresses/home.html'
    success_url = '/'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['addresses'] = Polygon.objects.all()
        return context


def create_json_polys(request):

    data = polys_export()

    return JsonResponse(data, safe=False)


def update_objects_os(request):
    if request.method == "POST":
        data_post = json.loads(request.body)
        for el in data_post:
            if el['added'] is not None:
                descriptio = el["added"]["attributes"]["name"]
                status = el["added"]["attributes"]["status"]
                geom = {"type": "MultiPolygon", "coordinates": [el["added"]["geometry"]]}

                conn = ps2.connect(
                    database="testmap", user='postgres',
                    password='postgres', host='localhost', port='5432'
                )

                cursor_postgis = conn.cursor()

                sql = '''insert into temp_data.velo_polygons (descriptio, status, geom) values (%s,%s,ST_AsText(ST_GeomFromGeoJSON(%s)))'''
                cursor_postgis.execute(sql, [descriptio, status, str(geom)])
                conn.commit()
                conn.close()

        return HttpResponse(data_post)

    return HttpResponse("data upload process")

