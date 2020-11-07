import { promises as fs } from 'fs';

/**
 * @param {string} content
 */
function isDeprecated(content) {
  const lowercase = content.toLowerCase();
  if (content.includes("  - Deprecated\n") || content.includes("  - Obsolete\n") || lowercase.includes("{{deprecated_header}}") || lowercase.includes("{{obsolete_header}}")) {
    return true;
  }
  return /<div class="warning">\n.+ is deprecated/.test(content);
}

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
    try {
      const content = await fs.readFile(`../content/files/en-us/web/api/${item}/index.html`, 'utf-8');
      if (isDeprecated(content)) {
        deprecated.push(item);
      }
    } catch (err) {
      console.warn(err)
    }
  }
}

await fs.writeFile('test.json', JSON.stringify(deprecated, null, 2));
