/* =========================================================
   菓子喫茶 モンブラン — main.js
   ========================================================= */
document.documentElement.classList.add("js");

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

/* ---------------------------------------------------------
   オーニング
   実店舗のドーム型オーニングを正面から見た形：
   上が暗く下が明るい布の丸み／骨組みの継ぎ目／
   裾のスカラップ（波形）と、それに沿った白い波線。
   幅に合わせて描き直し、波の大きさは常に一定にする。
   --------------------------------------------------------- */
function drawAwning() {
  const wrap = $(".awning");
  const svg = $(".awning__svg");
  if (!wrap || !svg) return;

  const W = wrap.clientWidth;
  const H = wrap.clientHeight;
  const sp = W < 769;
  const r = sp ? 9 : 13;            // スカラップの半径
  const valance = sp ? 16 : 24;     // 裾の帯の高さ
  const bodyH = H - valance - r;    // 丸みのある本体の高さ
  const y0 = bodyH + valance;       // スカラップの付け根
  const panels = Math.max(5, Math.round(W / (sp ? 70 : 110)));

  // 裾の波：左端から右端まで半円を並べる
  const count = Math.ceil(W / (r * 2));
  const scallop = (y, rad) => {
    let d = "";
    for (let i = 0; i < count; i++) d += ` a${rad},${rad} 0 0 0 ${rad * 2},0`;
    return `M0,${y}` + d;
  };

  // 骨組み：上（壁側）ほど中央に寄せ、ゆるくふくらませる
  let ribs = "";
  for (let i = 1; i < panels; i++) {
    const xb = (W / panels) * i;
    const xt = W / 2 + (xb - W / 2) * 0.86;
    const cx = (xb + xt) / 2 + (xb - W / 2) * 0.03;
    ribs += `<path d="M${xt},0 Q${cx},${bodyH * 0.55} ${xb},${bodyH}" />`;
  }

  // 布のたわみ：各パネルの中央を少し明るく
  let sheen = "";
  for (let i = 0; i < panels; i++) {
    const xl = (W / panels) * i;
    sheen += `<rect x="${xl}" y="0" width="${W / panels}" height="${bodyH}" fill="url(#aw-panel)" />`;
  }

  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("width", W);
  svg.setAttribute("height", H);
  svg.innerHTML = `
    <defs>
      <linearGradient id="aw-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style="stop-color:var(--awning-shade)" />
        <stop offset=".55" style="stop-color:var(--awning)" />
        <stop offset="1" style="stop-color:var(--awning-light)" />
      </linearGradient>
      <linearGradient id="aw-panel" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#000" stop-opacity=".07" />
        <stop offset=".5" stop-color="#fff" stop-opacity=".04" />
        <stop offset="1" stop-color="#000" stop-opacity=".07" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${W}" height="${bodyH + 1}" fill="url(#aw-body)" />
    ${sheen}
    <g fill="none" stroke="#000" stroke-opacity=".28" stroke-width="1.2">${ribs}</g>
    <path d="${scallop(y0, r)} L${W},${bodyH} L0,${bodyH} Z" style="fill:var(--awning)" />
    <line x1="0" y1="${bodyH}" x2="${W}" y2="${bodyH}" stroke="#000" stroke-opacity=".3" />
    <path d="${scallop(y0 - 5, r)}" fill="none" style="stroke:var(--awning-trim)" stroke-width="${sp ? 1.2 : 1.6}" />
  `;
}

/* ---------------------------------------------------------
   本日の営業
   --------------------------------------------------------- */
const fmt = (h) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;

function todayStatus(now = new Date()) {
  const day = SHOP.hours[now.getDay()];
  const h = now.getHours() + now.getMinutes() / 60;
  if (!day) return { status: "本日定休", time: "月・火 定休", band: "" , type: null };

  const time = `${fmt(day.open)} – ${fmt(day.close)}`;
  const band = SHOP.bands[day.type].find((b) => h >= b.from && h < b.to);
  if (h < day.open) return { status: "開店前", time, band: `${fmt(day.open)} 開店`, type: day.type };
  if (h >= day.close) return { status: "本日終了", time, band: "またお越しください", type: day.type };
  if (band && band.off) return { status: "準備中", time, band: "11:00 からランチ", type: day.type, now: band };
  return { status: "営業中", time, band: band ? `いまは「${band.label}」の時間` : "", type: day.type, now: band };
}

function renderStatus() {
  const s = todayStatus();
  $$(".js-status").forEach((el) => (el.textContent = s.status));
  $$(".js-time").forEach((el) => (el.textContent = s.time));
  $$(".js-band").forEach((el) => (el.textContent = s.band));
  return s;
}

/* ---------------------------------------------------------
   お品書き
   featured: true の品（たぬきケーキ）は常に表示し、
   それ以外はジャンルごとに開閉できる一覧にする。
   --------------------------------------------------------- */
function renderMenu() {
  const box = $(".js-menu");
  if (!box) return;
  const yen = (p) => (p == null ? "—" : `¥${p.toLocaleString()}`);
  const row = (it) => `
    <div class="menu__item">
      <span class="menu__name">${it.name}${it.note ? `<small>${it.note}</small>` : ""}</span>
      <span class="menu__price">${yen(it.price)}</span>
    </div>`;

  const featured = SHOP.menu.flatMap((c) => c.items.filter((it) => it.featured));
  const featuredNames = featured.map((it) => it.name);
  const inCats = (name) =>
    SHOP.menu.filter((c) => c.items.some((it) => it.name === name)).map((c) => c.title);

  const pinned = featured
    .map(
      (it) => `
    <div class="menu__featured">
      <p class="menu__badge">看板</p>
      ${it.photo ? `<figure class="ph menu__featured-photo" data-label="${it.name}" data-photo="${it.photo}"></figure>` : ""}
      <div class="menu__featured-body">
        <p class="menu__featured-name">${it.name}${it.note ? `<small>${it.note}</small>` : ""}</p>
        <p class="menu__featured-tags">${inCats(it.name).join("・")}</p>
      </div>
      <p class="menu__price menu__featured-price">${yen(it.price)}</p>
    </div>`
    )
    .join("");

  const groups = SHOP.menu
    .map((cat) => {
      const items = cat.items.filter((it) => !featuredNames.includes(it.name));
      if (!items.length) return "";
      return `
    <details class="menu__group" id="menu-${cat.id}">
      <summary class="menu__head">
        <h3>${cat.title}</h3><span class="menu__en">${cat.label}</span>
        <span class="menu__count">${items.length}品</span>
      </summary>
      <div class="menu__list">${items.map(row).join("")}</div>
    </details>`;
    })
    .join("");

  box.innerHTML = pinned + groups;
}

/* ---------------------------------------------------------
   店舗情報・地図・Instagram
   --------------------------------------------------------- */
function renderInfo() {
  const q = encodeURIComponent(SHOP.mapQuery);
  const set = (sel, fn) => $$(sel).forEach(fn);
  set(".js-address", (el) => (el.textContent = SHOP.address));
  set(".js-station", (el) => (el.textContent = SHOP.station));
  set(".js-hours", (el) => {
    el.innerHTML = SHOP.hoursText.map((r) => `<div class="hours-row"><span>${r.day}</span><span>${r.time}</span></div>`).join("");
  });
  set(".js-map", (el) => (el.src = `https://maps.google.com/maps?q=${q}&z=17&output=embed`));
  set(".js-maplink", (el) => (el.href = `https://www.google.com/maps/search/?api=1&query=${q}`));
  set(".js-insta", (el) => (el.href = SHOP.instagram));
  set(".js-insta-id", (el) => (el.textContent = SHOP.instagramId));
}

/* ---------------------------------------------------------
   いま見ている章を目次・下部バーに反映
   --------------------------------------------------------- */
function watchSections() {
  const links = $$(".side__nav a, .dock a:not(.dock__status)");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.id;
        links.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === `#${id}`));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("main section[id]").forEach((s) => io.observe(s));
}

/* ---------------------------------------------------------
   ゆっくり表示
   --------------------------------------------------------- */
function reveal() {
  const targets = $$(".chapter__body > *, .story__item, .hero__copy");
  targets.forEach((t) => t.classList.add("reveal"));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px" }
  );
  targets.forEach((t) => io.observe(t));
}

/* ---------------------------------------------------------
   写真（data.js の PHOTOS から差し込む）
   --------------------------------------------------------- */
function renderPhotos() {
  if (typeof PHOTOS === "undefined") return;
  $$("[data-photo]").forEach((fig) => {
    const src = PHOTOS[fig.dataset.photo];
    if (!src) return;
    const img = new Image();
    img.alt = fig.dataset.label || "";
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    img.onload = () => fig.classList.add("has-img");
    img.src = src;
    fig.appendChild(img);
  });
}

/* --------------------------------------------------------- */
renderMenu();
renderPhotos();
drawAwning();
new ResizeObserver(drawAwning).observe($(".awning"));
renderInfo();
renderStatus();
setInterval(renderStatus, 60 * 1000);
watchSections();
reveal();
