import { StoryDocument } from "@/lib/story";

export function storyToHtml(story: StoryDocument) {
  const payload = JSON.stringify(story).replace(/</g, "\\u003c");
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${story.title}</title><style>body{font-family:system-ui;margin:0;background:#f7f7ff;color:#172554}.wrap{max-width:760px;margin:auto;padding:32px}.card{background:white;border:1px solid #dbe4f0;border-radius:22px;padding:28px;box-shadow:0 18px 45px #1e293b14}button{display:block;width:100%;margin-top:12px;padding:14px 16px;border:0;border-radius:12px;background:#4f46e5;color:white;font-weight:800}pre{white-space:pre-wrap;font-family:inherit;line-height:1.7}.muted{color:#64748b}</style><main class="wrap"><h1 id="title"></h1><section class="card"><p class="muted" id="kind"></p><h2 id="scene"></h2><pre id="body"></pre><div id="choices"></div></section></main><script>const story=${payload};let current=story.startSceneId;function render(){const s=story.scenes.find(x=>x.id===current);title.textContent=story.title;scene.textContent=s.title;body.textContent=s.body;kind.textContent=s.transition.type==='ending'?'Ending':'Scene';choices.innerHTML='';if(s.bonusText){const b=document.createElement('button');b.textContent='Reveal bonus text';b.onclick=()=>alert(s.bonusText);choices.append(b)}if(s.transition.type==='continue'){const b=document.createElement('button');b.textContent='Continue';b.onclick=()=>{current=s.transition.targetSceneId;render()};choices.append(b)}if(s.transition.type==='choices')s.transition.choices.forEach(c=>{const b=document.createElement('button');b.textContent=c.label;b.onclick=()=>{current=c.targetSceneId;render()};choices.append(b)});if(s.transition.type==='ending'){const b=document.createElement('button');b.textContent='Restart';b.onclick=()=>{current=story.startSceneId;render()};choices.append(b)}}render()</script></html>`;
}

export function storyToSvg(story: StoryDocument) {
  const width = Math.max(900, ...story.scenes.map((scene) => scene.position.x + 240));
  const height = Math.max(600, ...story.scenes.map((scene) => scene.position.y + 150));
  const edges = story.scenes.flatMap((scene) => {
    const targets = scene.transition.type === "ending" ? [] : scene.transition.type === "continue" ? [scene.transition.targetSceneId] : scene.transition.choices.map((choice) => choice.targetSceneId);
    return targets.map((target) => {
      const to = story.scenes.find((item) => item.id === target);
      if (!to) return "";
      return `<line x1="${scene.position.x + 170}" y1="${scene.position.y + 42}" x2="${to.position.x}" y2="${to.position.y + 42}" stroke="${scene.color}" stroke-width="3" opacity=".7"/>`;
    });
  }).join("");
  const nodes = story.scenes.map((scene) => `<g><rect x="${scene.position.x}" y="${scene.position.y}" width="170" height="84" rx="16" fill="white" stroke="${scene.color}" stroke-width="4"/><text x="${scene.position.x + 14}" y="${scene.position.y + 32}" font-family="Arial" font-weight="700" font-size="14" fill="#172554">${escapeXml(scene.title.slice(0, 22))}</text><text x="${scene.position.x + 14}" y="${scene.position.y + 58}" font-family="Arial" font-size="11" fill="#64748b">${scene.transition.type}</text></g>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#f7f7ff"/><text x="24" y="36" font-family="Arial" font-weight="800" font-size="24" fill="#172554">${escapeXml(story.title)}</text>${edges}${nodes}</svg>`;
}

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[char]!));
}

