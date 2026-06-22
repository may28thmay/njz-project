/* 「나를 파는 3개월」 엔진
 * 스텝 라우팅 · localStorage 자동저장 · 컴포넌트 렌더 · '내 책' 출력
 */
(function () {
  "use strict";
  var KEY = "naleul3_v1";
  var state = load();
  var A = state.a;            // answers map
  var CUR = {};              // 현재 위치 {week, idx, step, stepsList}

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { a: {} }; }
    catch (e) { return { a: {} }; }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }

  function esc(s) {
    return (s == null ? "" : String(s)).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function nl2br(s) { return esc(s).replace(/\n/g, "<br>"); }
  function getWeek(id) { return COURSE.weeks.filter(function (w) { return w.id === id; })[0]; }
  function stepsOf(week) {
    return week.steps.concat([{ type: "meetup", title: "이번 주, 만나서 함께", meetup: week.meetup }]);
  }

  /* ---------- 입력 핸들러 (인라인에서 호출) ---------- */
  window.setText = function (id, v) { A[id] = v; save(); };

  function choice(id) { if (!A[id]) A[id] = { picked: [], other: "" }; return A[id]; }
  window.toggleChoice = function (id, label, el, multi) {
    var c = choice(id), i = c.picked.indexOf(label);
    if (multi) { if (i >= 0) c.picked.splice(i, 1); else c.picked.push(label); }
    else {
      c.picked = (i >= 0) ? [] : [label];
      if (el && el.parentNode) {
        var sibs = el.parentNode.querySelectorAll(".chip");
        for (var k = 0; k < sibs.length; k++) sibs[k].classList.remove("on");
      }
    }
    if (el) el.classList.toggle("on", c.picked.indexOf(label) >= 0);
    save();
  };
  window.setOther = function (id, v) { choice(id).other = v; save(); };

  function card(id) { if (!A[id]) A[id] = { stage: 1, l1: [], l2: [] }; return A[id]; }
  window.cardToggle = function (id, word, el) {
    var c = card(id), list = c.stage === 1 ? c.l1 : c.l2, i = list.indexOf(word);
    if (i >= 0) list.splice(i, 1); else list.push(word);
    el.classList.toggle("on", list.indexOf(word) >= 0);
    save();
    var cc = document.getElementById("cardCount");
    if (cc) cc.textContent = list.length;
  };
  window.cardStage = function (id, stage) { card(id).stage = stage; save(); renderStep(); };

  function mand(id) { if (!A[id]) A[id] = { center: "", cells: ["", "", "", "", "", "", "", ""] }; return A[id]; }
  window.setMandalaCenter = function (id, v) { mand(id).center = v; save(); };
  window.setMandalaCell = function (id, i, v) { mand(id).cells[i] = v; save(); };

  function sl(id) { if (!A[id]) A[id] = {}; return A[id]; }
  window.setSlider = function (id, label, idx, v) {
    sl(id)[label] = +v; save();
    var lab = document.getElementById("slv_" + idx); if (lab) lab.textContent = v;
    var r = document.getElementById("radar"); if (r) r.innerHTML = radarInner(CUR.step.items, sl(id));
  };

  window.setLog = function (id, i, key, v) { A[id][i][key] = v; save(); };

  window.resetAll = function () {
    if (confirm("지금까지 쓴 내용을 모두 지울까요? 되돌릴 수 없어요.")) {
      localStorage.removeItem(KEY); location.hash = "#home"; location.reload();
    }
  };

  /* ---------- 채움 여부 ---------- */
  function hasAns(s) {
    var v = A[s.id];
    switch (s.type) {
      case "text": return !!(v && v.trim());
      case "choices": return !!(v && ((v.picked && v.picked.length) || (v.other && v.other.trim())));
      case "cardFilter": return !!(v && ((v.l1 && v.l1.length) || (v.l2 && v.l2.length)));
      case "mandala": return !!(v && (v.center || (v.cells && v.cells.some(function (c) { return c; }))));
      case "sliders": return !!(v && Object.keys(v).length);
      case "dailyLog": return !!(v && v.some(function (d) { return Object.keys(d).some(function (k) { return d[k] && String(d[k]).trim(); }); }));
      default: return false;
    }
  }
  function inputSteps(week) { return week.steps.filter(function (s) { return s.type !== "intro"; }); }

  /* ---------- 레이더 ---------- */
  function ring(n, cx, cy, r) {
    var p = "";
    for (var i = 0; i < n; i++) { var a = Math.PI * 2 * i / n - Math.PI / 2; p += (cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1) + " "; }
    return p.trim();
  }
  function radarInner(items, vals) {
    var n = items.length, cx = 110, cy = 110, R = 80, max = 10, out = "";
    [0.25, 0.5, 0.75, 1].forEach(function (t) { out += '<polygon points="' + ring(n, cx, cy, R * t) + '" class="rgrid"/>'; });
    var shape = "", labels = "";
    for (var i = 0; i < n; i++) {
      var a = Math.PI * 2 * i / n - Math.PI / 2;
      var ex = cx + R * Math.cos(a), ey = cy + R * Math.sin(a);
      out += '<line x1="' + cx + '" y1="' + cy + '" x2="' + ex.toFixed(1) + '" y2="' + ey.toFixed(1) + '" class="raxis"/>';
      var raw = (vals && vals[items[i]] != null) ? vals[items[i]] : 5, r = R * raw / max;
      shape += (cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1) + " ";
      var lx = cx + (R + 18) * Math.cos(a), ly = cy + (R + 18) * Math.sin(a);
      labels += '<text x="' + lx.toFixed(1) + '" y="' + (ly + 3).toFixed(1) + '" class="rlabel" text-anchor="middle">' + esc(items[i]) + "</text>";
    }
    return out + '<polygon points="' + shape.trim() + '" class="rshape"/>' + labels;
  }

  /* ---------- 컴포넌트 렌더 ---------- */
  function compText(s) {
    var v = A[s.id] || "";
    var hint = s.hint ? '<p class="hint">' + esc(s.hint) + "</p>" : "";
    var ph = esc(s.placeholder || "");
    var field = s.multiline
      ? '<textarea rows="5" placeholder="' + ph + '" oninput="setText(\'' + s.id + '\',this.value)">' + esc(v) + "</textarea>"
      : '<input type="text" placeholder="' + ph + '" value="' + esc(v) + '" oninput="setText(\'' + s.id + '\',this.value)">';
    return hint + field;
  }
  function compChoices(s) {
    var c = A[s.id] || { picked: [], other: "" };
    var hint = s.hint ? '<p class="hint">' + esc(s.hint) + "</p>" : "";
    var chips = s.options.map(function (o) {
      var on = c.picked.indexOf(o) >= 0 ? " on" : "";
      return '<button class="chip' + on + '" onclick="toggleChoice(\'' + s.id + "','" + esc(o).replace(/'/g, "") + "',this," + (s.multi ? "true" : "false") + ')">' + esc(o) + "</button>";
    }).join("");
    var other = s.allowOther
      ? '<input type="text" class="other" placeholder="직접 쓰기" value="' + esc(c.other || "") + '" oninput="setOther(\'' + s.id + '\',this.value)">'
      : "";
    return hint + '<div class="chips">' + chips + "</div>" + other;
  }
  function compCard(s) {
    var c = card(s.id);
    var pool = c.stage === 1 ? s.words : (c.l1.length ? c.l1 : []);
    var sel = c.stage === 1 ? c.l1 : c.l2;
    var hintTxt = c.stage === 1 ? s.stage1Hint : s.stage2Hint;
    if (c.stage === 2 && c.l1.length === 0) {
      return '<p class="hint">1단계에서 단어를 먼저 골라주세요.</p><div class="rowbtn"><button class="btn ghost" onclick="cardStage(\'' + s.id + '\',1)">← 1단계로</button></div>';
    }
    var chips = pool.map(function (w) {
      var on = sel.indexOf(w) >= 0 ? " on" : "";
      return '<button class="chip' + on + '" onclick="cardToggle(\'' + s.id + "','" + w + "',this)\">" + esc(w) + "</button>";
    }).join("");
    var counter = '<p class="hint">' + esc(hintTxt) + ' · <b><span id="cardCount">' + sel.length + "</span></b>개 선택</p>";
    var nav = c.stage === 1
      ? '<div class="rowbtn"><button class="btn" onclick="cardStage(\'' + s.id + '\',2)">다음 단계 →</button></div>'
      : '<div class="rowbtn"><button class="btn ghost" onclick="cardStage(\'' + s.id + '\',1)">← 다시 고르기</button></div>';
    return counter + '<div class="chips cards">' + chips + "</div>" + nav;
  }
  function compMandala(s) {
    var m = mand(s.id);
    var cell = function (i) {
      return '<textarea class="mcell" rows="2" placeholder="·" oninput="setMandalaCell(\'' + s.id + "'," + i + ',this.value)">' + esc(m.cells[i]) + "</textarea>";
    };
    var center = '<textarea class="mcell center" rows="2" placeholder="' + esc(s.centerLabel) + '" oninput="setMandalaCenter(\'' + s.id + '\',this.value)">' + esc(m.center) + "</textarea>";
    var hint = s.hint ? '<p class="hint">' + esc(s.hint) + "</p>" : "";
    return hint + '<div class="mandala">' +
      cell(0) + cell(1) + cell(2) +
      cell(3) + center + cell(4) +
      cell(5) + cell(6) + cell(7) + "</div>";
  }
  function compSliders(s) {
    var vals = sl(s.id);
    var hint = s.hint ? '<p class="hint">' + esc(s.hint) + "</p>" : "";
    var rows = s.items.map(function (label, i) {
      var v = (vals[label] != null) ? vals[label] : 5;
      return '<div class="slider"><span class="slabel">' + esc(label) + "</span>" +
        '<input type="range" min="0" max="10" value="' + v + '" oninput="setSlider(\'' + s.id + "','" + label + "'," + i + ',this.value)">' +
        '<span class="sval" id="slv_' + i + '">' + v + "</span></div>";
    }).join("");
    var svg = '<svg class="radar" id="radar" viewBox="0 0 220 220">' + radarInner(s.items, vals) + "</svg>";
    return hint + '<div class="sliders">' + rows + "</div>" + svg;
  }
  function compLog(s) {
    if (!A[s.id]) { A[s.id] = []; for (var k = 0; k < 7; k++) { var o = {}; s.fields.forEach(function (f) { o[f.key] = ""; }); A[s.id].push(o); } save(); }
    var data = A[s.id];
    var hint = s.hint ? '<p class="hint">' + esc(s.hint) + "</p>" : "";
    var blocks = data.map(function (row, i) {
      var fields = s.fields.map(function (f) {
        return '<label class="logf"><span>' + esc(f.label) + "</span>" +
          '<input type="text" value="' + esc(row[f.key] || "") + '" oninput="setLog(\'' + s.id + "'," + i + ",'" + f.key + "',this.value)\"></label>";
      }).join("");
      return '<div class="logday"><div class="logno">Day ' + (i + 1) + "</div>" + fields + "</div>";
    }).join("");
    return hint + '<div class="loggrid">' + blocks + "</div>";
  }
  function compMeetup(mu) {
    var d = mu.discuss.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
    var a = mu.activity.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
    return '<div class="meetup">' +
      '<p class="mtag">혼자 채운 걸 들고 모이는 시간이에요. 입력하지 않아도 돼요.</p>' +
      '<h4>이야기할 거리</h4><ul>' + d + "</ul>" +
      '<h4>함께 하는 액티비티</h4><ul>' + a + "</ul></div>";
  }

  /* ---------- 화면 ---------- */
  function renderHome() {
    var cards = COURSE.weeks.map(function (w) {
      var ins = inputSteps(w), done = ins.filter(hasAns).length;
      var meta = done ? done + "/" + ins.length + " 채움" : "시작 전";
      return '<a class="wcard" href="#' + w.id + '/0"><div class="wbadge">' + esc(w.badge) + "</div>" +
        "<h3>" + esc(w.title) + "</h3><p>" + esc(w.chapter) + '</p><span class="wmeta">' + meta + "</span></a>";
    }).join("");
    var locked = COURSE.locked.map(function (l) {
      return '<div class="wcard locked"><div class="wbadge">' + esc(l.badge) + "</div><h3>" + esc(l.title) + "</h3><p>" + esc(l.desc) + "</p></div>";
    }).join("");
    var promises = COURSE.promises.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
    document.getElementById("app").innerHTML =
      '<section class="home">' +
      '<div class="hero"><h1>' + esc(COURSE.title) + "</h1><p>" + esc(COURSE.subtitle) + "</p></div>" +
      '<div class="promises"><ul>' + promises + "</ul></div>" +
      '<div class="wgrid">' + cards + locked + "</div>" +
      '<div class="rowbtn center"><a class="btn big" href="#book">내 책 미리보기 →</a></div>' +
      '<div class="reset"><button onclick="resetAll()">처음부터 다시</button></div>' +
      "</section>";
    window.scrollTo(0, 0);
  }

  function renderStep() {
    var week = getWeek(CUR.weekId);
    if (!week) { location.hash = "#home"; return; }
    var list = stepsOf(week);
    if (CUR.idx < 0 || CUR.idx >= list.length) { location.hash = "#home"; return; }
    var s = list[CUR.idx]; CUR.step = s; CUR.stepsList = list;
    var body;
    switch (s.type) {
      case "intro": body = '<p class="introbody">' + nl2br(s.body) + "</p>"; break;
      case "text": body = compText(s); break;
      case "choices": body = compChoices(s); break;
      case "cardFilter": body = compCard(s); break;
      case "mandala": body = compMandala(s); break;
      case "sliders": body = compSliders(s); break;
      case "dailyLog": body = compLog(s); break;
      case "meetup": body = compMeetup(s.meetup); break;
      default: body = "";
    }
    var pct = Math.round((CUR.idx + 1) / list.length * 100);
    var prevHref = CUR.idx > 0 ? "#" + week.id + "/" + (CUR.idx - 1) : "#home";
    var isLast = CUR.idx === list.length - 1;
    var nextHref = isLast ? "#home" : "#" + week.id + "/" + (CUR.idx + 1);
    var nextLabel = isLast ? "이 주차 마치기 ✓" : "다음 →";
    document.getElementById("app").innerHTML =
      '<section class="step">' +
      '<div class="crumbs"><a href="#home">홈</a> · ' + esc(week.badge) + " · " + (CUR.idx + 1) + "/" + list.length + "</div>" +
      '<div class="pbar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="jtitle">' + esc(week.title) + "</div>" +
      "<h2>" + esc(s.title) + "</h2>" +
      '<div class="stepbody">' + body + "</div>" +
      '<div class="nav"><a class="btn ghost" href="' + prevHref + '">← 이전</a>' +
      '<a class="btn" href="' + nextHref + '">' + nextLabel + "</a></div>" +
      (isLast ? '<div class="rowbtn center"><a class="btn big" href="#book">내 책 미리보기 →</a></div>' : "") +
      "</section>";
    window.scrollTo(0, 0);
  }

  /* ---------- 내 책 ---------- */
  function fmtChoices(id) {
    var c = A[id]; if (!c) return "";
    var arr = (c.picked || []).slice(); if (c.other && c.other.trim()) arr.push(c.other.trim());
    return arr.join(", ");
  }
  function bookBlock(label, val) {
    if (!val || !String(val).trim()) return '<div class="bq"><h4>' + esc(label) + '</h4><p class="empty">아직 비어 있어요</p></div>';
    return '<div class="bq"><h4>' + esc(label) + "</h4><p>" + nl2br(val) + "</p></div>";
  }
  function bookMandala(id) {
    var m = A[id]; if (!m) return '<p class="empty">아직 비어 있어요</p>';
    var c = function (i) { return '<div class="bmcell">' + esc(m.cells[i] || "") + "</div>"; };
    return '<div class="mandala book">' + c(0) + c(1) + c(2) + c(3) +
      '<div class="bmcell center">' + esc(m.center || "") + "</div>" + c(4) + c(5) + c(6) + c(7) + "</div>";
  }
  function renderBook() {
    var title = (A.book_title && A.book_title.trim()) || "제목 없는 책";
    var author = (A.author && A.author.trim()) || "나";
    var vals5 = (A.w3_values && A.w3_values.l2) ? A.w3_values.l2.join(" · ") : "";
    var radarVals = A.w4_areas || {};
    var areaItems = getWeek("w4").steps.filter(function (s) { return s.type === "sliders"; })[0].items;
    var html =
      '<section class="book">' +
      '<div class="noprint bookbar"><a class="btn ghost" href="#home">← 홈</a><button class="btn" onclick="window.print()">PDF로 저장 / 인쇄</button></div>' +
      '<div class="cover"><div class="covertag">나를 파는 3개월</div><h1>' + esc(title) + '</h1><p class="byline">' + esc(author) + " 지음</p></div>" +

      '<div class="chapter"><div class="chno">서문</div><h2>나는 왜 이 책을 쓰는가</h2>' +
      bookBlock("이 책을 시작하는 지금의 나는,", A.w1_start_mind) +
      bookBlock("요즘 가장 답답하거나 궁금한 것", A.w1_curious) +
      bookBlock("내가 답을 찾고 싶은 질문", A.w1_question) +
      bookBlock("3개월 뒤의 나에게", A.w1_letter) + "</div>" +

      '<div class="chapter"><div class="chno">1부</div><h2>나의 작동방식</h2>' +
      bookBlock("나는 이렇게 작동한다", A.w2_summary) +
      bookBlock("집중이 잘 될 때", fmtChoices("w2_focus_when")) +
      bookBlock("금방 흩어질 때", fmtChoices("w2_focus_break")) +
      bookBlock("시간 가는 줄 모르고 빠져드는 일", A.w2_flow) +
      bookBlock("에너지가 가장 좋은 시간대", fmtChoices("w2_energy_peak")) +
      bookBlock("충전되는 것 / 방전되는 것", A.w2_recharge) + "</div>" +

      '<div class="chapter"><h2>나의 강점 지도</h2>' +
      bookBlock("나를 관통하는 가치 5", vals5) +
      bookBlock("남들은 어려운데 나는 쉬운 일", A.w3_easy) +
      bookBlock("사람들이 고마워하는 것", A.w3_thank) +
      bookBlock("내가 잘 되는 환경", fmtChoices("w3_env")) + "</div>" +

      '<div class="chapter"><div class="chno">2부</div><h2>나의 현재 지도</h2>' +
      '<div class="bq"><h4>지금 내 삶의 영역</h4><svg class="radar" viewBox="0 0 220 220">' + radarInner(areaItems, radarVals) + "</svg></div>" +
      bookBlock("각 영역, 지금 한 줄", A.w4_area_note) +
      '<div class="bq"><h4>채우고 싶은 영역 만다라트</h4>' + bookMandala("w4_mandala") + "</div></div>" +

      '<div class="chapter future"><div class="chno">3부 · 4부 · 맺음</div><h2>다음 달에 채워집니다</h2>' +
      '<p class="empty">내가 원하는 것 · 나의 실험 · 다음 1년의 나에게</p></div>' +
      "</section>";
    document.getElementById("app").innerHTML = html;
    window.scrollTo(0, 0);
  }

  /* ---------- 라우팅 ---------- */
  function route() {
    var h = location.hash.replace(/^#/, "");
    if (h === "book") { renderBook(); return; }
    var m = h.match(/^(w\d+)\/(\d+)$/);
    if (m) { CUR.weekId = m[1]; CUR.idx = +m[2]; renderStep(); return; }
    renderHome();
  }
  window.addEventListener("hashchange", route);
  route();
})();
