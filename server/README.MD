<!-- COMMANDE POUR DEMARER CELERY -->
celery -A app.celery.celery_app worker --pool=gevent --loglevel=info


<!-- DOCKER COMPOSE -->
docker compose --env-file path  build  