"""
API URL configuration
"""
from django.urls import path
from . import views

urlpatterns = [
    path("chat/", views.chat),
    path("translate/", views.translate),
]
