const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(process.env.WG_SOURCE || path.join(__dirname,'../index.html'),'utf8');
const helper = html.slice(html.indexOf('  function listingWebsiteHref('),html.indexOf('  function esc(s)'));
const esc = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function context() { const grid = {innerHTML:''}; const ctx = vm.createContext({URL,esc,currentUser:null,isWGAdmin:()=>false,fmtLoc:s=>s,wgImg:s=>s,document:{getElementById:()=>grid}}); vm.runInContext(helper,ctx); return {ctx,grid}; }
for (const [input,expected] of [
 ['www.allcityprint.com','https://www.allcityprint.com/'],['Modulayrdesign.com','https://modulayrdesign.com/'],
 ['Adventureswithbenandstacy.com','https://adventureswithbenandstacy.com/'],['detaileddifference.com','https://detaileddifference.com/'],
 ['https://justindowns.kw.com','https://justindowns.kw.com/'],['http://example.com/path?a=1&b=2','http://example.com/path?a=1&b=2'],
 [' //example.com/path ','https://example.com/path'],['example.com:8443/path','https://example.com:8443/path'],
 ['@hotrodmonk55',''],['Facebook    sasquatch artworks - rob the toonman',''],['javascript:alert(1)',''],
 ['data:text/html,<h1>x</h1>',''],['https://user:password@example.com',''],['person@example.com',''],['/local/path',''],['',''],
 ['https://example.com/<script>',''],['https://exa\nmple.com',''],['https://example.com/?q=%3Cscript%3E','https://example.com/?q=%3Cscript%3E'],
 ['https://instagram.com/hotrodmonk55/','https://instagram.com/hotrodmonk55/']
]) test('website URL: '+JSON.stringify(input),()=>{const {ctx}=context();assert.equal(vm.runInContext('listingWebsiteHref('+JSON.stringify(input)+')',ctx),expected);});
const render = html.slice(html.indexOf('  function renderCards('), html.indexOf('  async function renderApproved('));
function renderCard(website) {const {ctx,grid}=context();vm.runInContext(render,ctx);ctx.listings=[{id:'fixture',bizName:'Fixture',bizType:'Shop',location:'Portland',bio:'',website,lat:1,lng:1}];vm.runInContext('renderCards(listings)',ctx);return grid.innerHTML;}
test('bare domain renders an absolute card link',()=>{assert.match(renderCard('www.allcityprint.com'),/href="https:\/\/www\.allcityprint\.com\/"/);});
test('a handle is retained as visible text without a fabricated link',()=>{const out=renderCard('@hotrodmonk55');assert.match(out,/@hotrodmonk55/);assert.doesNotMatch(out,/<a\b/);});
test('unsafe free text is escaped and cannot become an executable link',()=>{const out=renderCard('javascript:alert(1)<script>');assert.match(out,/&lt;script&gt;/);assert.doesNotMatch(out,/<a\b|<script>/);});
test('card external links protect the opener',()=>assert.match(renderCard('example.com'),/rel="noopener noreferrer"/));
test('detail and featured use the same validator without stored data rewrites',()=>{assert.match(html,/const websiteHref = listingWebsiteHref\(websiteUrl\)/);assert.equal((html.match(/const websiteHref = listingWebsiteHref\(l.website\)/g)||[]).length,2);assert.doesNotMatch(html,/href="\$\{esc\(l.website\)\}"/);assert.doesNotMatch(html,/website:\s*listingWebsiteHref/);});
