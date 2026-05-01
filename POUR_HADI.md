# Salut Hadi 👋

Voilà un rapide récap de ce qui a été mis en place côté infra pour le landing CareerON.

## Ce qui est fait

### Base de données (Supabase)
Trois tables ont été créées dans le projet Supabase du landing :

- **`enterprise_leads`** — pour les soumissions du formulaire lead magnet entreprises
- **`student_leads`** — pour les soumissions du formulaire lead magnet étudiants
- **`booking_intents`** — pour capturer les données du formulaire *avant* la redirection vers Cal.eu (comme ça, si quelqu'un remplit le formulaire mais ne booke pas, on a quand même ses infos)

RLS activé sur les trois tables. L'API utilise la service role key, donc pas besoin de policies publiques.

### API serverless (Vercel)
Quatre routes sont prêtes dans le dossier `api/` :

| Route | Rôle |
|---|---|
| `POST /api/lead-enterprise` | Enregistre un lead entreprise + envoie un email de notif |
| `POST /api/lead-student` | Enregistre un lead étudiant + envoie un email de notif |
| `POST /api/booking-intent` | Sauvegarde les infos du formulaire, retourne un UUID à passer en metadata Cal.eu |
| `POST /api/webhooks/cal` | Webhook Cal.eu (prévu mais optionnel pour l'instant) |

### Emails (Resend)
Les notifs partent depuis `clement@sporrer.fr` vers `clement@sporrer.fr` + ton adresse. À toi d'adapter si besoin.

## Ce qu'il te reste à faire

1. **Ton lien Cal.eu** — ajoute-le dans les env vars Vercel (`CAL_FOUNDERS_URL` pour toi, `CAL_ENTERPRISE_URL` pour Clément). Le lien de Clément : `https://cal.eu/clementsporrer/30min`
2. **Brancher les formulaires** — les endpoints sont prêts, il suffit de faire les `POST` depuis le front :
   - Formulaire lead entreprise → `POST /api/lead-enterprise`
   - Formulaire lead étudiant → `POST /api/lead-student`
   - Formulaire de prise de RDV → `POST /api/booking-intent` (récupère l'UUID retourné et passe-le en `?metadata[intent_id]=...` dans l'URL Cal.eu)

## Variables d'environnement

Tout est documenté dans `.env.example` à la racine. Demande à Clément les valeurs réelles si tu en as besoin.

---

Des questions ? Ping Clément ou regarde directement les fichiers dans `api/` — tout est commenté.
