import { getSortedMockFeedPosts } from "@/lib/mock/feed";
import { FeedPostCard } from "@/features/feed/components/feed-post-card";

/**
 * Fil d'actualité façon réseau professionnel, commun aux deux rôles
 * (athlète/recruteur) : photos et actualités publiées par les athlètes,
 * annonces de recrutement publiées par les clubs/agences. Données 100%
 * fictives (voir `lib/mock/feed.ts`).
 */
export function Feed() {
  const posts = getSortedMockFeedPosts();

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 md:px-6">
      <h2 className="text-base font-semibold">Fil d&apos;actualité</h2>
      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune actualité pour le moment.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <FeedPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
