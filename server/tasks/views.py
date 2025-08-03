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
        return Task.objects.filter(user=self.request.user).order_by('status', 'position')
    
    def perform_create(self, serializer):
        # Set initial position to the end of the current status column
        status = serializer.validated_data.get('status', Task.Status.TODO)
        last_position = Task.objects.filter(
            user=self.request.user,
            status=status
        ).aggregate(models.Max('position'))['position__max'] or 0
        serializer.save(
            user=self.request.user,
            position=last_position + 1
        )
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        try:
            status = request.data.get('status')
            new_order = request.data.get('order')
            
            if not status or not new_order:
                return Response(
                    {'error': 'Status and order are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            tasks = Task.objects.filter(
                user=request.user,
                id__in=new_order
            )
            
            # Update positions for all tasks in this status
            for index, task_id in enumerate(new_order):
                task = tasks.get(id=task_id)
                task.position = index + 1  # 1-based index
                task.save()
            
            return Response({'success': True})
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

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