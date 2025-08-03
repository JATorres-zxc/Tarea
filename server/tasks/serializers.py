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
    due_date = serializers.DateTimeField(required=False, allow_null=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    position = serializers.IntegerField(required=False)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 'priority', 
            'due_date', 'tags', 'createdAt', 'updatedAt', 
            'user', 'comments', 'position'
        ]
        read_only_fields = ['id', 'createdAt', 'updatedAt', 'user']

    def create(self, validated_data):
        print("validated_data in create:", validated_data)
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)