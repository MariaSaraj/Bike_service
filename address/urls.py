"""
URL

"""

from django.urls import path
from .views import PolygonView
from . import views

urlpatterns = [

    path('', PolygonView.as_view(), name='home'),
    path('JsonPoly/', views.create_json_polys, name='JsonPoly'),
    path('DataAdd/', views.update_objects_os, name='DataAdd')
]