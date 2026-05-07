# CareerON Landing — Reprise de session

## Ce qui est fait

- Landing page entièrement réécrite (positionnement B2B, sections OUTCOMES / ROI / STAKEHOLDERS / DIFFERENTIATION)
- CTAs remplacés partout par "Montrez-moi" / "Calculer mon ROI"
- Vercel déployé → https://careeron-landing-amber.vercel.app
- Repo GitHub → https://github.com/clement-sporrer/careeron-landing (auto-deploy sur push `main`)
- 7 env vars configurées sur Vercel (SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_*, CAL_*)
- Vercel Analytics + Speed Insights ajoutés
- Supabase MCP reconfiguré sur le bon projet (`fpqiwfmvliqauiqykvab`) via `.mcp.json`

## Ce qu'il reste à faire (dans l'ordre)

### 1. Appliquer la migration Supabase (MCP prêt, session redémarrée requise)

Le MCP est maintenant configuré sur `fpqiwfmvliqauiqykvab` mais la session doit être redémarrée pour qu'il soit actif.
**Action :** utilise le MCP Supabase pour appliquer `supabase/migrations/001_initial_schema.sql` sur le projet.
Les 3 tables à créer : `enterprise_leads`, `student_leads`, `booking_intents` (avec RLS activé).

### 2. Brancher les formulaires front → API

Les endpoints API sont prêts et déployés. Il faut les câbler dans `index.html` :

| Formulaire | Endpoint | Notes |
|---|---|---|
| Lead entreprise (calculateur) | `POST /api/lead-enterprise` | body: `{ email, ...rest }` |
| Lead étudiant | `POST /api/lead-student` | body: `{ email, ...rest }` |
| Bouton "Montrez-moi" (prise de RDV) | `POST /api/booking-intent` | body: `{ email, school, role, meeting_type: 'enterprise' \| 'founders' }` → retourne `{ cal_url }` → redirect |

### 3. Ajouter un domaine custom

Actuellement sur `careeron-landing-amber.vercel.app`. Ajouter le vrai domaine via Vercel dashboard.

### 4. Hero section — repositionner le message

Le hero dit encore "Accompagnez plus d'étudiants. Sans recruter plus." — à retravailler.
Pain point plus large que le recrutement : c'est tout le pilotage de l'employabilité.
Piste : partir du positionnement §5.4 du fichier `positionnement_careeron.md` (dispo dans `/Users/clementsporrer/Downloads/`).

### 5. GitHub auto-deploy (optionnel, nice-to-have)

Le repo `DoubleH10/careeron-landing` reste privé et non connecté.
Le nouveau repo `clement-sporrer/careeron-landing` est connecté et fonctionne.
Pour déployer : `git push clement-sporrer main`.
