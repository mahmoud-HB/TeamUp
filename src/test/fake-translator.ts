/**
 * Traducteur factice utilisé dans les tests unitaires : renvoie la clé
 * elle-même, ce qui permet d'affirmer facilement quel message d'erreur
 * est déclenché sans dépendre des catalogues next-intl.
 */
export const t = (key: string) => key;
