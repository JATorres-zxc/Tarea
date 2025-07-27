from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Task, Comment
from .serializers import TaskSerializer, CommentSerializer
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        # Ensure we always return an array, even if empty
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data if serializer.data else [])

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        task = get_object_or_404(Task, id=task_id, user=self.request.user)
        return Comment.objects.filter(task=task).order_by('created_at')
    
    def perform_create(self, serializer):
        task_id = self.kwargs.get('task_id')
        task = get_object_or_404(Task, id=task_id, user=self.request.user)
        serializer.save(task=task, user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        # Ensure we always return an array, even if empty
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data if serializer.data else [])