// itemLookupSources.ts — the `|dropsfrom` and `|foraged` field parsers, split out of
// itemLookupParse.ts to keep that file under the max-lines bar. Re-exported there, so every
// existing importer is unchanged. The shapes and censuses are documented beside the code and in
// itemLookupParse.ts's `|dropsfrom` census.

import type { ItemDropSource, ItemKnowledge } from '../shared/types'
import { EXCLUDED_NS, bulletLines, cleanSummary, firstLink, templateField } from './itemLookupParse'

/** Wiki decoration that is never part of a name: HTML, bold markers, the `:` indent a few pages
 *  bullet with, and the `{{Wrapper|…}}` a row may sit in ({{VeliousGray}}, {{Loc}}). Templates are
 *  UNWRAPPED — the link inside is the answer — rather than cut. */
function cleanDropLine(line: string): string {
  return line
    .replace(/<[^>]*>/g, ' ')
    .replace(/\{\{[^|{}]*\|/g, ' ')
    .replace(/\}\}/g, ' ')
    .replace(/'''?/g, '')
    .replace(/^:+\s*/, '')
    .trim()
}

/** One `*` bullet → the mob it links. Null for a `**` sub-row (detail of the bullet above) and
 *  for a bullet naming no page ("* Newbie mobs.") — we never invent a mob name. */
function dropMob(line: string): string | null {
  if (line.startsWith('**')) return null
  return firstLink(line.replace(/^\*+\s*/, ''))?.label ?? null
}

/**
 * Parse `|dropsfrom` — where the ITEM PAGE says this item comes from. Line-oriented: a non-bullet
 * line sets (or, naming no page, clears) the current zone; each `*` bullet under it is one mob in
 * that zone. Shapes and their counts are censused above; anything unrecognized yields FEWER
 * entries and never throws, which is this file's standing contract.
 *
 * `(mob, zone)` is the entry identity — a page that lists the same mob under two zones states two
 * real facts, while the same pair twice states one.
 */
export function parseDropSources(block: string): ItemDropSource[] {
  const out: ItemDropSource[] = []
  const seen = new Set<string>()
  let zone: string | undefined
  for (const raw of bulletLines(block)) {
    const line = cleanDropLine(raw)
    if (!line) continue
    if (!line.startsWith('*')) {
      zone = firstLink(line)?.label
      continue
    }
    const mob = dropMob(line)
    if (mob === null) continue
    // NUL-joined (the effectIndex precedent): mob and zone names both contain spaces, so a
    // printable separator would let two different pairs share one identity.
    const id = `${mob}\u0000${zone ?? ''}`
    if (seen.has(id)) continue
    seen.add(id)
    out.push(zone === undefined ? { mob } : { mob, zone })
  }
  return out
}

/** The `|dropsfrom` half of the result: the sources, or `undefined` when the page stated none.
 *  Never an empty list — "drops from nobody" is a claim no item page ever made. */
export function dropSourcesField(raw: string | null): ItemDropSource[] | undefined {
  const sources = raw ? parseDropSources(raw) : []
  return sources.length > 0 ? sources : undefined
}

// ---- forage zones (`|foraged`) --------------------------------------------------
//
// CENSUS, measured 2026-10-21 over the cached item pages (11,595): 145 carry the field, 139 of
// them filled, 296 `* [[Zone]]` bullets. A piped link (`[[Freeport|East Freeport]]`) keeps its
// label, as a `|dropsfrom` zone heading does; a note after the link (`(which?)`, `?`) and a second
// link on the bullet (`[[Dagnor's Cauldron]], possibly [[Kedge Keep]]`) are both read as zones the
// page names. Lines naming no zone (`* Various`, `* ?`, `''This item can be foraged in most
// zones.''`, one prose line) are kept as prose. `[[Category:Foraged]]` sits after the template
// (137 pages); 6 fill the field without it and 4 carry it with the field empty or absent.
// Only a bullet that opens with a link names zones (`* with the [[Forage]] skill` is prose), and an
// HTML comment is never read. Whatever names no zone (`{{Zone|X}}` included) stays in the note.
const FORAGED_CATEGORY_RE = /\[\[\s*Category\s*:\s*Foraged\s*(\|[^\]]*)?\]\]/i
/** `<!-- … -->`, an unclosed one running to the end, as MediaWiki reads it. */
const HTML_COMMENT_RE = /<!--[\s\S]*?(?:-->|$)/g
const ZONE_BULLET_RE = /^\*+\s*\[\[/

/** A zone link's name: a piped label, else the page (`_` is a space, `#anchor` dropped). */
function forageZone(inner: string): string | undefined {
  const pipe = inner.indexOf('|')
  const page = (pipe >= 0 ? inner.slice(0, pipe) : inner).replace(/_/g, ' ').replace(/#.*/, '').replace(/\s+/g, ' ').trim()
  if (!page || EXCLUDED_NS.test(page)) return undefined
  return (pipe >= 0 ? inner.slice(pipe + 1).trim() : '') || page
}

/** Parse `|foraged`: every zone a bullet links, page order, each once (any case); the rest as prose. */
export function parseForaged(block: string): { zones: string[]; note?: string } {
  const zones: string[] = []
  const prose: string[] = []
  for (const line of bulletLines(block.replace(HTML_COMMENT_RE, ''))) {
    const links = ZONE_BULLET_RE.test(line) ? [...line.matchAll(/\[\[([^[\]]+)\]\]/g)].map((m) => forageZone(m[1])) : []
    const found = links.filter((z) => z !== undefined)
    for (const z of found) if (!zones.some((x) => x.toLowerCase() === z.toLowerCase())) zones.push(z)
    if (found.length === 0) {
      const text = line.replace(/^\*+\s*/, '')
      prose.push(cleanSummary(text) ?? text)
    }
  }
  const note = prose.join('; ') || undefined
  return note ? { zones, note } : { zones }
}

/** The forage half of the result; every field `undefined` unless the page stated it. */
export function foragedFields(wikitext: string): Pick<ItemKnowledge, 'foraged' | 'foragedNote' | 'foragedCategory'> {
  const page = wikitext.replace(HTML_COMMENT_RE, '')
  const raw = templateField(page, 'foraged')
  const parsed = raw ? parseForaged(raw) : null
  return {
    foraged: parsed && parsed.zones.length > 0 ? parsed.zones : undefined,
    foragedNote: parsed?.note,
    foragedCategory: FORAGED_CATEGORY_RE.test(page) ? true : undefined
  }
}

