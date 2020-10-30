import { promises as fs } from 'fs';

/** @type {string[]} */
const deprecated = JSON.parse(await fs.readFile('test.json', 'utf-8'));

const map = new Map();

for (const item of deprecated) {
  const hierarchy = item.split("/");
  if (!map.has(hierarchy[0])) {
    map.set(hierarchy[0], JSON.parse(await fs.readFile(`api/${hierarchy[0]}.json`, 'utf-8')));
  }
  const data = map.get(hierarchy[0]).api[hierarchy[0]];
  const target = hierarchy.length === 1 ? data : data[hierarchy[1]];
  target.__compat.status.deprecated = true;
}

for (const [key, value] of map) {
  await fs.writeFile(`api/${key}.json`, JSON.stringify(value, null, 2) + "\n");
}
