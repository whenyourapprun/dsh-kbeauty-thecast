// K-Beauty + TheCast bundle — Host plugin.
//
// Registers one bundled expertise skill (`kbeauty`) whose instruction body
// lives in assets/kbeauty/SKILL.md. The implementation mirrors the shipped
// @deepseek-ai/dsh-skill-office provider so the skill body loads on demand and
// the `references/` directory is exposed as the skill's resource base.
//
// Self-contained on purpose: it imports only Node built-ins, so a local
// directory bundle resolves without depending on the dsh installation's
// packages.

import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { isAbsolute, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Cordis plugin identity (shown in Plugin Manager). */
export const name = 'kbeauty';

/** Services this plugin injects: the skill registry. */
export const inject = ['skills'];

const SKILL_NAME = 'kbeauty';
const PROVIDER_NAME = 'kbeauty';
const SKILL_RANK = 600; // same tier as other bundled skills

/**
 * Parse a skill file's YAML frontmatter with a small, dependency-free reader.
 * We only require single-line `name` and `description` keys.
 */
function parseSkill(raw, path) {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(raw);
  if (!frontmatter?.[1]) throw new Error(`kbeauty: ${path} has no YAML frontmatter`);
  const meta = {};
  for (const line of frontmatter[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }
  const description = typeof meta.description === 'string' ? meta.description : '';
  if (description.length === 0) throw new Error(`kbeauty: ${path} has no description`);
  return { description, content: raw.slice(frontmatter[0].length).trim() };
}

/**
 * Register the K-Beauty skill provider on the skill registry.
 * @param {object} ctx - Cordis context carrying `ctx.skills`.
 * @param {object} [config] - Optional `{ assetRoot }` override.
 */
export function apply(ctx, config = {}) {
  const assetRoot = config.assetRoot ?? fileURLToPath(new URL('./assets/', import.meta.url));
  if (!isAbsolute(assetRoot)) throw new Error('kbeauty: assetRoot must be an absolute directory');

  const skillDir = join(assetRoot, SKILL_NAME);
  const locator = join(skillDir, 'SKILL.md');
  const { description } = parseSkill(readFileSync(locator, 'utf8'), locator);

  const candidate = {
    name: SKILL_NAME,
    description,
    whenToUse:
      'For K-Beauty product knowledge, ingredient and routine guidance, or TheCast (더캐스트) live-commerce and brand content work.',
    invocation: { modelInvocable: true, userInvocable: true },
    provider: PROVIDER_NAME,
    source: 'bundled',
    rank: SKILL_RANK,
    resourceBase: { kind: 'directory', path: skillDir.split(sep).join('/') },
    locator,
  };

  const provider = {
    name: PROVIDER_NAME,
    list: () => Promise.resolve([candidate]),
    async get(selected, options) {
      const { rank: _rank, locator: file, ...summary } = selected;
      const parsed = parseSkill(await readFile(file, { encoding: 'utf8', signal: options.signal }), file);
      return { ...summary, content: parsed.content };
    },
  };

  ctx.skills.registerProvider(() => provider);
}
