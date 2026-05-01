ADD A SECRET FOR PRIVATE DOCKER REPO

   kubectl create secret docker-registry regcred \
 --docker-username=nandrainadev \
 --docker-password=token_docker_hub \
 --docker-email=email.example


AUTH REDIS SERVER

kubectl create secret generic redis-secret \
  --from-literal=redis-password=ton_mot_de_passe