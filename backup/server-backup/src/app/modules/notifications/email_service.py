"""Email notifications via Resend."""
from __future__ import annotations

import resend

from src.app.core.config.settings import settings
from src.app.core.logging.logger import get_logger

logger = get_logger(__name__)

resend.api_key = settings.RESEND_API_KEY


async def send_password_reset_email(to_email: str, token: str) -> None:
    reset_url = f"https://app.feosync.com/reset-password?token={token}"
    try:
        resend.Emails.send({
            "from": f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>",
            "to": [to_email],
            "subject": "Réinitialisation de votre mot de passe – FeoSync",
            "html": f"""
<h2>Réinitialisation du mot de passe</h2>
<p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
<p><a href="{reset_url}">{reset_url}</a></p>
<p>Ce lien est valable 1 heure.</p>
<p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
""",
        })
        logger.info("password_reset_email_sent", to=to_email)
    except Exception as exc:
        logger.error("email_send_failed", error=str(exc))


async def send_email_verification(to_email: str, token: str) -> None:
    verify_url = f"https://app.feosync.com/verify-email?token={token}"
    try:
        resend.Emails.send({
            "from": f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>",
            "to": [to_email],
            "subject": "Vérifiez votre adresse email – FeoSync",
            "html": f"""
<h2>Bienvenue sur FeoSync ! 🚀</h2>
<p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
<p><a href="{verify_url}">{verify_url}</a></p>
<p>Ce lien est valable 24 heures.</p>
""",
        })
    except Exception as exc:
        logger.error("email_send_failed", error=str(exc))


async def send_weekly_report_email(to_email: str, org_name: str, stats: dict) -> None:
    try:
        resend.Emails.send({
            "from": f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>",
            "to": [to_email],
            "subject": f"Rapport hebdomadaire – {org_name}",
            "html": f"""
<h2>Rapport de la semaine – {org_name}</h2>
<ul>
  <li>Posts publiés : {stats.get('posts_published', 0)}</li>
  <li>Portée totale : {stats.get('total_reach', 0):,}</li>
  <li>Nouveaux abonnés : {stats.get('new_followers', 0)}</li>
</ul>
<p>Consultez votre dashboard pour plus de détails.</p>
""",
        })
    except Exception as exc:
        logger.error("email_send_failed", error=str(exc))
