# Matrice des permissions

| Action | ADMIN | ENSEIGNANT | ETUDIANT |
|---|---|---|---|
| Lister les étudiants | Oui (tous) | Oui (tous) | Seulement lui-même |
| Consulter un étudiant | Oui | Oui | Seulement son profil (sinon 403) |
| Créer un étudiant | Oui | Non (403) | Non (403) |
| Modifier un étudiant | Oui (tous les champs) | Seulement filiere, niveau, moyenne | Non (403) |
| Supprimer un étudiant | Oui | Non (403) | Non (403) |
| Consulter son profil (/api/auth/me) | Oui | Oui | Oui |

## Règles
- Sans session valide : 401. Rôle insuffisant : 403.
- Le rôle est lu en base à chaque requête, jamais fourni par le client.
- L'inscription crée toujours un ETUDIANT ; ADMIN et ENSEIGNANT sont attribués en base.
- Un étudiant qui accède au profil d'un autre reçoit 403 (protection IDOR).
- Aucune réponse ne contient le champ password.