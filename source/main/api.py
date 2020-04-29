from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from main.models import Vote, DummyUser
from django.contrib.auth import get_user_model
User = get_user_model()
import uuid

@api_view(['POST', 'GET'])
def setVoterActive(request, pk):
    if request.method == 'POST':
        uid = pk
        vote = Vote.objects.filter(user_id=uid)
        user = User.objects.get(id=uid)
        if not user:
            return Response("invalid user id", status=status.HTTP_400_BAD_REQUEST)
        dummy = DummyUser.objects.filter(email=user.email)
        if not dummy:
            return Response("user not exist in dummy govt database", status=status.HTTP_400_BAD_REQUEST)
        new_id = uuid.uuid1().int >> 64
        if vote:
            vote = vote[0]
            vote.user_id = uid
            vote.privatekey = new_id
            vote.vote_result = -1
            vote.get_right = 1
            vote.status = 0
        else:
            vote = Vote(user_id=uid, vote_result=-1, privatekey=new_id, get_right=1, status=0)
        vote.save()
        user.is_active = 1
        user.save()
        # return Response({"msg":"success","pk":"aaa"}, status=status.HTTP_201_CREATED)
        return JsonResponse({"msg": "success","pk": new_id})
    elif request.method == 'GET':
        new_id = uuid.uuid1().int >> 64
        return JsonResponse({"msg": "success","pk": new_id})


@api_view(['POST', 'GET'])
def voteTo(request,uid,propasal):
    if request.method == 'POST':
        user = User.objects.get(id=uid)
        if user:
            user.is_voted = True
            user.save()
        vote = Vote.objects.filter(user_id=uid)
        if vote:
            vote = vote[0]
            vote.vote_result = propasal
            vote.status = 1
            vote.save()
        return JsonResponse({"msg": "success"})
    elif request.method == 'GET':
        return JsonResponse({"msg": "success"})
