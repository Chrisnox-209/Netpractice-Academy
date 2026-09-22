(function () {
  "use strict";
  var N = window.NetUtils;
  var state = {
    view: "home",
    level: 1,
    completed: loadCompleted(),
    hints: {},
    drafts: loadDrafts(),
    practiceMode: "all"
  };

  var PRACTICE_GROUPS = {
    1: [
      { title: "Interface B1", badge: "Interface", x: 78, y: 70, fields: ["b_ip", "b_prefix"] }
    ],
    2: [
      { title: "Masque commun", badge: "Interfaces A1 · B1", x: 50, y: 72, fields: ["prefix"] }
    ],
    3: [
      { title: "Interface B1", badge: "Interface", x: 78, y: 39, fields: ["b_ip"] },
      { title: "Interface C1", badge: "Interface", x: 78, y: 78, fields: ["c_ip"] }
    ],
    4: [
      { title: "Route de PC-A", badge: "Route", x: 17, y: 73, fields: ["gw_a"] },
      { title: "Route de PC-B", badge: "Route", x: 81, y: 73, fields: ["gw_b"] }
    ],
    5: [
      { title: "Table de routage du client", badge: "Route", x: 23, y: 72, fields: ["dest", "gw"] }
    ],
    6: [
      { title: "Route du PC", badge: "Route", x: 12, y: 72, fields: ["pc_gw"] },
      { title: "Table de routage R1", badge: "Routeur", x: 49, y: 73, fields: ["r_dest", "r_gw"] }
    ],
    7: [
      { title: "Table de routage R1", badge: "Routeur", x: 28, y: 72, fields: ["r1_dest", "r1_gw"] },
      { title: "Table de routage R2", badge: "Routeur", x: 68, y: 72, fields: ["r2_dest", "r2_gw"] }
    ],
    8: [
      { title: "LAN A", badge: "Sous-réseau", x: 64, y: 27, fields: ["a_net", "a_prefix"] },
      { title: "LAN B", badge: "Sous-réseau", x: 64, y: 72, fields: ["b_net", "b_prefix"] }
    ],
    9: [
      { title: "Nouveau LAN", badge: "Sous-réseau", x: 69, y: 70, fields: ["net", "prefix"] }
    ],
    10: [
      { title: "PC du LAN A", badge: "Route", x: 10, y: 73, fields: ["a_gw"] },
      { title: "Table de routage R1", badge: "Routeur", x: 37, y: 75, fields: ["r1_b_dest", "r1_b_gw", "r1_default_gw"] },
      { title: "Table de routage R2", badge: "Routeur", x: 70, y: 75, fields: ["r2_return_dest", "r2_return_gw", "r2_default_gw"] }
    ],
    11: [
      { title: "LAN A", badge: "Interface", x: 73, y: 19, fields: ["a_net", "a_prefix"] },
      { title: "LAN B", badge: "Interface", x: 73, y: 48, fields: ["b_net", "b_prefix"] },
      { title: "LAN C", badge: "Interface", x: 73, y: 77, fields: ["c_net", "c_prefix"] }
    ],
    12: [
      { title: "Table de routage R1", badge: "Routes", x: 39, y: 76, fields: ["dest", "via", "default_dest", "default_via"] }
    ],
    13: [
      { title: "Table de routage R1", badge: "Routes", x: 18, y: 75, fields: ["r1_dest", "r1_via"] },
      { title: "Table de routage R2", badge: "Routes", x: 50, y: 76, fields: ["r2_left", "r2_right"] },
      { title: "Table de routage R3", badge: "Routes", x: 80, y: 75, fields: ["r3_dest", "r3_via"] }
    ],
    14: [
      { title: "Nouveau LAN A", badge: "Interface", x: 20, y: 74, fields: ["a_net", "a_prefix"] },
      { title: "Nouveau LAN B", badge: "Interface", x: 80, y: 74, fields: ["b_net", "b_prefix"] }
    ],
    15: [
      { title: "Table de routage R1", badge: "Route", x: 28, y: 74, fields: ["summary", "via"] }
    ],
    16: [
      { title: "Lien R1 - R2", badge: "Interface", x: 32, y: 72, fields: ["net1"] },
      { title: "Lien R2 - R3", badge: "Interface", x: 68, y: 72, fields: ["net2"] }
    ],
    17: [
      { title: "LAN / R1", badge: "Route", x: 16, y: 74, fields: ["pc_gw", "r1_default"] },
      { title: "Table de routage R2", badge: "Routes", x: 61, y: 74, fields: ["r2_return", "r2_return_via", "r2_default"] }
    ],
    18: [
      { title: "LAN A", badge: "Route", x: 10, y: 75, fields: ["a_gw"] },
      { title: "R1", badge: "Routes", x: 29, y: 76, fields: ["r1_c", "r1_via", "r1_default"] },
      { title: "R2", badge: "Routes", x: 54, y: 76, fields: ["r2_a", "r2_c"] },
      { title: "R3", badge: "Routes", x: 79, y: 76, fields: ["r3_a", "r3_default"] }
    ],
    19: [
      { title: "OFFICE", badge: "Interface", x: 82, y: 42, fields: ["c_mask", "r2_c_ip", "c_gw"] },
      { title: "HOME", badge: "Interface", x: 18, y: 42, fields: ["d_mask", "r2_d_ip", "d_gw"] },
      { title: "Transit R1-R2", badge: "Interface", x: 48, y: 43, fields: ["r2_transit_ip", "transit_mask"] },
      { title: "Routes de retour R1", badge: "Routes", x: 34, y: 82, fields: ["r1_c_dest", "r1_c_via", "r1_d_dest", "r1_d_via"] },
      { title: "Sortie de R2", badge: "Route", x: 70, y: 82, fields: ["r2_default"] }
    ],
    20: [
      { title: "LAN du switch", badge: "Interface", x: 17, y: 73, fields: ["ab_mask", "r1_lan_ip", "a_gw", "b_gw"] },
      { title: "LAN C", badge: "Interface", x: 82, y: 28, fields: ["c_mask", "r2_c_ip", "c_gw"] },
      { title: "LAN D", badge: "Interface", x: 82, y: 70, fields: ["d_mask", "r2_d_ip", "d_gw"] },
      { title: "Routes R1", badge: "Routes", x: 43, y: 78, fields: ["r1_c_route", "r1_d_route", "r1_via", "r1_default"] },
      { title: "Routes R2", badge: "Routes", x: 64, y: 78, fields: ["r2_return", "r2_via", "r2_default"] }
    ],
    21: [
      { title: "LAN A · Switch", badge: "Interface", x: 17, y: 73, fields: ["lan_a_mask", "h1_gw", "h2_gw"] },
      { title: "LAN H4", badge: "Interface", x: 83, y: 27, fields: ["lan_b_mask", "r2_b_ip", "h4_gw"] },
      { title: "LAN H3", badge: "Interface", x: 83, y: 69, fields: ["lan_c_mask", "r2_c_ip", "h3_gw"] },
      { title: "Transit + routes R1", badge: "Routes", x: 42, y: 81, fields: ["transit_mask", "r1_b_route", "r1_c_route", "r1_via", "r1_default"] },
      { title: "Routes R2", badge: "Routes", x: 64, y: 81, fields: ["r2_a_route", "r2_via", "r2_default"] }
    ]
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(value) { return String(value).replace(/[&<>"']/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]; }); }

  function loadCompleted() {
    try { return JSON.parse(localStorage.getItem("np-academy-completed") || "[]"); }
    catch (e) { return []; }
  }
  function loadDrafts() {
    try { return JSON.parse(localStorage.getItem("np-academy-drafts") || "{}") || {}; }
    catch (e) { return {}; }
  }
  function saveCompleted() {
    localStorage.setItem("np-academy-completed", JSON.stringify(state.completed));
    updateHeaderProgress();
  }
  function saveDraft(levelId, values) {
    state.drafts[levelId] = values;
    localStorage.setItem("np-academy-drafts", JSON.stringify(state.drafts));
  }
  function updateHeaderProgress() { $("#headerProgress").textContent = state.completed.length + "/" + window.LEVELS.length; }

  function navigate(view) {
    state.view = view;
    $$(".view").forEach(function (v) { v.classList.remove("is-active"); });
    $("#view-" + view).classList.add("is-active");
    $$(".nav-btn").forEach(function (b) { b.classList.toggle("is-active", b.dataset.nav === view); });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderHome() {
    $("#view-home").innerHTML = `
      <section class="hero shell">
        <div class="hero-copy">
          <span class="eyebrow">NetPractice, depuis zéro</span>
          <h1>Comprendre avant<br><span>de configurer.</span></h1>
          <p>Un parcours local et progressif pour apprendre IPv4, les masques, les sous-réseaux, les passerelles et le routage avec des mots simples.</p>
          <div class="hero-actions">
            <button class="btn primary" data-go="course">Commencer le cours</button>
            <button class="btn ghost" data-go="practice">Ouvrir la pratique</button>
          </div>
          <div class="micro-list"><span>21 exercices</span><span>100 % local</span><span>Aides progressives</span></div>
        </div>
        <div class="hero-panel" aria-hidden="true">
          <div class="hero-network">
            <div class="hero-device"><span>${deviceSvg("pc")}</span><small>Client</small></div>
            <i></i>
            <div class="hero-device router"><span>${deviceSvg("router")}</span><small>Routeur</small></div>
            <i></i>
            <div class="hero-device"><span>${deviceSvg("cloud")}</span><small>Internet</small></div>
          </div>
          <div class="hero-question"><small>La question à se poser</small><strong>Cette destination est-elle dans mon réseau ?</strong><p>Le reste de NetPractice découle souvent de cette réponse.</p></div>
        </div>
      </section>
      <section class="shell section-gap">
        <div class="section-head"><span class="eyebrow">Parcours</span><h2>Une progression faite pour débuter.</h2><p>On apprend le vocabulaire, on visualise les calculs, puis on retrouve une interface proche de NetPractice.</p></div>
        <div class="feature-grid">
          <article class="feature-card"><span>01</span><h3>Cours</h3><p>IPv4, masque, réseau, broadcast, switch, routeur, gateway et routes expliqués sans prérequis.</p><button class="text-btn" data-go="course">Découvrir les cours</button></article>
          <article class="feature-card"><span>02</span><h3>Laboratoire</h3><p>Transforme une IP en plage réelle et vois exactement pourquoi deux sous-réseaux se chevauchent.</p><button class="text-btn" data-go="lab">Manipuler les réseaux</button></article>
          <article class="feature-card"><span>03</span><h3>Pratique</h3><p>Une topologie, des interfaces et des tables de routage à remplir comme dans l’exercice.</p><button class="text-btn" data-go="practice">Commencer les niveaux</button></article>
        </div>
      </section>
      <section class="shell section-gap overlap-demo">
        <div><span class="eyebrow">Chevauchement</span><h2>Une IP seule ne raconte pas toute l’histoire.</h2><p>Le masque transforme l’adresse en une plage. Deux réseaux se chevauchent dès qu’une partie de leurs plages est commune.</p><button class="btn secondary" data-go="lab">Voir dans le laboratoire</button></div>
        <div class="range-example">
          <div class="range-row"><label>A · 192.168.1.0/25 <small>.0 → .127</small></label><div class="range-track"><span style="left:0;width:50%"></span></div></div>
          <div class="range-row danger"><label>B · 192.168.1.64/26 <small>.64 → .127</small></label><div class="range-track"><span style="left:25%;width:25%"></span></div></div>
          <p class="danger-text">B utilise des adresses déjà couvertes par A.</p>
        </div>
      </section>`;
  }

  function renderCourse() {
    var cards = window.COURSES.map(function (c, i) {
      return `<article class="course-card" data-course="${c.id}">
        <button class="course-toggle" aria-expanded="${i===0?'true':'false'}">
          <span class="course-num">${c.icon}</span>
          <span class="course-meta"><strong>${c.title}</strong><small>${c.summary}</small></span>
          <span class="duration">${c.duration}</span><span class="chev">⌄</span>
        </button>
        <div class="course-body ${i===0?'is-open':''}">${c.body}</div>
      </article>`;
    }).join("");
    $("#view-course").innerHTML = `<div class="shell page-head"><span class="eyebrow">Cours</span><h1>Les bases, dans le bon ordre.</h1><p>Si tu pars de zéro, lis les modules du début à la fin. Les mots techniques sont introduits seulement quand ils deviennent utiles.</p></div><div class="shell course-list">${cards}</div>`;
  }

  function infoRows(info) {
    return `<div class="result-grid">
      <div><small>Réseau</small><strong>${info.network}/${info.prefix}</strong></div>
      <div><small>Masque</small><strong>${info.mask}</strong></div>
      <div><small>Broadcast</small><strong>${info.broadcast}</strong></div>
      <div><small>Hôtes usuels</small><strong>${info.firstHost} → ${info.lastHost}</strong></div>
      <div><small>Capacité</small><strong>${info.usable} hôte(s)</strong></div>
      <div><small>IP en binaire</small><strong class="binary">${N.formatBinaryIp(info.ip)}</strong></div>
    </div>`;
  }

  function renderLab() {
    $("#view-lab").innerHTML = `
      <div class="shell page-head"><span class="eyebrow">Laboratoire</span><h1>Voir le réseau, pas seulement le calculer.</h1><p>Manipule les IP, les masques et les routes. Chaque outil transforme le calcul en une image simple pour comprendre ce qui se passe réellement.</p></div>
      <div class="shell lab-grid">
        <article class="tool-card wide"><div class="tool-title"><span>01</span><div><h2>Où tombe cette IP ?</h2><p>IP + masque → réseau, broadcast, plage d'hôtes et position de l'IP dans le bloc.</p></div></div>
          <div id="subnetForm" class="inline-form" role="group"><label>IPv4<input id="calcIp" value="192.168.1.70" autocomplete="off"></label><label>Masque / CIDR<input id="calcPrefix" value="/26" placeholder="/26 ou 255.255.255.192" autocomplete="off"></label><button class="btn primary" id="subnetRun" type="button">Visualiser</button></div>
          <div id="subnetResult" class="tool-result"></div>
        </article>

        <article class="tool-card wide"><div class="tool-title"><span>02</span><div><h2>Chevauchement de sous-réseaux</h2><p>Compare deux plages. La zone commune devient visible immédiatement.</p></div></div>
          <div id="overlapForm" class="compare-form" role="group">
            <fieldset><legend>Réseau A</legend><label>IP ou réseau<input id="aIp" value="192.168.1.0"></label><label>Masque / CIDR<input id="aPrefix" value="/25" placeholder="/25 ou 255.255.255.128"></label></fieldset>
            <fieldset><legend>Réseau B</legend><label>IP ou réseau<input id="bIp" value="192.168.1.64"></label><label>Masque / CIDR<input id="bPrefix" value="/26" placeholder="/26 ou 255.255.255.192"></label></fieldset>
            <button class="btn primary" id="overlapRun" type="button">Comparer</button>
          </div><div id="overlapResult" class="tool-result"></div>
        </article>

        <article class="tool-card wide"><div class="tool-title"><span>03</span><div><h2>Découper un /24</h2><p>Choisis un masque et regarde le /24 se découper en blocs. C'est la manière la plus simple de comprendre le “pas”.</p></div></div>
          <div class="prefix-picker" id="splitPrefixPicker" aria-label="Choisir un préfixe">
            <button type="button" data-prefix="24">/24</button><button type="button" data-prefix="25">/25</button><button type="button" data-prefix="26" class="is-active">/26</button><button type="button" data-prefix="27">/27</button><button type="button" data-prefix="28">/28</button><button type="button" data-prefix="29">/29</button><button type="button" data-prefix="30">/30</button>
          </div>
          <div id="splitResult" class="tool-result"></div>
        </article>

        <article class="tool-card"><div class="tool-title"><span>04</span><div><h2>Même réseau ?</h2><p>Place deux machines sur leurs plages et vois si elles peuvent se parler directement.</p></div></div>
          <div id="sameForm" class="stack-form" role="group"><label>IP A<input id="sameA" value="10.0.0.65"></label><label>IP B<input id="sameB" value="10.0.0.126"></label><label>Masque / CIDR<input id="sameP" value="/26" placeholder="/26 ou 255.255.255.192"></label><button class="btn primary" id="sameRun" type="button">Tester</button></div><div id="sameResult" class="tool-result"></div>
        </article>

        <article class="tool-card"><div class="tool-title"><span>05</span><div><h2>Quel est le masque le plus précis ?</h2><p>Plusieurs masques peuvent fonctionner. Cet outil montre jusqu'où tu peux réduire le réseau sans séparer les deux hôtes.</p></div></div>
          <div id="bestMaskForm" class="stack-form" role="group"><label>IP A<input id="bestA" value="10.0.0.65"></label><label>IP B<input id="bestB" value="10.0.0.126"></label><button class="btn primary" id="bestMaskRun" type="button">Comparer les masques</button></div><div id="bestMaskResult" class="tool-result"></div>
        </article>

        <article class="tool-card wide"><div class="tool-title"><span>06</span><div><h2>Trajet d'un paquet</h2><p>Visualise pourquoi on utilise une gateway quand la destination est dans un autre réseau, puis vérifie le chemin retour.</p></div></div>
          <div id="routeForm" class="route-visual-form" role="group">
            <fieldset><legend>PC A</legend><label>IP<input id="routeA" value="10.0.1.10"></label><label>Masque<input id="routeAP" value="/24"></label><label>Gateway<input id="routeAGw" value="10.0.1.1"></label></fieldset>
            <fieldset><legend>PC B</legend><label>IP<input id="routeB" value="10.0.2.20"></label><label>Masque<input id="routeBP" value="/24"></label><label>Gateway<input id="routeBGw" value="10.0.2.1"></label></fieldset>
            <button class="btn primary" id="routeRun" type="button">Tracer le trajet</button>
          </div><div id="routeResult" class="tool-result"></div>
        </article>

        <article class="tool-card wide cheat"><div class="tool-title"><span>07</span><div><h2>Repères rapides</h2><p>Les masques à connaître pour NetPractice, en CIDR et en décimal.</p></div></div>
          <table class="learn-table mask-reference"><thead><tr><th>CIDR</th><th>Masque décimal</th><th>Pas</th><th>Adresses</th><th>Hôtes</th></tr></thead><tbody><tr><th>/24</th><td><code>255.255.255.0</code></td><td>256</td><td>256</td><td>254</td></tr><tr><th>/25</th><td><code>255.255.255.128</code></td><td>128</td><td>128</td><td>126</td></tr><tr><th>/26</th><td><code>255.255.255.192</code></td><td>64</td><td>64</td><td>62</td></tr><tr><th>/27</th><td><code>255.255.255.224</code></td><td>32</td><td>32</td><td>30</td></tr><tr><th>/28</th><td><code>255.255.255.240</code></td><td>16</td><td>16</td><td>14</td></tr><tr><th>/29</th><td><code>255.255.255.248</code></td><td>8</td><td>8</td><td>6</td></tr><tr><th>/30</th><td><code>255.255.255.252</code></td><td>4</td><td>4</td><td>2</td></tr></tbody></table>
        </article>
      </div>`;
    bindLab();
  }

  function renderBinaryMask(prefix) {
    var p=N.parsePrefix(prefix), mask=N.prefixToMask(p), bits="1".repeat(p)+"0".repeat(32-p), groups=[];
    for(var i=0;i<4;i++){
      var oct=bits.slice(i*8,i*8+8), html="";
      for(var j=0;j<8;j++) html+=`<span class="${oct[j]==="1"?"net-bit":"host-bit"}">${oct[j]}</span>`;
      groups.push(`<span class="binary-octet">${html}</span>`);
    }
    return `<div class="binary-mask"><div class="binary-mask-head"><strong>Le masque en bits</strong><span>bits réseau <i class="legend-net"></i> · bits hôte <i class="legend-host"></i></span></div><div class="binary-mask-value">${groups.join('<b>.</b>')}</div><small>/${p} = ${mask}. Les <strong>${p}</strong> premiers bits appartiennent au réseau, les <strong>${32-p}</strong> suivants aux hôtes.</small></div>`;
  }

  function renderSubnetPosition(info) {
    if(info.prefix<24 || info.prefix>30) return `<div class="explain-box"><strong>Visualisation du bloc</strong><p>Le visualiseur détaillé est volontairement limité à /24 → /30, les tailles les plus utilisées dans NetPractice.</p></div>`;
    var block=Math.pow(2,32-info.prefix), count=256/block, oct=Number(info.ip.split(".")[3]), active=Math.floor(oct/block), base=info.ip.split(".").slice(0,3).join("."), parts=[];
    for(var i=0;i<count;i++){
      var start=i*block,end=start+block-1;
      parts.push(`<span class="subnet-block ${i===active?'is-active':''}" style="width:${100/count}%" title="${base}.${start} → ${base}.${end}">${count<=8?`${start}–${end}`:""}</span>`);
    }
    return `<div class="subnet-position"><div class="visual-head"><strong>Le /24 découpé en /${info.prefix}</strong><span>${count} bloc(s) de ${block} adresses</span></div><div class="subnet-strip">${parts.join("")}<i class="ip-marker" style="left:${oct/255*100}%"><b>${info.ip}</b></i></div><div class="visual-legend"><span>0</span><strong>Bloc actif : ${info.network} → ${info.broadcast}</strong><span>255</span></div></div>`;
  }

  function renderOverlapBars(a,b,overlap) {
    var min=Math.min(a.startInt,b.startInt), max=Math.max(a.endInt,b.endInt), span=Math.max(1,max-min+1), interStart=Math.max(a.startInt,b.startInt), interEnd=Math.min(a.endInt,b.endInt);
    function pct(n){return ((n-min)/span*100).toFixed(2);}
    function width(start,end){return Math.max(.6,(end-start+1)/span*100).toFixed(2);}
    return `<div class="overlap-map"><div class="overlap-axis"><span>${N.intToIp(min)}</span><span>${N.intToIp(max)}</span></div><div class="overlap-lane"><b>A</b><div><span class="lane-a" style="left:${pct(a.startInt)}%;width:${width(a.startInt,a.endInt)}%"></span></div><small>${a.network}/${a.prefix}</small></div><div class="overlap-lane"><b>B</b><div><span class="lane-b ${overlap?'is-danger':'is-safe'}" style="left:${pct(b.startInt)}%;width:${width(b.startInt,b.endInt)}%"></span></div><small>${b.network}/${b.prefix}</small></div>${overlap?`<div class="overlap-lane overlap-only"><b>Commun</b><div><span style="left:${pct(interStart)}%;width:${width(interStart,interEnd)}%"></span></div><small>${N.intToIp(interStart)} → ${N.intToIp(interEnd)}</small></div>`:""}</div>`;
  }

  function renderSplit(prefix) {
    var p=N.parsePrefix(prefix), block=Math.pow(2,32-p), count=Math.pow(2,p-24), cells=[];
    for(var i=0;i<count;i++){
      var start=i*block,end=start+block-1,label=count<=8?`${start}–${end}`:(i<3||i>=count-3?`${start}`:"");
      cells.push(`<span class="split-cell" title="192.168.1.${start} → 192.168.1.${end}"><b>${label}</b></span>`);
    }
    return `<div class="split-summary"><strong>192.168.1.0/24 → ${count} réseau(x) en /${p}</strong><span>${block} adresses par bloc · ${N.hostCapacity(p)} hôte(s) utilisables</span></div><div class="split-grid" style="--split-count:${count}">${cells.join("")}</div><div class="split-boundaries"><span>192.168.1.0</span><span>Chaque frontière tombe tous les <strong>${block}</strong></span><span>192.168.1.255</span></div>`;
  }

  function renderSameNetworkVisual(a,b,p,same) {
    var min=Math.min(a.startInt,b.startInt), max=Math.max(a.endInt,b.endInt), span=Math.max(1,max-min+1);
    function pct(n){return ((n-min)/span*100).toFixed(2);}
    function range(x){return Math.max(.8,(x.endInt-x.startInt+1)/span*100).toFixed(2);}
    return `<div class="same-map"><div class="same-axis"><span>${N.intToIp(min)}</span><span>${N.intToIp(max)}</span></div><div class="same-track"><span class="same-net a" style="left:${pct(a.startInt)}%;width:${range(a)}%"></span><i class="same-marker a" style="left:${pct(N.ipToInt(a.ip))}%">A</i><span class="same-net b ${same?'is-same':'is-other'}" style="left:${pct(b.startInt)}%;width:${range(b)}%"></span><i class="same-marker b" style="left:${pct(N.ipToInt(b.ip))}%">B</i></div><div class="same-caption"><span>A : ${a.network}/${p}</span><strong>${same?'Même plage réseau':'Deux plages différentes'}</strong><span>B : ${b.network}/${p}</span></div></div>`;
  }

  function bestPrefixForHosts(ipA,ipB) {
    for(var p=30;p>=0;p--) if(N.sameSubnet(ipA,ipB,p) && N.isUsableHost(ipA,p) && N.isUsableHost(ipB,p)) return p;
    return null;
  }

  function renderBestMask(ipA,ipB) {
    var best=bestPrefixForHosts(ipA,ipB), rows=[];
    if(best===null) return `<div class="feedback bad">Impossible de placer ces deux adresses comme hôtes dans un même réseau IPv4 classique.</div>`;
    for(var p=24;p<=30;p++){
      var works=N.sameSubnet(ipA,ipB,p) && N.isUsableHost(ipA,p) && N.isUsableHost(ipB,p);
      var cls=p===best?'best':(works?'works':'fails');
      rows.push(`<div class="mask-choice ${cls}"><strong>/${p}</strong><span>${N.prefixToMask(p)}</span><b>${p===best?'Réponse la plus précise':(works?'Fonctionne':'Sépare les hôtes')}</b></div>`);
    }
    var info=N.subnetInfo(ipA,best);
    return `<div class="feedback good"><strong>Le masque le plus précis est /${best}</strong><p>${N.prefixToMask(best)} · réseau ${info.network}/${best}. Un masque plus large peut fonctionner aussi, mais il réserve davantage d'adresses.</p></div><div class="mask-choice-grid">${rows.join("")}</div>${renderSubnetPosition(info)}`;
  }

  function renderRoutePath() {
    var a=$("#routeA").value, ap=N.parsePrefix($("#routeAP").value), ag=$("#routeAGw").value, b=$("#routeB").value, bp=N.parsePrefix($("#routeBP").value), bg=$("#routeBGw").value;
    N.ipToInt(a);N.ipToInt(b);N.ipToInt(ag);N.ipToInt(bg);
    var direct=N.sameSubnet(a,b,ap) && N.sameSubnet(a,b,bp);
    if(direct){
      return `<div class="feedback good"><strong>Communication directe</strong><p>Les deux hôtes voient la destination comme locale. Ils n'ont pas besoin de gateway pour ce trajet.</p></div><div class="packet-path direct"><div class="packet-node"><b>PC A</b><small>${a}/${ap}</small></div><span class="packet-arrow">→</span><div class="packet-node"><b>PC B</b><small>${b}/${bp}</small></div></div><div class="packet-return"><strong>Retour</strong><span>PC B → PC A</span></div>`;
    }
    var aGwOk=N.sameSubnet(a,ag,ap) && N.isUsableHost(ag,ap), bGwOk=N.sameSubnet(b,bg,bp) && N.isUsableHost(bg,bp);
    if(!aGwOk || !bGwOk){
      return `<div class="feedback bad"><strong>La gateway doit être joignable localement.</strong><p>${!aGwOk?'La gateway de PC A n\'est pas dans le même sous-réseau que PC A. ':''}${!bGwOk?'La gateway de PC B n\'est pas dans le même sous-réseau que PC B.':''}</p></div>`;
    }
    return `<div class="feedback good"><strong>Destination distante : passage par la gateway</strong><p>PC A ne trouve pas PC B dans son réseau local. Il confie donc le paquet à sa gateway. Pour la réponse, PC B fait exactement la même chose en sens inverse.</p></div><div class="packet-flow"><div class="flow-label">ALLER</div><div class="packet-path"><div class="packet-node"><b>PC A</b><small>${a}/${ap}</small></div><span class="packet-arrow">→</span><div class="packet-node gateway"><b>GW A</b><small>${ag}</small></div><span class="packet-arrow">→</span><div class="packet-node router"><b>Routeur</b><small>transmet</small></div><span class="packet-arrow">→</span><div class="packet-node gateway"><b>GW B</b><small>${bg}</small></div><span class="packet-arrow">→</span><div class="packet-node"><b>PC B</b><small>${b}/${bp}</small></div></div><div class="flow-label return">RETOUR</div><div class="packet-path reverse"><div class="packet-node"><b>PC B</b></div><span class="packet-arrow">→</span><div class="packet-node gateway"><b>GW B</b></div><span class="packet-arrow">→</span><div class="packet-node router"><b>Routeur</b></div><span class="packet-arrow">→</span><div class="packet-node gateway"><b>GW A</b></div><span class="packet-arrow">→</span><div class="packet-node"><b>PC A</b></div></div></div>`;
  }

  function bindLab() {
    function runSubnet(){try{var info=N.subnetInfo($("#calcIp").value,$("#calcPrefix").value);$("#subnetResult").innerHTML=infoRows(info)+renderSubnetPosition(info)+renderBinaryMask(info.prefix);}catch(err){$("#subnetResult").innerHTML=`<div class="feedback bad">${esc(err.message)}</div>`;}}
    function runOverlap(){try{var a=N.subnetInfo($("#aIp").value,$("#aPrefix").value),b=N.subnetInfo($("#bIp").value,$("#bPrefix").value),ov=N.rangesOverlap(a.network,a.prefix,b.network,b.prefix),is=N.intToIp(Math.max(a.startInt,b.startInt)),ie=N.intToIp(Math.min(a.endInt,b.endInt));$("#overlapResult").innerHTML=`<div class="feedback ${ov?'bad':'good'}"><strong>${ov?'Chevauchement détecté':'Aucun chevauchement'}</strong><p>${ov?`Les deux plages utilisent les mêmes adresses de <code>${is}</code> à <code>${ie}</code>.`:'Les deux plages sont séparées : elles peuvent représenter deux sous-réseaux distincts.'}</p></div>${renderOverlapBars(a,b,ov)}<div class="explain-box"><strong>Pourquoi ?</strong><p>A occupe <code>${a.network}</code> → <code>${a.broadcast}</code>. B occupe <code>${b.network}</code> → <code>${b.broadcast}</code>. Il faut comparer les plages entières, pas seulement les IP tapées.</p></div>`;}catch(err){$("#overlapResult").innerHTML=`<div class="feedback bad">${esc(err.message)}</div>`;}}
    function runSame(){try{var p=N.parsePrefix($("#sameP").value),a=N.subnetInfo($("#sameA").value,p),b=N.subnetInfo($("#sameB").value,p),same=a.network===b.network;$("#sameResult").innerHTML=`<div class="feedback ${same?'good':'bad'}"><strong>${same?'Oui, même réseau':'Non, réseaux différents'}</strong><p>A → ${a.network}/${p}<br>B → ${b.network}/${p}</p></div>${renderSameNetworkVisual(a,b,p,same)}`;}catch(err){$("#sameResult").innerHTML=`<div class="feedback bad">${esc(err.message)}</div>`;}}
    function runBestMask(){try{var a=$("#bestA").value,b=$("#bestB").value;N.ipToInt(a);N.ipToInt(b);$("#bestMaskResult").innerHTML=renderBestMask(a,b);}catch(err){$("#bestMaskResult").innerHTML=`<div class="feedback bad">${esc(err.message)}</div>`;}}
    function runRoute(){try{$("#routeResult").innerHTML=renderRoutePath();}catch(err){$("#routeResult").innerHTML=`<div class="feedback bad">${esc(err.message)}</div>`;}}

    $("#subnetRun").addEventListener("click",runSubnet);
    $("#overlapRun").addEventListener("click",runOverlap);
    $("#sameRun").addEventListener("click",runSame);
    $("#bestMaskRun").addEventListener("click",runBestMask);
    $("#routeRun").addEventListener("click",runRoute);
    $$('[id$="Form"] input').forEach(function(input){
      input.addEventListener("keydown",function(e){
        if(e.key!=="Enter") return;
        e.preventDefault();
        var group=e.target.closest('[id$="Form"]');
        var button=group && group.querySelector('button[id$="Run"]');
        if(button) button.click();
      });
    });
    $$("#splitPrefixPicker button").forEach(function(btn){btn.addEventListener("click",function(){ $$("#splitPrefixPicker button").forEach(function(x){x.classList.remove("is-active");});btn.classList.add("is-active");$("#splitResult").innerHTML=renderSplit(Number(btn.dataset.prefix));});});

    runSubnet();
    runOverlap();
    $("#splitResult").innerHTML=renderSplit(26);
    runSame();
    runBestMask();
    runRoute();
  }

  function deviceSvg(type) {
    var common='viewBox="0 0 48 48" aria-hidden="true"';
    if(type==="pc" || type==="server") return `<svg ${common}><rect x="7" y="8" width="34" height="23" rx="3"/><path d="M18 39h12M24 31v8"/></svg>`;
    if(type==="router") return `<svg ${common}><circle cx="24" cy="24" r="17"/><path d="M15 24h18M28 18l6 6-6 6M20 18l-6 6 6 6"/></svg>`;
    if(type==="switch") return `<svg ${common}><rect x="7" y="14" width="34" height="20" rx="4"/><path d="M13 20h4M20 20h4M27 20h4M34 20h2M13 28h4M20 28h4M27 28h4M34 28h2"/></svg>`;
    return `<svg ${common}><path d="M14 34h22a8 8 0 0 0 .7-16A13 13 0 0 0 12 18.5 7.5 7.5 0 0 0 14 34Z"/></svg>`;
  }

  function getField(level, key) { return level.fields.find(function (f) { return f.key === key; }); }
  function shortFieldLabel(field) {
    var label = field.label.replace(/^R\d\s*:\s*/i, "").replace(/^Route de R\d\s*:\s*/i, "");
    if (/préfixe|masque/i.test(label)) return "Masque / CIDR";
    if (/gateway|passerelle|next hop/i.test(label)) return /next hop/i.test(label) ? "Next hop" : "Gateway";
    if (/destination|réseau distant/i.test(label)) return "Destination";
    if (/adresse réseau/i.test(label)) return "Adresse réseau";
    if (/IP de/i.test(label)) return "Adresse IP";
    return label;
  }

  function practicePlaceholder(field) {
    if (field.type !== "cidr") return field.placeholder;
    // Ne révèle pas le bon masque dans l'exercice : l'élève doit le calculer.
    return "/xx ou 255.255.255.xxx";
  }

  function renderPracticeField(level, field) {
    var draft = state.drafts[level.id] || {};
    var help = field.help;
    if (field.type === "cidr") help += " Tu peux écrire le masque en CIDR (/25) ou en décimal (255.255.255.128).";
    return `<label class="np-field"><span>${esc(shortFieldLabel(field))}</span><input name="${esc(field.key)}" data-help="${esc(help)}" data-label="${esc(field.label)}" placeholder="${esc(practicePlaceholder(field))}" value="${esc(draft[field.key] || "")}" autocomplete="off" spellcheck="false"></label>`;
  }

  function topology(level) {
    var groups = PRACTICE_GROUPS[level.id] || [];
    var lineSvg = level.links.map(function(pair){
      var a=level.nodes.find(function(n){return n.id===pair[0];}), b=level.nodes.find(function(n){return n.id===pair[1];});
      return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
    }).join("");
    var nodes = level.nodes.map(function(n){
      return `<div class="np-node ${n.type}" style="left:${n.x}%;top:${n.y}%"><span class="np-device">${deviceSvg(n.type)}</span><strong>${esc(n.label)}</strong><small>${esc(n.detail)}</small></div>`;
    }).join("");
    var cards = groups.map(function(g){
      var fields = g.fields.map(function(key){ var f=getField(level,key); return f ? renderPracticeField(level,f) : ""; }).join("");
      var kind=/route/i.test(g.badge)?"is-route":"is-interface";
      return `<section class="np-config-card ${kind}" style="left:${g.x}%;top:${g.y}%"><header><span>${esc(g.badge)}</span><strong>${esc(g.title)}</strong></header><div class="np-config-fields">${fields}</div></section>`;
    }).join("");
    return `<div class="np-board" data-level="${level.id}"><div class="np-board-grid"></div><svg class="np-lines" viewBox="0 0 100 100" preserveAspectRatio="none">${lineSvg}</svg>${nodes}${cards}<div class="np-coach" id="fieldCoach"><span>Repère</span><p>Clique dans un champ pour voir ce qu’il représente et ce qu’il faut chercher.</p></div></div>`;
  }

  function practiceModeOf(level) {
    if (level.id <= 4) return "basics";
    if (level.id <= 10) return "classic";
    return "complex";
  }

  function modeLabel(mode) {
    return mode === "basics" ? "Bases" : mode === "classic" ? "NetPractice" : mode === "complex" ? "Complexe" : "Tous";
  }

  function renderPractice() {
    var total = window.LEVELS.length;
    var list=window.LEVELS.map(function(l){
      var done=state.completed.indexOf(l.id)!==-1;
      var mode=practiceModeOf(l);
      return `<button class="level-pill ${l.id===state.level?'is-active':''} ${done?'is-done':''}" data-level="${l.id}" data-mode="${mode}" title="${esc(l.title)}"><span>${done?'✓':String(l.id).padStart(2,'0')}</span><div><strong>${esc(l.title)}</strong><small>${esc(l.difficulty)}</small></div></button>`;
    }).join("");
    $("#view-practice").innerHTML=`<div class="practice-layout"><aside class="level-sidebar" id="practiceSidebar"><div class="sidebar-heading"><div><span class="eyebrow">Pratique</span><h2>${total} exercices</h2><p><strong id="sidebarProgress">${state.completed.length}</strong> terminés</p></div><button class="sidebar-collapse" id="collapseSidebar" type="button" aria-label="Réduire le menu">‹</button></div><div class="mode-switch" aria-label="Mode d'entraînement"><button class="is-active" data-practice-mode="all">Tous</button><button data-practice-mode="basics">Bases</button><button data-practice-mode="classic">NP</button><button data-practice-mode="complex">Complexe</button></div><div class="level-list">${list}</div></aside><section id="levelContent" class="level-content"></section></div>`;
    applyPracticeMode();
    renderLevel(state.level);
  }

  function applyPracticeMode() {
    $$("[data-practice-mode]").forEach(function(b){b.classList.toggle("is-active",b.dataset.practiceMode===state.practiceMode);});
    $$(".level-pill").forEach(function(b){b.hidden=state.practiceMode!=="all" && b.dataset.mode!==state.practiceMode;});
  }

  function renderLevel(id) {
    state.level=Number(id);
    var l=window.LEVELS.find(function(x){return x.id===state.level;});
    if(!l) return;
    $$(".level-pill").forEach(function(b){b.classList.toggle("is-active",Number(b.dataset.level)===state.level);});
    $("#levelContent").innerHTML=`
      <div class="level-head"><div><span class="eyebrow">Exercice ${String(l.id).padStart(2,'0')} · ${esc(modeLabel(practiceModeOf(l)))}</span><h1>${esc(l.title)}</h1><p>${esc(l.goal)}</p></div><div class="concept-tags">${l.concepts.map(function(c){return `<span>${esc(c)}</span>`;}).join("")}</div></div>
      <div class="story-card"><span>Goal</span><p>${esc(l.story)}</p></div>
      <div class="practice-workspace">
        <div id="levelForm" class="np-exercise">
          <div class="np-toolbar"><div class="np-toolbar-left"><span class="np-status">TRAINING</span><strong>Level ${l.id}</strong><small>Complete the empty fields, then check your configuration.</small></div><div class="np-actions"><button class="np-action reset-all" id="resetAllExercises" type="button">Reset all</button><button class="np-action help" id="openHelp" type="button">Help</button><button class="np-action primary" id="checkConfig" type="button">Check again</button>${l.id < window.LEVELS.length ? `<button class="np-action next" id="nextLevel" type="button" ${state.completed.indexOf(l.id)!==-1?'':'hidden'}>Suivant →</button>` : ''}</div></div>
          ${topology(l)}
          <div id="levelFeedback" class="np-log"><span>Log</span><p>No test has been run yet.</p></div>
        </div>
      </div>
      <aside class="help-drawer" id="helpDrawer" aria-hidden="true"><div class="help-drawer-head"><div><span>Aide guidée</span><h2>Comprendre, pas deviner.</h2></div><button id="closeHelp" type="button" aria-label="Fermer">×</button></div><p class="help-intro">Clique d'abord dans un champ du schéma : le repère explique ce qu'il faut chercher. Les indices deviennent ensuite de plus en plus précis.</p><div id="hintArea"></div><button class="btn secondary full" id="nextHint" type="button">Afficher un indice</button><button class="text-btn solution-btn" id="showSolution" type="button">Voir la solution expliquée</button><div id="solutionArea"></div></aside><div class="drawer-scrim" id="drawerScrim"></div>`;
    state.hints[l.id]=0;
    bindLevel(l);
  }

  function collectForm(container) {
    var data={};
    container.querySelectorAll("input[name], select[name], textarea[name]").forEach(function(field){
      data[field.name]=field.value;
    });
    return data;
  }

  function bindLevel(level) {
    var form=$("#levelForm");
    var drawer=$("#helpDrawer"), scrim=$("#drawerScrim");
    function setHelp(open){ drawer.classList.toggle("is-open",open); scrim.classList.toggle("is-open",open); drawer.setAttribute("aria-hidden",open?"false":"true"); }
    $("#openHelp").addEventListener("click",function(){setHelp(true);});
    $("#closeHelp").addEventListener("click",function(){setHelp(false);});
    scrim.addEventListener("click",function(){setHelp(false);});
    $("#resetAllExercises").addEventListener("click", function(){
      var total = window.LEVELS.length;
      if (!window.confirm("Réinitialiser les " + total + " exercices ? Toutes les réponses, validations et aides seront effacées.")) return;
      state.completed = [];
      state.drafts = {};
      state.hints = {};
      state.level = 1;
      state.practiceMode = "all";
      localStorage.removeItem("np-academy-completed");
      localStorage.removeItem("np-academy-drafts");
      updateHeaderProgress();
      renderPractice();
    });
    form.addEventListener("input", function(){ saveDraft(level.id, collectForm(form)); });
    form.addEventListener("focusin", function(e){
      if(!e.target.matches("input[data-help]")) return;
      var coach=$("#fieldCoach");
      coach.innerHTML=`<span>${esc(e.target.dataset.label || "Champ")}</span><p>${esc(e.target.dataset.help || "")}</p>`;
      coach.classList.add("is-active");
    });
    $("#checkConfig").addEventListener("click",function(){
      var data=collectForm(form); saveDraft(level.id,data);
      var r=level.validate(data);
      var statusClass = !r.ok ? "log-bad" : r.expected === false ? "log-warn" : "log-ok";
      var statusText = !r.ok ? "Configuration incomplète" : r.expected === false ? "Configuration fonctionnelle — réponse différente de celle attendue" : "Configuration valide — réponse attendue";
      $("#levelFeedback").innerHTML=`<span>Journal</span><strong class="${statusClass}">${statusText}</strong><ul>${r.checks.map(function(c){var cls=!c.ok?'fail':c.warning?'warn':'pass';var icon=!c.ok?'×':c.warning?'!':'✓';return `<li class="${cls}">${icon} ${esc(c.text)}</li>`;}).join("")}</ul>`;
      if(r.ok){
        if(state.completed.indexOf(level.id)===-1){
          state.completed.push(level.id); state.completed.sort(function(a,b){return a-b;}); saveCompleted();
          var pill=$(`.level-pill[data-level="${level.id}"]`); if(pill){pill.classList.add("is-done");pill.querySelector(":scope > span").textContent="✓";}
          if($("#sidebarProgress")) $("#sidebarProgress").textContent=state.completed.length;
        }
        var next=$("#nextLevel"); if(next) next.hidden=false;
      }
    });
    var nextLevel=$("#nextLevel");
    if(nextLevel) nextLevel.addEventListener("click",function(){
      renderLevel(level.id + 1);
      window.scrollTo({top:0,behavior:"smooth"});
    });
    $("#nextHint").addEventListener("click",function(){
      var count=state.hints[level.id]||0;
      if(count<level.hints.length){
        count++; state.hints[level.id]=count;
        $("#hintArea").innerHTML=level.hints.slice(0,count).map(function(h,i){return `<div class="hint"><span>Indice ${i+1}</span><p>${esc(h)}</p></div>`;}).join("");
        if(count===level.hints.length) this.disabled=true;
      }
    });
    $("#showSolution").addEventListener("click",function(){ $("#solutionArea").innerHTML=`<div class="solution"><strong>Solution expliquée</strong><p>${esc(level.solution)}</p></div>`; this.disabled=true; });
  }

  function bindGlobal() {
    document.addEventListener("click",function(e){
      var mode=e.target.closest("[data-practice-mode]"); if(mode){state.practiceMode=mode.dataset.practiceMode;applyPracticeMode();var visible=$(".level-pill:not([hidden])");if(visible && (!$(".level-pill.is-active") || $(".level-pill.is-active").hidden)) renderLevel(visible.dataset.level);return;}
      if(e.target.closest("#collapseSidebar")){var sb=$("#practiceSidebar");sb.classList.toggle("is-collapsed");e.target.closest("#collapseSidebar").textContent=sb.classList.contains("is-collapsed")?"›":"‹";return;}
      var nav=e.target.closest("[data-nav], [data-go]"); if(nav){navigate(nav.dataset.nav||nav.dataset.go);return;}
      var level=e.target.closest("[data-level]"); if(level && level.matches("[data-level].level-pill")){renderLevel(level.dataset.level);return;}
      var toggle=e.target.closest(".course-toggle"); if(toggle){var body=toggle.parentElement.querySelector(".course-body"),open=body.classList.toggle("is-open");toggle.setAttribute("aria-expanded",open);return;}
    });
    $(".brand").addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" ")navigate("home");});
  }

  renderHome(); renderCourse(); renderLab(); renderPractice(); bindGlobal(); updateHeaderProgress();
})();
