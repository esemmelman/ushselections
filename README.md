# High Holiday usher volunteers

Public, read-only roster for 2026. Five columns display each volunteer whose corresponding Supabase boolean is strictly `true`. Names are sorted alphabetically. The page loads current data on opening, refreshes every minute while visible, and includes a manual refresh button.

## Data source

Project: `bnaimitzvah` (`fgomaujsdblpzxhnnqrg`). Table: `public.usher_high_holiday_volunteers_2026_v1`.

| Heading | Boolean column |
| --- | --- |
| Erev Rosh Hashana | usher_erev_rosh_hashana_selected |
| Rosh Hashana | usher_rosh_hashana_selected |
| Kol Nidre | usher_kol_nidre_selected |
| Yom Kippur | usher_yom_kippur_morning_selected |
| Mincha | usher_yom_kippur_afternoon_evening_selected |

Names use `usher_volunteer_name`. The browser uses a Supabase publishable key, with column-level SELECT grants limited to names and these five selections. An RLS SELECT policy permits public reads of rows having at least one selected service. IDs and submission timestamps are not granted public SELECT access. Existing submission policies remain in place. No secret/service-role credentials or volunteer records are stored in this repository.

## Hosting and development

GitHub Pages serves the root of the `main` branch. No build or dependencies are needed. Serve this folder with any static HTTP server for local preview. Run `npm test` to check service grouping. Edit volunteer selections in Supabase; no redeploy is needed for data changes.
