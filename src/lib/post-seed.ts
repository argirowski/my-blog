/**
 * Initial rows inserted when the SQLite `posts` table is empty.
 *
 * **`author`** must match a seeded `users.username` (`SEED_BLOG_AUTHOR_USERS`
 * in `src/lib/user-seed.ts`). On insert we set **`posts.user_id`** to that
 * author's id (one-to-many: user → posts).
 *
 * Each seed has an explicit `id` so you can see stable keys in this file and in
 * the DB after a fresh seed. **SQLite does not renumber ids when you delete:**
 * removing post `5` does not turn post `6` into `5`, and ids do not “count
 * down”. New posts still **increment** past the largest id used so far
 * (`AUTOINCREMENT`).
 */
export type PostSeed = {
  id: number;
  title: string;
  excerpt: string;
  publishedAt: string;
  author: string;
  content: string;
};

export const SEED_POSTS: PostSeed[] = [
  {
    id: 1,
    title: "Deploying a Next.js blog to Vercel",
    excerpt:
      "A short checklist for going from local dev to a live URL, without surprises.",
    publishedAt: "2026-05-12",
    author: "maya_chen",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\nExcepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio, et dictum nisi pharetra nec. Integer malesuada magna sed lectus ullamcorper, nec rutrum urna bibendum.\n\nVestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Maecenas sit amet tellus nec mi gravida lobortis. Nam convallis pellentesque facilisis. Aliquam erat volutpat. Sed euismod nisi vel augue tristique, vitae tempor libero efficitur.",
  },
  {
    id: 2,
    title: "Markdown vs rich text for posts",
    excerpt:
      "Picking a content format early saves refactoring: plain files, MDX, or a hosted editor.",
    publishedAt: "2026-05-10",
    author: "jordan_lee",
    content:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.\n\nNeque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.\n\nAt vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi.",
  },
  {
    id: 3,
    title: "Styling lists and post cards with Tailwind",
    excerpt:
      "Keep the index readable: spacing, borders, and focus states matter as much as typography.",
    publishedAt: "2026-05-09",
    author: "sam_rivera",
    content:
      "Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Cras mattis consectetur purus sit amet fermentum. Maecenas faucibus mollis interdum. Aenean lacinia bibendum nulla sed consectetur.\n\nEtiam porta sem malesuada magna mollis euismod. Donec id elit non mi porta gravida at eget metus. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nulla vitae elit libero, a pharetra augue.\n\nMorbi leo risus, porta ac consectetur ac, vestibulum at eros. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
  },
  {
    id: 4,
    title: "SEO basics for individual posts",
    excerpt:
      "Titles, descriptions, and Open Graph tags help links look good when shared.",
    publishedAt: "2026-05-08",
    author: "alex_kim",
    content:
      "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? Nunc id ligula non magna sagittis suscipit. Proin quis eros in sem vehicula molestie id non arcu.\n\nTemporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur.\n\nHarum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.",
  },
  {
    id: 5,
    title: "What to build next",
    excerpt:
      "Add create and edit flows, then extend persistence and validation as needed.",
    publishedAt: "2026-05-07",
    author: "riley_park",
    content:
      "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est mauris placerat eleifend leo.\n\nSuspendisse enim metus, varius vel nibh vitae, mattis semper justo. Phasellus faucibus scelerisque ligula, nec sagittis libero volutpat sit amet. Cras id lectus id justo dignissim fringilla. Integer tincidunt augue id magna sagittis, vel bibendum urna feugiat.\n\nQuisque volutpat condimentum velit class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis.",
  },
  {
    id: 6,
    title: "RSS feeds and letting readers follow your blog",
    excerpt:
      "A simple RSS or Atom route keeps power users happy and complements social sharing.",
    publishedAt: "2026-05-05",
    author: "maya_chen",
    content:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.\n\nNulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus.\n\nVivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet.",
  },
  {
    id: 7,
    title: "Draft posts and a simple publishing flow",
    excerpt:
      "A draft flag or separate collection avoids showing unfinished ideas on the public index.",
    publishedAt: "2026-05-03",
    author: "jordan_lee",
    content:
      "Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem.\n\nMaecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo sed fringilla mauris sit amet nibh.\n\nSed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus.",
  },
  {
    id: 8,
    title: "Welcome to the blog",
    excerpt:
      "This project seeds sample posts here so the UI has realistic content from day one.",
    publishedAt: "2026-05-01",
    author: "sam_rivera",
    content:
      "Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum.\n\nNam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt.\n\nDuis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien nec cursus.",
  },
  {
    id: 9,
    title: "Why define post types in TypeScript",
    excerpt:
      "Shared types between forms, server actions, and database rows catch mistakes early.",
    publishedAt: "2026-04-18",
    author: "alex_kim",
    content:
      "Integer auctor quam id sapien tincidunt, nec sollicitudin turpis sagittis. Vivamus hendrerit, arcu vitae dictum bibendum, ligula tortor vehicula urna, vel dictum sapien odio sit amet metus. Proin id urna vel est facilisis ullamcorper nec sit amet nisl.\n\nMauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Cras ultricies ligula sed magna dictum porta.\n\nPraesent sapien massa, convallis a pellentesque nec, egestas non nisi. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Nulla porttitor accumsan tincidunt. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem.",
  },
  {
    id: 10,
    title: "Caching and revalidation in App Router",
    excerpt:
      "When static is enough, when to reach for fetch cache tags, and how revalidatePath fits in.",
    publishedAt: "2026-05-13",
    author: "riley_park",
    content:
      "Next.js caches route segments and data fetches according to predictable rules. Painting a clear mental model early keeps you from fighting the framework later.\n\nStart with defaults: shared layouts can stay static while dynamic islands opt into server rendering or streaming. When a mutation changes underlying data, revalidatePath and revalidateTag line up nicely with SQLite or any other store you call from server actions.\n\nMeasure before micro-optimizing. Often the bottleneck is accidental waterfall fetches rather than stale HTML. Prefer colocating reads with the UI that consumes them.",
  },
  {
    id: 11,
    title: "SQLite in dev Postgres in prod",
    excerpt:
      "A single-file database keeps local setup trivial; planning the swap avoids schema surprises.",
    publishedAt: "2026-05-14",
    author: "maya_chen",
    content:
      "SQLite excels for prototypes and demos: zero daemons, easy backups, and honest SQL. Treat it as production-like only when traffic and concurrency stay modest.\n\nPostgres brings row-level tooling, richer types, and battle-tested pooling. Sketch your tables with portable SQL first—TEXT and INTEGER map cleanly—and flag features you might need later.\n\nMigrations deserve the same discipline everywhere. Ship additive changes before breaking ones, backfill defaults, then drop columns in a later release.",
  },
  {
    id: 12,
    title: "Accessible forms keyboard flows",
    excerpt:
      "Labels focus order error text and dialogs should work without touching the mouse.",
    publishedAt: "2026-05-15",
    author: "jordan_lee",
    content:
      "Every interactive control needs an accessible name, usually via a properly associated label. Prefer native elements first; they ship with keyboard support and sane roles.\n\nValidation messages should persist next to fields and expose aria-invalid plus aria-describedby so assistive tech reads them in context. Announce async errors politely without drowning the user.\n\nModals trap focus until dismissed, Esc closes, and the trigger regains focus on exit. Patterns like react-day-picker behave best when wrappers preserve those contracts.",
  },
];

/** Highest `id` present in `SEED_POSTS`. The next app-created row will use a higher id. */
export const SEED_MAX_POST_ID = Math.max(...SEED_POSTS.map((p) => p.id));
