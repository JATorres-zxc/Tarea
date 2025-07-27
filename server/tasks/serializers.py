from rest_framework import serializers
from .models import Task, Comment
from django.contrib.auth import get_user_model

User = get_user_model()

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'timestamp', 'user']
        read_only_fields = ['id', 'timestamp', 'user']

class TaskSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    dueDate = serializers.DateTimeField(source='due_date', required=False, allow_null=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 'priority', 
            'dueDate', 'tags', 'createdAt', 'updatedAt', 
            'user', 'comments'  # Removed pomodoroCount
        ]
        read_only_fields = ['id', 'createdAt', 'updatedAt', 'user']

    def create(self, validated_data):
        if 'dueDate' in validated_data:
            validated_data['due_date'] = validated_data.pop('dueDate')
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        if 'dueDate' in validated_data:
            validated_data['due_date'] = validated_data.pop('dueDate')
        return super().update(instance, validated_data)