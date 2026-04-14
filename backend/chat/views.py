from rest_framework import generics
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import ChatMessage
from .serializers import ChatMessageSerializer


@extend_schema(
    parameters=[
        OpenApiParameter(name="session_id", description="Chat session UUID", type=str, required=True),
    ],
)
class ChatHistoryView(generics.ListAPIView):
    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        session_id = self.request.query_params.get("session_id", "")
        return ChatMessage.objects.filter(session_id=session_id).order_by("-created_at")[:50]
