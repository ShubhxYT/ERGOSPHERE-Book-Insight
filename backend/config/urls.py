from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/books/", include("books.urls")),
    path("api/scrape/", include("scraper.urls")),
    path("api/rag/", include("rag.urls")),
    path("api/insights/", include("insights.urls")),
    path("api/chat/", include("chat.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
