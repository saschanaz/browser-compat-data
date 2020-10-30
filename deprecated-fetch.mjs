import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

/** @type {Record<string, string>} */
const deprecated = [];

for (const filename of await fs.readdir('api')) {
  const name = filename.slice(0, -5); // .json
  const data = JSON.parse(await fs.readFile(`./api/${filename}`)).api[name];
  const items = [name];
  for (const [key, value] of Object.entries(data)) {
    if (key === "__compat") {
      continue;
    } else if (value.__compat?.mdn_url) {
      items.push(`${name}/${key}`)
    } else {
      console.log(`No mdn_url in ${name}/${key}, skipping`);
    }
  }
  for (const item of items) {
    const response = await fetch(
      `https://developer.mozilla.org/en-US/docs/Web/API/${item}$json`,
    );
    if (response.ok) {
      const page = await response.json();
      if (page.tags.includes('Deprecated')) {
        deprecated.push(item);
      }
    } else if (response.status !== 404) {
      console.warn(`Failed to fetch ${item}: ${response.statusText}`);
    }
  }
}

await fs.writeFile('test.json', JSON.stringify(deprecated, null, 2));
