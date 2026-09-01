# Reference cookbook intake

The 15 user-supplied PDFs are private, research-only discovery inputs. They are
not production assets and are never uploaded to public Storage, bundled into the
application, or used as publishable recipe copy.

The committed candidate manifest contains only factual titles, SHA-256 source
hashes, franchise/category hints, and PDF page locators. It intentionally omits
ingredients, quantities, instructions, expressive prose, scans, artwork, and
other source media.

## Current intake

- 15 supplied PDF editions processed.
- 817 title occurrences retained.
- 807 distinct normalized titles retained.
- All records are `research_only` and `candidate`.
- The release gate is a minimum of 420 independently authored recipes, not a
  maximum catalog size.

| Source                                       | Candidate occurrences |
| -------------------------------------------- | --------------------: |
| The Anime Chef Cookbook                      |                    75 |
| Avatar: The Last Airbender Official Cookbook |                    62 |
| Bake Anime                                   |                    75 |
| Black Butler Cookbook                        |                    26 |
| Dr. Stone Unofficial Cookbook                |                    45 |
| FFXV Community Cookbook                      |                    65 |
| Food Wars recipe compilation                 |                    60 |
| Let's Make Ramen!                            |                    51 |
| Mila Brady Studio Ghibli Cookbook            |                    35 |
| Naruto Anime Recipes                         |                    30 |
| The Official Disney Parks Cookbook           |                   101 |
| One Piece: Pirate Recipes                    |                    44 |
| Stardew Valley Cookbook                      |                    93 |
| Studio Ghibli Recipe Book                    |                     9 |
| The Unofficial Studio Ghibli Cookbook        |                    46 |

## Publication boundary

A candidate is not a published recipe. Before publication, Anime FooDex must
independently author and kitchen-test the recipe, verify appearance evidence,
review allergens and regional substitutions, obtain original or licensed media,
and receive culinary and rights approval. Published recipe prose must never be
copied or lightly paraphrased from a reference cookbook.

The private extraction workflow sanitizes PDF actions before analysis. The FFXV
edition's embedded print action was removed from the sanitized research copy.
Only the original file hash is retained in the committed manifest.
