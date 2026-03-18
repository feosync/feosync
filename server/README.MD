<!-- COMMANDE POUR DEMARER CELERY -->
celery -A app.celery_app worker --pool=gevent --loglevel=info