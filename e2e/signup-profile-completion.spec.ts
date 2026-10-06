import { test, expect } from "@playwright/test";

/**
 * Ce test nécessite un vrai projet Supabase (local via `supabase start` ou
 * distant) avec la confirmation d'e-mail désactivée pour l'environnement de
 * test (sinon l'inscription reste bloquée en attente de confirmation et le
 * parcours ne peut pas être automatisé de bout en bout).
 *
 * Tant que `.env.local` contient les valeurs placeholder livrées par défaut
 * (`xxxxxxxxxxxx.supabase.co`), ce test est automatiquement ignoré pour ne
 * pas faire échouer la CI/les lancements locaux sans backend réel. Voir
 * README.md > "Tests" pour la procédure de configuration.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const hasRealSupabase =
  supabaseUrl.length > 0 && !supabaseUrl.includes("xxxxxxxxxxxx");

test.skip(
  !hasRealSupabase,
  "Nécessite un vrai projet Supabase (NEXT_PUBLIC_SUPABASE_URL réel, confirmation email désactivée en test). Voir README.md > Tests.",
);

test.describe("Parcours inscription -> complétion de profil", () => {
  test("un nouvel athlète peut s'inscrire puis compléter son profil", async ({
    page,
  }) => {
    const uniqueSuffix = Date.now();
    const email = `e2e-athlete-${uniqueSuffix}@example.com`;
    const password = "Password123!";
    const username = `e2e_athlete_${uniqueSuffix}`;

    // 1. Inscription
    await page.goto("/fr/register");
    await page.getByLabel(/e-mail/i).fill(email);
    await page.getByLabel(/^mot de passe$/i).fill(password);
    await page.getByLabel(/confirmer/i).fill(password);
    await page.getByLabel(/date de naissance/i).fill("1998-05-20");
    await page.getByLabel(/rôle|athlète/i).selectOption("athlete");
    await page.getByLabel(/conditions/i).check();
    await page.getByRole("button", { name: /créer un compte/i }).click();

    // 2. Connexion (en l'absence de confirmation email en environnement de
    // test, le compte est actif immédiatement).
    await page.goto("/fr/login");
    await page.getByLabel(/e-mail/i).fill(email);
    await page.getByLabel(/mot de passe/i).fill(password);
    await page.getByRole("button", { name: /se connecter/i }).click();

    // 3. Redirection vers le parcours d'édition de profil guidé.
    await expect(page).toHaveURL(/\/profile\/edit/);

    // Étape 1 : identité
    await page.getByLabel(/pseudo/i).fill(username);
    await page.getByLabel(/pays/i).fill("FR");
    await page.getByRole("button", { name: /suivant/i }).click();

    // Étape 2 : sports
    await page.getByLabel(/sport/i).first().selectOption({ index: 1 });
    await page.getByLabel(/niveau/i).first().selectOption("amateur");
    await page.getByRole("button", { name: /suivant/i }).click();

    // Étape 3 : disponibilité
    await page.getByRole("button", { name: /suivant/i }).click();

    // Étape 4 : visibilité + validation finale
    await page.getByRole("button", { name: /terminer|enregistrer/i }).click();

    // 4. Le profil est enregistré : retour à la page de profil avec les
    // informations saisies visibles.
    await expect(page).toHaveURL(/\/profile(?!\/edit)/);
    await expect(page.getByText(username)).toBeVisible();
  });
});
