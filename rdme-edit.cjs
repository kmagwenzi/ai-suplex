const fs = require('fs');
const NL = String.fromCharCode(10);
let r = fs.readFileSync('README.md', 'utf8');
r = r.replace('## The three tools', '## The tools');
const rows = [
  '| router | Recommends skills + tools for a task (recommend-only, never auto-runs) |',
  '| skill-generate | Drafts a new skill from a procedural workflow |',
  '| skill-install | Installs Community skills (gated: preview then confirm) |',
];
r = r.replace('Builds + queries the SQLite graph from the index |', 'Builds + queries the SQLite graph from the index |' + NL + rows.join(NL));
r = r.replace('Skills/                ← 12 AI skills', 'Skills/                ← 13 AI skills');
fs.writeFileSync('README.md', r);
console.log('README updated');
