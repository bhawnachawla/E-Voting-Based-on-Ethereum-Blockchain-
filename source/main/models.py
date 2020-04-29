from django.db import models
from django.contrib.auth.models import AbstractUser

class DummyUser(models.Model):
    first_name = models.CharField(max_length=20, blank=True, null=True)
    last_name = models.CharField(max_length=20, blank=True, null=True)
    DOB = models.DateField(blank=True, null=True)
    Type_Of_ID = models.CharField(max_length=144, blank=True, null=True)
    ID_Number = models.CharField(max_length=20, blank=True, null=True)
    email = models.CharField(max_length=45, blank=True, null=True)
    SIN = models.IntegerField(blank=True, null=True)
    Password = models.CharField(max_length=60, blank=True, null=True)

    class Meta:
        db_table = 'dummy'

class Vote(models.Model):
    id = models.IntegerField(primary_key=True)
    user_id = models.IntegerField()
    vote_result = models.IntegerField()
    privatekey = models.IntegerField( blank=True, null=True)
    get_right = models.IntegerField(blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)

    class Meta:
        db_table = 'vote'



class User(AbstractUser):
    id_type = models.CharField(max_length=30, blank=True, null=True)
    id_number = models.CharField(max_length=30, blank=True, null=True)
    class Meta:
        db_table = 'auth_user'
