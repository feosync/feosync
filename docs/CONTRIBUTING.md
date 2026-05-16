# 📋 Guide de Contribution - Feosync

Bienvenue dans feosync ! Ce guide établit les standards pour les branches, commits et la gestion des issues.

---

## 📑 Table des matières

1. [Noms de branches](#noms-de-branches)
2. [Messages de commit](#messages-de-commit)
3. [Lier les issues](#lier-les-issues)
4. [Workflow complet](#workflow-complet)
5. [Checklist PR](#checklist-pr)

---

## 🌿 Noms de branches

### Format Standard

```
<type>/<module>
```

### Types de branches

| Type | Usage | Exemple |
|------|-------|---------|
| **feat** | Nouvelle fonctionnalité | `feat/jwt-validation` |
| **fix** | Correction de bug | `fix/sync-timeout` |
| **refactor** | Refactorisation | `refactor/db-queries` |
| **test** | Tests et QA | `test/auth` |
| **docs** | Documentation | `docs/readme` |
| **chore** | Maintenance, deps | `chore/update-deps` |

### Règles des noms

✅ **À FAIRE :**
- Utiliser des **tirets** (pas d'underscores)
- **Minuscules** uniquement
- **Descriptif et court** : max 30 caractères après le type
- Exemple valide : `feat/incremental-sync`

❌ **À ÉVITER :**
- Espaces ou caractères spéciaux : `feat/my feature` ❌
- Majuscules : `Feat/MyModule` ❌
- Trop long : `feat/this-is-a-very-long-module-name` ❌
- Sans contexte : `feat/update` ❌

### Exemples complets pour feosync

```bash
# Feature
feat/jwt-token-refresh
feat/incremental-sync
feat/webhook-support

# Bugfix
fix/duplicate-job-processing
fix/sync-timeout
fix/memory-leak-workers

# Refactoring
refactor/auth-middleware
refactor/sync-engine

# Tests
test/rate-limit

# Documentation
docs/api-documentation

# Maintenance
chore/update-dependencies
chore/upgrade-node-20
```

---

## 💬 Messages de Commit

### Format Standard (Conventional Commits)

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types de commits

| Type | Usage | Exemple |
|------|-------|---------|
| **feat** | Nouvelle fonctionnalité | `feat(auth): add JWT validation` |
| **fix** | Correction de bug | `fix(sync): handle timeout error` |
| **docs** | Documentation seulement | `docs: update README` |
| **style** | Formatting, code style | `style: format with prettier` |
| **refactor** | Refactorisation du code | `refactor(db): simplify queries` |
| **test** | Tests et QA | `test(api): add rate limit tests` |
| **chore** | Maintenance, dépendances | `chore: update dependencies` |
| **perf** | Optimisation performance | `perf(sync): cache user queries` |
| **ci** | CI/CD, GitHub Actions | `ci: add deployment workflow` |

### Règles du Subject

- ✅ Commence par une **minuscule**
- ✅ Pas de point à la fin
- ✅ **Impératif** : "add" pas "added" ou "adds"
- ✅ **Max 50 caractères**
- ✅ Clair et descriptif

### Scope (optionnel mais recommandé)

```
(auth)         # Authentification
(api)          # API REST
(db)           # Base de données
(sync)         # Moteur de sync
(workers)      # Job workers
(notifications) # Notifications
(ui)           # Interface utilisateur
(infra)        # Infrastructure
```

### Exemples de commits simples

```bash
# Fix
git commit -m "fix(sync): handle connection timeout"

# Feature
git commit -m "feat(api): add rate limiting"

# Documentation
git commit -m "docs: update deployment guide"

# Refactoring
git commit -m "refactor(auth): extract JWT logic"

# Tests
git commit -m "test(workers): add job queue tests"

# Chore
git commit -m "chore: update Node.js to 20.10"
```

### Commit complet avec body

```bash
git commit -m "feat(sync-engine): add incremental sync

Implement incremental sync to reduce bandwidth and improve performance.
Only fetch changes since last sync timestamp.

Changes:
- Add last_sync_at column to sources table
- Implement delta detection logic
- Add sync progress tracking
- Add retry mechanism for failed syncs

Closes #156"
```

### Multi-ligne via terminal

```bash
git commit
```

Puis dans l'éditeur :

```
feat(api): add caching layer

Implement Redis caching for frequently accessed endpoints.
Reduce database load by 40%.

- Add redis client integration
- Cache responses for 1 hour
- Add cache invalidation on updates
- Add cache hit/miss metrics

Closes #189
```

### Sauter une ligne et entrer le mode édition

```bash
git commit -m "feat(auth): implement OAuth2" -m "
- Add Google OAuth integration
- Add Facebook OAuth integration
- Add token refresh flow

Closes #42"
```

---

## 🔗 Lier les Issues

### Mots-clés magiques pour fermer une issue

Utilise ces mots-clés dans un commit ou une PR pour **fermer automatiquement** une issue :

| Mot-clé | Ferme l'issue |
|---------|---------------|
| `Closes #42` | ✅ |
| `Fixes #42` | ✅ |
| `Resolves #42` | ✅ |
| `Related to #42` | ❌ (juste un lien) |

### ⚠️ IMPORTANT : Quand ça s'active ?

```
✅ Fonctionne quand mergé dans main/develop
❌ Ne fonctionne PAS dans les branches de feature

Workflow :
1. Commit dans feat/42-xxx → Issue reste OUVERTE
2. PR créée → "Will close #42 when merged"
3. PR mergée dans main → Issue FERMÉE automatiquement ✅
```

### Exemples avec issues

```bash
# Ferme une issue
git commit -m "fix(sync): handle timeout

Closes #234"

# Ferme plusieurs issues
git commit -m "feat(api): refactor authentication

Closes #42
Closes #43
Closes #44"

# Référence sans fermer
git commit -m "refactor(db): optimize queries

Related to #156"

# Issue dans le body
git commit -m "feat(sync): add incremental sync

Implement delta sync strategy.

Closes #156"

# Avec PR (recommendation)
# Dans la description de la PR :
# Closes #156
# Closes #189
```

---

## 🔄 Workflow Complet

### Étape 1 : Créer une branche depuis une issue

```bash
git checkout -b feat/jwt-validation
```

### Étape 2 : Développer avec des commits clairs

```bash
# Premier commit
git commit -m "feat(auth): implement JWT token generation

- Add JWT token creation in login endpoint
- Add token expiration (1 hour)
- Add token signing with secret key"

# Deuxième commit
git commit -m "feat(auth): add JWT token validation

- Add middleware to verify JWT tokens
- Add signature verification
- Add expiration check"

# Fix d'un bug découvert
git commit -m "fix(auth): handle expired token gracefully

Return 401 Unauthorized instead of crashing"
```

### Étape 3 : Push et créer une PR

```bash
git push origin feat/jwt-validation
```

Puis sur GitHub :
1. Crée une PR
2. Dans la description, ajoute : `Closes #42`
3. Décris tes changements

**Exemple de description PR :**

```markdown
## Description
Implémente la validation JWT pour sécuriser les endpoints API.

## Changements
- Ajout du middleware JWT
- Validation des tokens
- Gestion des tokens expirés
- Tests unitaires

## Closes
Closes #42

## Testing
- [x] Tests unitaires passent
- [x] Tests d'intégration passent
- [x] Testé en local
```

### Étape 4 : Review et merge

1. Attends les reviews
2. Applique les changements si nécessaire
3. Une fois approuvé → **Merge dans main**
4. ✅ Issue #42 **ferme automatiquement**

---

## ✅ Checklist PR

Avant de créer une PR, vérifie :

```
[ ] Branch correctement nommée (feat/module)
[ ] Tous les commits ont des messages clairs
[ ] Au moins un commit lie l'issue (Closes #42)
[ ] Code testé localement
[ ] Pas de console.log() ou code de debug
[ ] Documentation mise à jour si nécessaire
[ ] Tests ajoutés ou mis à jour
[ ] Pas de dépendances inutiles
[ ] Pas de secrets/credentials en plaintext

Avant merge :
[ ] Tous les tests passent
[ ] Au moins 1 review approuvée
[ ] Pas de conflits de merge
[ ] PR description complète et claire
```

---

## 📊 Résumé Rapide

### Branche
```
feat/jwt-validation
↑    ↑
type module
```

### Commit
```
feat(auth): add JWT token validation

- Add middleware to verify JWT
- Add token expiration check

Closes #42
↑
Link à l'issue
```

### Issue → Commit → PR → Merge → Close

```
Issue #42 créée
    ↓
Branche : feat/jwt-validation
    ↓
Commit avec "Closes #42"
    ↓
PR créée
    ↓
PR mergée dans main
    ↓
✅ Issue #42 fermée automatiquement
```

---

## 🚨 Erreurs courantes à éviter

❌ **Noms de branches**
```
my-feature          # Pas de type
Feat/MyModule       # Majuscules
feature_branch      # Underscores
fix                 # Pas de module
```

❌ **Messages de commit**
```
Fixed the bug                    # Pas de type
update code                      # Pas descriptif
feat: ADD JWT                    # Majuscule au sujet
feat(auth): added JWT validation # "added" au lieu de "add"
```

❌ **Lier les issues**
```
# Issue reste ouverte (pas mergé dans main)
feat/jwt-validation → commit "Closes #42" → dans feature branch ❌

# Mauvais mot-clé
"Linked to #42" → pas de fermeture auto ❌
```

---

## 💡 Tips & Tricks

### Voir l'historique des commits
```bash
git log --oneline --graph
```

### Amender le dernier commit (avant de push)
```bash
git commit --amend --no-edit
```

### Voir les branches locales
```bash
git branch -a
```

### Supprimer une branche locale
```bash
git branch -d feat/42-jwt-validation
```

### Voir les remotes
```bash
git remote -v
```

### Remettre à jour ta branche depuis main
```bash
git fetch origin
git rebase origin/main
```

---

## 📞 Questions ?

Si tu as des questions sur :
- Les noms de branches
- Les messages de commit
- La liaison des issues
- Le workflow complet

Consulte ce guide ou ouvre une issue ! 🚀

---

## 📚 Ressources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub - Linking Issues and PRs](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)
- [Git Documentation](https://git-scm.com/doc)

---

**Version:** 1.0  
**Dernière mise à jour:** 2026-05-16  
**Pour feosync organization**