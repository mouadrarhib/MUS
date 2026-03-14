# MUS Recommendation and Personalization Logic

## Objective

Build a deterministic recommendation system that ranks published resources for each authenticated user using:

- academic profile match,
- fixed taxonomy tag affinity,
- content quality signals,
- freshness,
- and explainable reasons.

This version is optimized for reliability and traceability (rule-based scoring), not black-box ML.

---

## Data Inputs

### 1. User academic profile

From `student_profiles` + linked catalog tables:

- `program_name`
- `level_name`
- `semester_name`
- adjacent semesters from same level (`sort_order ± 1`)

### 2. User preference tags

From `user_tag_preferences`:

- fixed taxonomy only
- no free-form tags

### 3. Resource metadata

From `resources` + `resource_tags` + engagement tables:

- `metadata.academicContext.programName`
- `metadata.academicContext.levelName`
- `metadata.academicContext.semesterName`
- tag overlap
- downloads, favorites, ratings
- publication date

---

## Candidate Generation

`sp_recommendation_get_for_user(p_user_id, p_limit)` starts with candidates that are:

- `status = 'published'`
- not created by the same user (`created_by <> p_user_id`)

This keeps the recommendation feed focused on discoverable content.

---

## Scoring Model (v1)

The total score is the sum of weighted sub-scores:

1. **Tag score (0..35)**
   - ratio of matched preferred tags to total preferred tags
   - formula: `(matched_tags / total_user_tags) * 35`

2. **Program match (+20)**
   - if `resource_program == user_program`

3. **Level match (+10)**
   - if `resource_level == user_level`

4. **Semester match**
   - exact semester: `+25`
   - adjacent semester: `+12`

5. **Quality score (capped at 15)**
   - combines engagement + ratings
   - `LEAST(15, ln(downloads+1)*4 + avg_rating*2 + ln(favorites+1)*2)`

6. **Freshness score**
   - uploaded in last 30 days: `+5`
   - uploaded in last 90 days: `+2`

The final score is rounded and sorted descending.

---

## Explainability Layer

Each recommended resource returns `match_reasons[]`, for example:

- `Matches your preferred tags`
- `Matches your program`
- `Matches your level`
- `Matches your semester`
- `Matches adjacent semester`
- `Popular and highly rated`
- `Recently uploaded`

This reason list is intended for UI chips/subtext to improve user trust.

---

## APIs

### Tag preferences

- `GET /api/personalization/me/tags`
- `PUT /api/personalization/me/tags`
  - payload: `{ "tag_ids": [1, 3, 8] }`

### Recommendations

- `GET /api/personalization/me/recommendations?limit=24`

### Registration integration

`/auth/register` supports optional:

- `preferred_tag_ids: number[]`

When present, preferences are persisted right after account creation.

---

## Public Website Rule

The landing page is **marketing-only**. No anonymous resource browsing.

- `/` shows product definition + value proposition + CTA
- content access requires registration/login

---

## Evolution Roadmap

1. Add behavioral re-ranking (views, clicks, dwell, saves).
2. Add negative feedback signals (hide/not relevant).
3. Add multi-objective diversification (format/type spread).
4. Introduce A/B weighting profiles.
5. Consider hybrid ML reranking only after sufficient interaction volume.
