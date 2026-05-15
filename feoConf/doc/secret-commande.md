ADD A SECRET FOR PRIVATE DOCKER REPO

   kubectl create secret docker-registry regcred \
 --docker-username=nandrainadev \
 --docker-password="dckr_pat_39Mo_TxunucW_tFKa9K8zxAtA5o" \
 --docker-email=nandraina.dev22@gmail.com -n dev-feosync-app


AUTH REDIS SERVER

kubectl create secret generic redis-secret \
  --from-literal=redis-password=ton_mot_de_passe


BACK ENV 
kubectl create secret generic back-env --from-env-file=.back.env -n dev-feosync-app

FRONT ENV
kubectl create secret generic front-env --from-env-file=.front.env -n dev-feosync-app

FEOSYNC DB SECRET

kubectl create secret generic feosync-db-secret \
  --from-literal=username=feosync_owner \
  --from-literal=password=feosync_password

