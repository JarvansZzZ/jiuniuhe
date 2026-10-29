import { loadCatalog } from './catalog-lib.mjs';
const data=await loadCatalog();
console.log(`Validated ${data.models.length} records, ${data.sources.length} sources and local gallery files.`);
const citations=data.issues.filter(issue=>issue.type==='missing_field_evidence');
if(citations.length){console.error(citations.map(issue=>`${issue.model}: ${issue.message}`).join('\n'));process.exitCode=1;}
