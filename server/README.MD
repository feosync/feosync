<!-- COMMANDE POUR DEMARER CELERY -->
celery -A app.celery.celery_app worker --pool=gevent --loglevel=info
