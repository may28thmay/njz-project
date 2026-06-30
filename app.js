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
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) {
      if (!save._warned) {
        save._warned = true;
        setTimeout(function () { alert("저장 공간이 가득 찼거나 브라우저가 저장을 막고 있어요. '내 기록 백업하기'로 파일을 받아두세요."); }, 0);
      }
    }
  }

  function esc(s) {
    return (s == null ? "" : String(s)).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function nl2br(s) { return esc(s).replace(/\n/g, "<br>"); }
  function getWeek(id) { return COURSE.weeks.filter(function (w) { return w.id === id; })[0]; }
  /* ---------- 공개 게이팅 / 관리자 ---------- */
  var ADMIN_HASH = "admin-najung";   // 비밀 진입 주소: .../#admin-najung (한 번 들어오면 이 기기에 기억)
  function isAdmin() { try { return localStorage.getItem("njz_admin") === "1"; } catch (e) { return false; } }
  function publishedN() { var n = COURSE.publishedWeeks; return (typeof n === "number") ? n : COURSE.weeks.length; }
  function weekVisible(w) { if (isAdmin()) return true; var i = COURSE.weeks.indexOf(w); return i >= 0 && i < publishedN(); }
  window.exitAdmin = function () { try { localStorage.removeItem("njz_admin"); } catch (e) {} location.hash = "#home"; route(); };
  function stepsOf(week) {
    return week.steps.concat([{ type: "meetup", title: "이번 주, 만나서 함께", meetup: week.meetup }]);
  }

  /* ---------- 입력 핸들러 (인라인에서 호출) ---------- */
  window.setText = function (id, v) { A[id] = v; save(); };
  function listData(id) { if (!Array.isArray(A[id])) A[id] = []; return A[id]; }
  window.setListItem = function (id, i, v) { var a = listData(id); a[i] = v; save(); };
  window.addListRow = function (id) { listData(id).push(""); save(); renderStep(); };

  function choice(id) {
    if (!A[id]) A[id] = { picked: [], other: "" };
    var c = A[id];
    if (!c.picked) c.picked = [];
    if (typeof c.other === "string" && c.other.trim()) {
      if (c.picked.indexOf(c.other.trim()) < 0) c.picked.push(c.other.trim());
      c.other = "";
    }
    return c;
  }
  window.toggleChoice = function (id, label, el, multi, max) {
    var c = choice(id), i = c.picked.indexOf(label);
    if (multi) {
      if (i >= 0) c.picked.splice(i, 1);
      else { if (max && c.picked.length >= max) return; c.picked.push(label); }
    }
    else {
      c.picked = (i >= 0) ? [] : [label];
      if (el && el.parentNode) {
        var sibs = el.parentNode.querySelectorAll(".chip");
        for (var k = 0; k < sibs.length; k++) sibs[k].classList.remove("on");
      }
    }
    if (el) el.classList.toggle("on", c.picked.indexOf(label) >= 0);
    save();
    if (max) { var cn = document.getElementById(id + "_cnt"); if (cn) { cn.textContent = c.picked.length + " / " + max; cn.classList.toggle("done", c.picked.length === max); } }
  };
  window.addOther = function (id, el, multi, max) {
    var v = (el.value || "").trim();
    if (!v) return;
    var c = choice(id);
    if (max && c.picked.indexOf(v) < 0 && c.picked.length >= max) { el.value = ""; return; }
    var box = el.parentNode.querySelector(".chips");
    if (box) {
      var btns = box.querySelectorAll(".chip");
      for (var i = 0; i < btns.length; i++) {
        if (btns[i].textContent === v) {
          if (c.picked.indexOf(v) < 0) { c.picked.push(v); btns[i].classList.add("on"); save(); }
          el.value = ""; el.focus(); return;
        }
      }
    }
    c.picked.push(v); save();
    if (box) {
      var b = document.createElement("button");
      b.className = "chip on";
      b.textContent = v;
      b.onclick = function () { window.toggleChoice(id, v, b, !!multi, max); };
      box.appendChild(b);
    }
    el.value = ""; el.focus();
  };

  function card(id) { if (!A[id]) A[id] = { stage: 1, l1: [], l2: [] }; return A[id]; }
  window.cardToggle = function (id, word, el) {
    var c = card(id), list = c.stage === 1 ? c.l1 : c.l2, i = list.indexOf(word);
    var cap = CUR.step && (c.stage === 1 ? CUR.step.pick1 : CUR.step.pick2);
    if (i >= 0) list.splice(i, 1);
    else { if (cap && list.length >= cap) return; list.push(word); }
    el.classList.toggle("on", list.indexOf(word) >= 0);
    save();
    var cc = document.getElementById("cardCount");
    if (cc) { cc.textContent = cap ? (list.length + " / " + cap) : (list.length + "개 선택"); cc.parentNode.classList.toggle("done", !!cap && list.length === cap); }
    if (c.stage === 1) { var nb = document.getElementById("cardNext"); if (nb && cap) nb.disabled = (list.length !== cap); }
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
  window.setAssess = function (id, label, score, el) {
    sl(id)[label] = +score; save();
    if (el && el.parentNode) {
      var chips = el.parentNode.querySelectorAll(".chip");
      for (var i = 0; i < chips.length; i++) chips[i].classList.remove("on");
      el.classList.add("on");
    }
    var items = (CUR.step.areas || []).map(function (a) { return a.label; });
    var r = document.getElementById("radar"); if (r) r.innerHTML = radarInner(items, sl(id));
  };

  window.setLog = function (id, i, key, v) { A[id][i][key] = v; save(); };

  window.resetAll = function () {
    if (confirm("지금까지 쓴 내용을 모두 지울까요? 되돌릴 수 없어요.")) {
      localStorage.removeItem(KEY); location.hash = "#home"; location.reload();
    }
  };

  /* ---------- 백업 (파일 내보내기/가져오기) ---------- */
  window.exportData = function () {
    try {
      var data = JSON.stringify({ app: "naleul3", v: 1, savedAt: new Date().toISOString(), a: state.a });
      var blob = new Blob([data], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var d = new Date(), pad = function (n) { return (n < 10 ? "0" : "") + n; };
      var name = "나를알아가는3개월_백업_" + d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + ".json";
      var a = document.createElement("a");
      a.href = url; a.download = name; document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    } catch (e) { alert("백업에 실패했어요. 잠시 후 다시 시도해 주세요."); }
  };
  window.importData = function (input) {
    var file = input.files && input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var obj = JSON.parse(e.target.result);
        var ans = obj && obj.a;
        if (!ans || typeof ans !== "object" || Array.isArray(ans)) throw new Error("형식");
        if (!confirm("지금 이 기기의 기록을 백업 파일 내용으로 바꿔요. 계속할까요?")) { input.value = ""; return; }
        localStorage.setItem(KEY, JSON.stringify({ a: ans }));
        location.hash = "#home"; location.reload();
      } catch (err) {
        alert("이 파일은 백업 파일이 아닌 것 같아요. '내 기록 백업하기'로 받은 .json 파일을 골라주세요.");
        input.value = "";
      }
    };
    reader.readAsText(file);
  };

  /* ---------- 채움 여부 ---------- */
  function hasAns(s) {
    var v = A[s.id];
    switch (s.type) {
      case "text": return !!(v && v.trim());
      case "list": return !!(Array.isArray(v) && v.some(function (x) { return x && String(x).trim(); }));
      case "promptForge": if (!s.reframeId) return false; var r = A[s.reframeId]; return !!(r && Object.keys(r).some(function (k) { return r[k] && String(r[k]).trim(); }));
      case "choices": return !!(v && ((v.picked && v.picked.length) || (v.other && v.other.trim())));
      case "shadow": return !!(v && v.picked && v.picked.length);
      case "byStrength": return !!(v && typeof v === "object" && Object.keys(v).some(function (k) { var x = v[k]; return (typeof x === "string" && x.trim()) || (x && x.picked && x.picked.length); }));
      case "gap": return false;
      case "cardFilter": return !!(v && ((v.l1 && v.l1.length) || (v.l2 && v.l2.length)));
      case "mandala": return !!(v && (v.center || (v.cells && v.cells.some(function (c) { return c; }))));
      case "sliders": return !!(v && Object.keys(v).length);
      case "assess": return !!(v && Object.keys(v).length);
      case "big5": return !!(v && v.domains && Object.keys(v.domains).length);
      case "dailyLog": return !!(v && v.some(function (d) { return Object.keys(d).some(function (k) { return d[k] && String(d[k]).trim(); }); }));
      case "reframe": return !!(v && (v.resonate || v.doubt || v.mine));
      case "digest": return !!(v && Object.keys(v).some(function (k) { return v[k] && String(v[k]).trim(); }));
      case "journey": return !!(v && ((v.v && v.v.some(function (x) { return x; })) || v.where || v.surprise));
      case "commit": return !!(v && (v.what || v.why));
      case "progress": return !!(v && (v.done || v.note));
      case "manifest": return !!(v && String(v).trim());
      case "ikigai": return !!(v && (v.like || v.good || v.need || v.paid || v.center));
      case "priority": return !!(v && ((v.order && v.order.some(function (x) { return x && String(x).trim(); })) || (v.why && v.why.trim())));
      case "odyssey": return !!(v && v.plans && v.plans.some(function (p) { return p.t || p.b; }));
      case "fearSetting": return !!(v && (v.define || v.prevent || v.repair));
      default: return false;
    }
  }
  function inputSteps(week) {
    return week.steps.filter(function (s) {
      if (s.optional || s.type === "intro") return false;
      if (s.type === "promptForge") return !!s.reframeId;
      return true;
    });
  }
  // 홈 '채움' 표시용: 답할 수 있는 모든 문항(옵션 포함, 순수 표시·안내 제외)
  function answerableSteps(week) {
    return week.steps.filter(function (s) {
      if (!s.id) return false;
      if (s.type === "intro" || s.type === "meetup" || s.type === "compare" || s.type === "gap") return false;
      if (s.type === "promptForge") return !!s.reframeId;
      return true;
    });
  }

  /* ---------- 레이더 ---------- */
  function ring(n, cx, cy, r) {
    var p = "";
    for (var i = 0; i < n; i++) { var a = Math.PI * 2 * i / n - Math.PI / 2; p += (cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1) + " "; }
    return p.trim();
  }
  function radarInner(items, vals, vals2, maxArg) {
    var n = items.length, cx = 110, cy = 110, R = 80, max = maxArg || 10, out = "";
    [0.25, 0.5, 0.75, 1].forEach(function (t) { out += '<polygon points="' + ring(n, cx, cy, R * t) + '" class="rgrid"/>'; });
    function poly(vv, cls) {
      var sh = "";
      for (var j = 0; j < n; j++) {
        var aa = Math.PI * 2 * j / n - Math.PI / 2;
        var raw = (vv && vv[items[j]] != null) ? vv[items[j]] : 5, r = R * raw / max;
        sh += (cx + r * Math.cos(aa)).toFixed(1) + "," + (cy + r * Math.sin(aa)).toFixed(1) + " ";
      }
      return '<polygon points="' + sh.trim() + '" class="' + cls + '"/>';
    }
    var labels = "";
    for (var i = 0; i < n; i++) {
      var a = Math.PI * 2 * i / n - Math.PI / 2;
      var ex = cx + R * Math.cos(a), ey = cy + R * Math.sin(a);
      out += '<line x1="' + cx + '" y1="' + cy + '" x2="' + ex.toFixed(1) + '" y2="' + ey.toFixed(1) + '" class="raxis"/>';
      var lx = cx + (R + 18) * Math.cos(a), ly = cy + (R + 18) * Math.sin(a);
      labels += '<text x="' + lx.toFixed(1) + '" y="' + (ly + 3).toFixed(1) + '" class="rlabel" text-anchor="middle">' + esc(items[i]) + "</text>";
    }
    if (vals2) out += poly(vals2, "rshape want");
    return out + poly(vals, "rshape") + labels;
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
  function compList(s) {
    var a = listData(s.id);
    var hint = s.hint ? '<p class="hint">' + esc(s.hint) + "</p>" : "";
    var rowInput = function (i, label, ph) {
      return '<label class="listrow">' + (label ? "<span>" + esc(label) + "</span>" : "") +
        '<input type="text" placeholder="' + esc(ph || "") + '" value="' + esc(a[i] || "") +
        '" oninput="setListItem(\'' + s.id + "'," + i + ',this.value)"></label>';
    };
    var rows = "";
    if (s.items) {
      rows = s.items.map(function (it, i) { return rowInput(i, it.label, it.placeholder); }).join("");
      return hint + '<div class="listbox">' + rows + "</div>";
    }
    var n = Math.max(s.rows || 2, a.length);
    for (var i = 0; i < n; i++) rows += rowInput(i, "", s.placeholder);
    var add = s.addable ? '<div class="rowbtn"><button class="btn ghost addrow" onclick="addListRow(\'' + s.id + '\')">+ 칸 추가</button></div>' : "";
    return hint + '<div class="listbox">' + rows + "</div>" + add;
  }
  function compChoices(s) {
    var c = choice(s.id);
    var picked = c.picked || [];
    var hint = s.hint ? '<p class="hint">' + esc(s.hint) + "</p>" : "";
    var mx = s.max || 0;
    var chip = function (o, on) {
      return '<button class="chip' + (on ? " on" : "") + '" onclick="toggleChoice(\'' + s.id + "','" + esc(o).replace(/'/g, "") + "',this," + (s.multi ? "true" : "false") + "," + mx + ')">' + esc(o) + "</button>";
    };
    var chips = s.options.map(function (o) { return chip(o, picked.indexOf(o) >= 0); }).join("");
    var customChips = picked.filter(function (p) { return s.options.indexOf(p) < 0; })
      .map(function (p) { return chip(p, true); }).join("");
    var counter = mx ? '<p class="hint cnt' + (picked.length === mx ? " done" : "") + '"><b><span id="' + s.id + '_cnt">' + picked.length + " / " + mx + "</span></b> 선택</p>" : "";
    var other = s.allowOther
      ? '<input type="text" class="other" placeholder="직접 쓰기 후 Enter ↵" onkeydown="if(event.key===\'Enter\'){event.preventDefault();addOther(\'' + s.id + '\',this,' + (s.multi ? "true" : "false") + "," + mx + ');}">'
      : "";
    return hint + counter + '<div class="chips">' + chips + customChips + "</div>" + other;
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
    var cap = c.stage === 1 ? s.pick1 : s.pick2;
    var cntTxt = cap ? (sel.length + " / " + cap) : (sel.length + "개 선택");
    // 카운터 표기는 cardToggle과 동일 포맷 유지
    var counter = '<p class="hint' + (cap && sel.length === cap ? " done" : "") + '">' + esc(hintTxt) + ' · <b><span id="cardCount">' + esc(cntTxt) + "</span></b></p>";
    var gate = c.stage === 1 && s.pick1 && sel.length !== s.pick1 ? " disabled" : "";
    var nav = c.stage === 1
      ? '<div class="rowbtn"><button class="btn" id="cardNext"' + gate + ' onclick="cardStage(\'' + s.id + '\',2)">다음 단계 →</button></div>'
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
  function compAssess(s) {
    var vals = sl(s.id);
    var hint = s.hint ? '<p class="hint">' + esc(s.hint) + "</p>" : "";
    var scale = s.scale || ["전혀", "조금", "보통", "꽤", "많이"];
    var rows = s.areas.map(function (a) {
      var cur = vals[a.label];
      var chips = scale.map(function (lbl, idx) {
        var score = (idx + 1) * 2;
        var on = (cur === score) ? " on" : "";
        return '<button class="chip' + on + '" onclick="setAssess(\'' + s.id + "','" + esc(a.label).replace(/'/g, "") + "'," + score + ',this)">' + esc(lbl) + "</button>";
      }).join("");
      return '<div class="assessrow"><p class="alabel"><b>' + esc(a.label) + "</b> · " + esc(a.q) + '</p><div class="chips">' + chips + "</div></div>";
    }).join("");
    if (s.noRadar) return hint + '<div class="assess">' + rows + "</div>";
    var items = s.areas.map(function (a) { return a.label; });
    var svg = '<svg class="radar" id="radar" viewBox="0 0 220 220">' + radarInner(items, vals) + "</svg>";
    return hint + '<div class="assess">' + rows + "</div>" + svg;
  }
  /* ---------- BIG5 (성격 5요인) ---------- */
  function big5Data(id) { if (!A[id]) A[id] = { raw: "", domains: {}, facets: {} }; return A[id]; }
  function b5LevelTok(seg) {
    if (/높/.test(seg)) return "high";
    if (/낮/.test(seg)) return "low";
    if (/보통|중간/.test(seg)) return "neutral";
    return "";
  }
  function b5ScoreLevel(sc) { return sc >= 84 ? "high" : (sc <= 60 ? "low" : "neutral"); }
  function parseBig5(text, domains) {
    // facet 슬롯(도메인×6, 결과지 출력 순서)
    var slots = [];
    domains.forEach(function (d) { d.facets.forEach(function (f) { slots.push({ domain: d.key, name: f }); }); });
    // "점수: N (high/low/neutral)" 순서대로 추출
    var re = /점수\s*:\s*(\d+)\s*\((high|low|neutral)\)/g, m, scores = [];
    while ((m = re.exec(text)) !== null) scores.push({ score: +m[1], level: m[2] });
    var facets = {}, agg = {};
    domains.forEach(function (d) { agg[d.key] = 0; });
    var n = Math.min(scores.length, slots.length);
    for (var i = 0; i < n; i++) {
      facets[slots[i].name] = { score: scores[i].score, level: scores[i].level };
      agg[slots[i].domain] += scores[i].score;
    }
    // 도메인 레벨: "당신의 … {도메인} … 점수는 높아/낮아" 문장에서 추출 (실패 시 점수 근사)
    var domOut = {};
    domains.forEach(function (d) {
      var kw = (d.key === "개방성") ? "개방성" : d.key;
      var dre = new RegExp("당신의[^\\n]*?" + kw + "[^\\n]{0,40}");
      var mm = dre.exec(text);
      var lvl = mm ? b5LevelTok(mm[0]) : "";
      domOut[d.key] = { score: agg[d.key], level: lvl || b5ScoreLevel(agg[d.key]) };
    });
    return { domains: domOut, facets: facets };
  }
  window.setBig5 = function (id) {
    var ta = document.getElementById(id + "_raw");
    if (!ta) return;
    var text = ta.value || "";
    var doms = (CUR.step && CUR.step.domains) ? CUR.step.domains : [];
    var parsed = parseBig5(text, doms);
    A[id] = { raw: text, domains: parsed.domains, facets: parsed.facets };
    save();
    renderStep();
  };
  window.clearBig5 = function (id) { A[id] = { raw: "", domains: {}, facets: {} }; save(); renderStep(); };
  var B5_LVL_KO = { high: "높음", low: "낮음", neutral: "중간" };
  function compBig5(s) {
    var d = big5Data(s.id);
    var hasResult = d.domains && Object.keys(d.domains).length;
    var out = (s.intro ? '<p class="hint">' + esc(s.intro) + "</p>" : "") +
      '<div class="rowbtn"><a class="btn big" href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.linkLabel || "검사하러 가기") + " ↗</a></div>" +
      '<label class="rfield"><span>검사 결과 페이지 전체를 복사해 붙여넣기</span>' +
      '<textarea id="' + s.id + '_raw" rows="6" placeholder="결과지 전체(영역·세부 항목·점수)를 그대로 붙여넣어요.">' + esc(d.raw || "") + "</textarea></label>" +
      '<div class="rowbtn"><button class="btn" onclick="setBig5(\'' + s.id + '\')">분석하기</button>' +
      (hasResult ? ' <button class="btn ghost" onclick="clearBig5(\'' + s.id + '\')">지우기</button>' : "") + "</div>";
    if (!hasResult) return out;
    var items = s.domains.map(function (x) { return x.key; });
    var vals = {};
    items.forEach(function (k) { vals[k] = d.domains[k] ? d.domains[k].score : 0; });
    out += '<svg class="radar" id="radar" viewBox="0 0 220 220">' + radarInner(items, vals, null, 120) + "</svg>";
    out += '<div class="big5cards">' + s.domains.map(function (x) {
      var dd = d.domains[x.key] || {};
      return '<div class="big5card lv-' + (dd.level || "") + '"><b>' + esc(x.key) + '</b><span class="b5lv">' + esc(B5_LVL_KO[dd.level] || "") + '</span><span class="b5sc">' + (dd.score || 0) + "/120</span></div>";
    }).join("") + "</div>";
    var rows = s.domains.map(function (x) {
      var fr = x.facets.map(function (f) {
        var ff = d.facets[f] || {};
        return '<tr><td>' + esc(f) + "</td><td>" + (ff.score != null ? ff.score : "") + "</td><td>" + esc(B5_LVL_KO[ff.level] || "") + "</td></tr>";
      }).join("");
      return '<tr class="b5dom"><td colspan="3"><b>' + esc(x.key) + "</b></td></tr>" + fr;
    }).join("");
    out += '<details class="big5facets"><summary>세부 항목 30개 자세히 보기</summary>' +
      '<table class="b5tbl"><thead><tr><th>항목</th><th>점수</th><th>수준</th></tr></thead><tbody>' + rows + "</tbody></table></details>";
    return out;
  }
  function selOf(id) {
    var v = A[id]; if (!v) return [];
    if (v.l2 !== undefined || v.l1 !== undefined) return (v.l2 && v.l2.length) ? v.l2 : (v.l1 || []);
    if (v.picked !== undefined) return v.picked || [];
    return [];
  }
  function cmpLine(mineId, otherId) {
    var m = selOf(mineId), o = selOf(otherId);
    if (!m.length || !o.length) return "";
    var both = m.filter(function (w) { return o.indexOf(w) >= 0; });
    var om = m.filter(function (w) { return o.indexOf(w) < 0; });
    var oo = o.filter(function (w) { return m.indexOf(w) < 0; });
    return "겹침 — " + (both.join(", ") || "—") + " · 나만 — " + (om.join(", ") || "—") + " · 친구만 — " + (oo.join(", ") || "—");
  }
  function compCompare(s) {
    var mine = selOf(s.mineFrom), other = selOf(s.otherFrom);
    var hint = s.hint ? '<p class="hint">' + esc(s.hint) + "</p>" : "";
    if (!mine.length || !other.length) {
      return hint + '<p class="hint">위 단계에서 ' + esc(s.mineLabel || "내") + ' · ' + esc(s.otherLabel || "상대") + " 강점을 먼저 골라주세요.</p>";
    }
    var both = mine.filter(function (w) { return other.indexOf(w) >= 0; });
    var onlyMine = mine.filter(function (w) { return other.indexOf(w) < 0; });
    var onlyOther = other.filter(function (w) { return mine.indexOf(w) < 0; });
    var chips = function (arr) {
      return arr.length ? '<div class="chips ro">' + arr.map(function (w) { return '<span class="chip on">' + esc(w) + "</span>"; }).join("") + "</div>" : '<p class="hint">없음</p>';
    };
    var group = function (title, sub, arr) {
      return '<div class="cmpgroup"><h4>' + esc(title) + ' <span>' + arr.length + "</span></h4>" + '<p class="hint">' + esc(sub) + "</p>" + chips(arr) + "</div>";
    };
    return hint + '<div class="compare">' +
      group("✓ 겹친 강점", "나도 골랐고, " + (s.otherLabel || "친구") + "도 본 — 확인된 강점", both) +
      group("● 나만 고른 강점", "내가 아는 나의 강점(아직 남에겐 덜 보이는)", onlyMine) +
      group("○ " + (s.otherLabel || "친구") + "만 본 강점", "내가 몰랐던, 남이 본 강점(blind spot)", onlyOther) +
      "</div>";
  }
  function compShadow(s) {
    var picks = selOf(s.strengthsFrom);
    var hint = s.hint ? '<p class="hint">' + esc(s.hint) + "</p>" : "";
    if (!picks.length) return hint + '<p class="hint">' + esc(s.emptyHint || "먼저 강점을 골라주세요.") + "</p>";
    var sel = choice(s.id).picked || [];
    var mx = s.max || 0;
    var counter = mx ? '<p class="hint cnt' + (sel.length === mx ? " done" : "") + '"><b><span id="' + s.id + '_cnt">' + sel.length + " / " + mx + "</span></b> 선택</p>" : "";
    var rows = picks.map(function (w) {
      var sh = (typeof SHADOW_MAP !== "undefined" && SHADOW_MAP[w]) || [];
      if (!sh.length) return "";
      var chips = sh.map(function (x) {
        var on = sel.indexOf(x) >= 0 ? " on" : "";
        return '<button class="chip' + on + '" onclick="toggleChoice(\'' + s.id + "','" + esc(x).replace(/'/g, "") + "',this,true," + mx + ')">' + esc(x) + "</button>";
      }).join("");
      return '<div class="shadowrow"><span class="slabel">' + esc(w) + ' →</span><div class="chips">' + chips + "</div></div>";
    }).join("");
    return hint + counter + '<div class="shadowbox">' + rows + "</div>";
  }
  function pstr(id) { var v = A[id]; if (!v || typeof v !== "object" || Array.isArray(v)) A[id] = {}; return A[id]; }
  window.setStrengthText = function (id, key, v) { pstr(id)[key] = v; save(); };
  window.toggleStrengthChip = function (id, key, label, el, max) {
    var o = pstr(id), c = o[key];
    if (!c || !Array.isArray(c.picked)) { c = { picked: [], other: "" }; o[key] = c; }
    var i = c.picked.indexOf(label);
    if (i >= 0) c.picked.splice(i, 1);
    else { if (max && c.picked.length >= max) return; c.picked.push(label); }
    el.classList.toggle("on", c.picked.indexOf(label) >= 0); save();
  };
  window.addStrengthOther = function (id, key, el) {
    var val = (el.value || "").trim(); if (!val) return;
    var o = pstr(id), c = o[key];
    if (!c || !Array.isArray(c.picked)) { c = { picked: [], other: "" }; o[key] = c; }
    if (c.picked.indexOf(val) < 0) c.picked.push(val); save(); el.value = ""; renderStep();
  };
  function compByStrength(s) {
    var picks = selOf(s.strengthsFrom);
    var hint = s.hint ? '<p class="hint">' + esc(s.hint) + "</p>" : "";
    if (!picks.length) return hint + '<p class="hint">' + esc(s.emptyHint || "먼저 강점을 골라주세요.") + "</p>";
    var o = pstr(s.id), mx = s.max || 0;
    var rows = picks.map(function (w) {
      var key = esc(w).replace(/'/g, "");
      if (s.mode === "text") {
        var val = (typeof o[w] === "string") ? o[w] : "";
        return '<div class="bsrow"><span class="slabel">' + esc(w) + "</span>" +
          '<input type="text" placeholder="' + esc(s.placeholder || "") + '" value="' + esc(val) +
          '" oninput="setStrengthText(\'' + s.id + "','" + key + '\',this.value)"></div>';
      }
      var c = (o[w] && Array.isArray(o[w].picked)) ? o[w] : { picked: [], other: "" };
      var chip = function (opt, on) {
        return '<button class="chip' + (on ? " on" : "") + '" onclick="toggleStrengthChip(\'' + s.id + "','" + key + "','" + esc(opt).replace(/'/g, "") + "',this," + mx + ')">' + esc(opt) + "</button>";
      };
      var chips = (s.options || []).map(function (opt) { return chip(opt, c.picked.indexOf(opt) >= 0); }).join("");
      var custom = c.picked.filter(function (p) { return (s.options || []).indexOf(p) < 0; }).map(function (p) { return chip(p, true); }).join("");
      var other = s.allowOther ? '<input type="text" class="other" placeholder="직접 쓰기 후 Enter ↵" onkeydown="if(event.key===\'Enter\'){event.preventDefault();addStrengthOther(\'' + s.id + "','" + key + '\',this);}">' : "";
      return '<div class="bsrow"><span class="slabel">' + esc(w) + ' →</span><div class="chips">' + chips + custom + "</div>" + other + "</div>";
    }).join("");
    return hint + '<div class="shadowbox">' + rows + "</div>";
  }
  function compGap(s) {
    var now = sl(s.nowFrom) || {}, want = sl(s.wantFrom) || {};
    var hint = s.hint ? '<p class="hint">' + esc(s.hint) + "</p>" : "";
    var wk = getWeek(CUR.weekId) || {};
    var src = (wk.steps || []).filter(function (x) { return x.id === s.nowFrom; })[0] || {};
    var items = (src.areas || []).map(function (a) { return a.label; });
    if (!Object.keys(now).length || !Object.keys(want).length || !items.length)
      return hint + '<p class="hint">' + esc(s.emptyHint || "") + "</p>";
    var gaps = items.map(function (lb) {
      var nv = now[lb] != null ? now[lb] : 5, wv = want[lb] != null ? want[lb] : 5;
      return { label: lb, gap: wv - nv, want: wv };
    }).filter(function (g) { return g.gap > 0; })
      .sort(function (a, b) { return (b.gap - a.gap) || (b.want - a.want); });
    var top = gaps.slice(0, s.topN || 3).map(function (g) { return g.label; });
    var svg = '<svg class="radar" id="radar" viewBox="0 0 220 220">' + radarInner(items, now, want) + "</svg>";
    var legend = '<p class="gaplegend"><span class="gk now">지금</span> <span class="gk want">바람</span></p>';
    var msg = top.length
      ? '<p class="gapmsg">가장 바라지만 가장 빈 곳: <b>' + top.map(function (x) { return esc(x); }).join(", ") + "</b></p>"
      : '<p class="gapmsg">지금과 바람이 대체로 가까워요.</p>';
    return hint + svg + legend + msg;
  }
  function gapTop(nowId, wantId, n) {
    var now = A[nowId] || {}, want = A[wantId] || {};
    var src = (getWeek("w4b").steps.filter(function (x) { return x.id === nowId; })[0] || {});
    var areas = src.areas || [];
    var g = areas.map(function (a) {
      var nv = now[a.label], wv = want[a.label];
      return (nv != null && wv != null) ? { l: a.label, d: wv - nv } : null;
    }).filter(Boolean).filter(function (x) { return x.d > 0; }).sort(function (a, b) { return b.d - a.d; });
    return g.slice(0, n).map(function (x) { return x.l; }).join(", ");
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
  function fmtAny(id) {
    var v = A[id];
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (v.domains && typeof v.domains === "object" && Object.keys(v.domains).length) {
      var dl = Object.keys(v.domains).map(function (k) { var x = v.domains[k]; return k + " " + (B5_LVL_KO[x.level] || "") + "(" + x.score + "/120)"; }).join(", ");
      var ex = [];
      if (v.facets) Object.keys(v.facets).forEach(function (f) { var x = v.facets[f]; if (x.level === "high" || x.level === "low") ex.push(f + " " + x.score + "(" + (B5_LVL_KO[x.level] || "") + ")"); });
      return dl + (ex.length ? " · 두드러진 세부 항목: " + ex.join(", ") : "");
    }
    if (Array.isArray(v)) return v.filter(function (x) { return x && String(x).trim(); }).join(", ");
    if (v.picked !== undefined) return fmtChoices(id);
    if (v.like !== undefined) {
      var ip = [];
      if (v.like) ip.push("좋아하는 것: " + v.like);
      if (v.good) ip.push("잘하는 것: " + v.good);
      if (v.need) ip.push("세상이 필요로 하는 것: " + v.need);
      if (v.paid) ip.push("보상받을 수 있는 것: " + v.paid);
      if (v.center) ip.push("겹치는 곳: " + v.center);
      return ip.join(" / ");
    }
    if (v.order !== undefined) {
      var ord = (v.order || []).filter(function (x) { return x && String(x).trim(); });
      var ps = ord.map(function (x, i) { return (i + 1) + ". " + x; }).join(" / ");
      if (v.why && v.why.trim()) ps += (ps ? " " : "") + "(1순위 이유: " + v.why + ")";
      return ps;
    }
    if (v.plans !== undefined) {
      return v.plans.map(function (p, i) { return (p.t || p.b) ? ((i + 1) + ") " + (p.t || "") + (p.b ? " — " + p.b : "") + (p.e ? " (설렘 " + p.e + "/5)" : "")) : ""; }).filter(Boolean).join("\n");
    }
    if (v.define !== undefined) {
      return [v.define && "최악: " + v.define, v.prevent && "예방: " + v.prevent, v.repair && "복구: " + v.repair].filter(Boolean).join("\n");
    }
    if (v.l2 !== undefined) { var pick = (v.l2 && v.l2.length) ? v.l2 : (v.l1 || []); return pick.join(", "); }
    if (v.center !== undefined) return [v.center].concat(v.cells || []).filter(function (x) { return x; }).join(" / ");
    if (v.v !== undefined) return v.v.filter(function (x) { return x; }).join(", ");
    if (v.mine !== undefined) return v.mine || "";
    if (typeof v === "object") {
      var bk = Object.keys(v);
      if (bk.length && bk.every(function (k) { var x = v[k]; return typeof x === "string" || (x && Array.isArray(x.picked)); })) {
        return bk.map(function (k) { var x = v[k]; var t = (typeof x === "string") ? x : (x.picked || []).join(", "); return (t && t.trim()) ? (k + ": " + t) : ""; }).filter(Boolean).join(" / ");
      }
      return bk.map(function (k) { return k + " " + v[k]; }).join(", ");
    }
    return "";
  }
  function topAssess(id, n) {
    var v = A[id]; if (!v || typeof v !== "object") return "";
    var arr = Object.keys(v).map(function (k) { return [k, v[k]]; })
      .filter(function (x) { return x[1] != null; })
      .sort(function (a, b) { return b[1] - a[1]; });
    if (!arr.length) return "";
    return arr.slice(0, n || 2).map(function (x) { return x[0]; }).join(", ");
  }
  function buildPrompt(s) {
    var lines = s.collect.map(function (c) { var val = fmtAny(c.from); return "- " + c.label + ": " + (val && val.trim() ? val : "(아직 안 씀)"); });
    return s.system + "\n\n[내 기록]\n" + lines.join("\n");
  }
  function compPromptForge(s) {
    var intro = s.intro ? '<p class="hint">' + esc(s.intro) + "</p>" : "";
    var out = intro +
      '<textarea class="promptbox" rows="10" readonly>' + esc(buildPrompt(s)) + "</textarea>" +
      '<div class="rowbtn"><button class="btn" onclick="copyPrompt(this)">프롬프트 복사</button> ' +
      '<a class="btn ghost" href="https://claude.ai/new" target="_blank" rel="noopener">Claude 열기</a> ' +
      '<a class="btn ghost" href="https://chatgpt.com" target="_blank" rel="noopener">ChatGPT 열기</a></div>';
    if (s.sections && s.sections.length) {
      var rv = reframe(s.reframeId);
      out += '<div class="forgeline"></div>' +
        (s.reframeHint ? '<p class="hint">' + esc(s.reframeHint) + "</p>" : "") +
        '<p class="hint">AI 답을 항목(①②③…)별로 나눠 붙이고, 각 항목 아래에 떠오른 생각을 적어요.</p>';
      out += s.sections.map(function (sec, i) {
        return '<div class="forgesec"><h4 class="secq">' + esc(sec) + "</h4>" +
          '<label class="rfield"><span>AI 답에서 이 항목 부분 붙여넣기</span><textarea rows="3" oninput="setReframe(\'' + s.reframeId + '\',\'p' + i + '\',this.value)">' + esc(rv["p" + i] || "") + "</textarea></label>" +
          '<label class="rfield"><span>여기에 대한 내 생각</span><textarea rows="2" oninput="setReframe(\'' + s.reframeId + '\',\'t' + i + '\',this.value)">' + esc(rv["t" + i] || "") + "</textarea></label></div>";
      }).join("");
      out += '<label class="rfield"><span>전체적으로 — 내 언어로 한 줄 (책에 실려요)</span><textarea rows="3" oninput="setReframe(\'' + s.reframeId + '\',\'mine\',this.value)">' + esc(rv.mine || "") + "</textarea></label>";
    } else if (s.reframeId) {
      var rv = reframe(s.reframeId);
      out += '<div class="forgeline"></div>' +
        '<label class="rfield"><span>AI 답을 여기에 붙여넣기</span><textarea rows="6" placeholder="복사한 프롬프트를 AI에 넣고, 받은 답을 여기 붙여두면 아래에서 곱씹기 편해요." oninput="setReframe(\'' + s.reframeId + '\',\'answer\',this.value)">' + esc(rv.answer || "") + "</textarea></label>" +
        compReframe({ id: s.reframeId, hint: s.reframeHint });
    }
    return out;
  }
  function reframe(id) { if (!A[id]) A[id] = { resonate: "", doubt: "", mine: "" }; return A[id]; }
  window.setReframe = function (id, k, v) { reframe(id)[k] = v; save(); };
  window.copyPrompt = function (btn) {
    var ta = btn.parentNode.parentNode.querySelector(".promptbox");
    if (!ta) return;
    var orig = btn.textContent;
    var done = function () { btn.textContent = "복사됐어요 ✓"; setTimeout(function () { btn.textContent = orig; }, 1500); };
    try { ta.select(); } catch (e) {}
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(ta.value).then(done, done); }
    else { try { document.execCommand("copy"); } catch (e) {} done(); }
  };
  function compReframe(s) {
    var v = A[s.id] || {};
    var hint = s.hint ? '<p class="hint">' + esc(s.hint) + "</p>" : "";
    return hint +
      '<label class="rfield"><span>AI 답에서 가장 와닿은 것</span><textarea rows="3" oninput="setReframe(\'' + s.id + '\',\'resonate\',this.value)">' + esc(v.resonate || "") + "</textarea></label>" +
      '<label class="rfield"><span>갸우뚱하거나 동의 안 되는 것</span><textarea rows="2" oninput="setReframe(\'' + s.id + '\',\'doubt\',this.value)">' + esc(v.doubt || "") + "</textarea></label>" +
      '<label class="rfield"><span>그래서, 내 언어로 다시 쓴 요약</span><textarea rows="4" oninput="setReframe(\'' + s.id + '\',\'mine\',this.value)">' + esc(v.mine || "") + "</textarea></label>";
  }
  function digestData(id) { if (!A[id]) A[id] = { mine: "" }; return A[id]; }
  window.setDigest = function (id, k, v) { digestData(id)[k] = v; save(); };
  function compDigest(s) {
    var d = digestData(s.id);
    var head = (s.intro ? '<p class="hint">' + esc(s.intro) + "</p>" : "") + (s.hint ? '<p class="hint">' + esc(s.hint) + "</p>" : "");
    var cards = (s.sections || []).map(function (sec) {
      return '<label class="rfield"><span>' + esc(sec.label) + (sec.optional ? " · 원하면" : "") + "</span>" +
        (sec.hint ? '<small class="subhint">' + esc(sec.hint) + "</small>" : "") +
        '<textarea rows="2" oninput="setDigest(\'' + s.id + "','" + sec.key + '\',this.value)">' + esc(d[sec.key] || "") + "</textarea></label>";
    }).join("");
    var o = s.overall || {};
    var overall = '<div class="digestall">' + (o.intro ? '<p class="hint">' + esc(o.intro) + "</p>" : "") +
      '<label class="rfield"><span>' + esc(o.resonateLabel || "가장 와닿은 것") + '</span><textarea rows="2" oninput="setDigest(\'' + s.id + '\',\'resonate\',this.value)">' + esc(d.resonate || "") + "</textarea></label>" +
      '<label class="rfield"><span>' + esc(o.doubtLabel || "갸우뚱하거나 동의 안 되는 것") + '</span><textarea rows="2" oninput="setDigest(\'' + s.id + '\',\'doubt\',this.value)">' + esc(d.doubt || "") + "</textarea></label>" +
      '<label class="rfield"><span>' + esc(o.mineLabel || "내 언어로 다시 쓴 한 문장") + "</span>" +
        (o.mineHint ? '<small class="subhint">' + esc(o.mineHint) + "</small>" : "") +
        '<textarea rows="3" oninput="setDigest(\'' + s.id + '\',\'mine\',this.value)">' + esc(d.mine || "") + "</textarea></label></div>";
    return head + cards + overall;
  }
  function journey(id) { if (!A[id]) A[id] = { v: ["", "", "", "", ""], where: "", surprise: "" }; return A[id]; }
  window.setJourneyVal = function (id, i, val) { journey(id).v[i] = val; save(); };
  window.setJourneyField = function (id, k, val) { journey(id)[k] = val; save(); };
  function compJourney(s) {
    var j = journey(s.id);
    var vals = j.v.map(function (val, i) {
      return '<input type="text" class="jval" placeholder="가치 ' + (i + 1) + '" value="' + esc(val) + '" oninput="setJourneyVal(\'' + s.id + "'," + i + ',this.value)">';
    }).join("");
    return (s.intro ? '<p class="hint">' + esc(s.intro) + "</p>" : "") +
      '<div class="rowbtn"><a class="btn big journeylink" href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.linkLabel || "다녀오기") + " ↗</a></div>" +
      (s.bring ? '<p class="hint bring">' + esc(s.bring) + "</p>" : "") +
      '<div class="jvals">' + vals + "</div>" +
      '<label class="rfield"><span>' + esc(s.where || "이 가치들이 내 삶 어디에서 보이나요?") + '</span><textarea rows="3" oninput="setJourneyField(\'' + s.id + '\',\'where\',this.value)">' + esc(j.where || "") + "</textarea></label>" +
      '<label class="rfield"><span>' + esc(s.surprise || "의외였던 가치 하나, 왜 의외였나요?") + '</span><textarea rows="2" oninput="setJourneyField(\'' + s.id + '\',\'surprise\',this.value)">' + esc(j.surprise || "") + "</textarea></label>";
  }
  function commitData() { if (!A.commit) A.commit = { what: "", why: "" }; return A.commit; }
  window.setCommitField = function (k, v) { commitData()[k] = v; save(); };
  function compCommit(s) {
    var c = commitData();
    var hint = s.hint ? '<p class="hint">' + esc(s.hint) + "</p>" : "";
    return hint +
      '<input type="text" class="commitwhat" placeholder="예: 사진 정리" value="' + esc(c.what || "") + '" oninput="setCommitField(\'what\',this.value)">' +
      '<label class="rfield"><span>왜 이걸 해내고 싶나요? (선택)</span><textarea rows="2" oninput="setCommitField(\'why\',this.value)">' + esc(c.why || "") + "</textarea></label>";
  }
  function progData(id) { if (!A[id]) A[id] = { done: false, note: "" }; return A[id]; }
  window.setProgDone = function (id, v) { progData(id).done = v; save(); };
  window.setProgNote = function (id, v) { progData(id).note = v; save(); };
  function compProgress(s) {
    var p = progData(s.id);
    var what = (A.commit && A.commit.what) ? esc(A.commit.what) : "(1주차에서 정한 사소한 일)";
    return '<p class="hint">내가 정한 사소한 일: <b>' + what + "</b></p>" +
      '<label class="checkrow"><input type="checkbox" ' + (p.done ? "checked" : "") + ' onchange="setProgDone(\'' + s.id + '\',this.checked)"> 이번 주에 (조금이라도) 했어요</label>' +
      '<label class="rfield"><span>한 줄 기록 (선택)</span><input type="text" value="' + esc(p.note || "") + '" oninput="setProgNote(\'' + s.id + '\',this.value)"></label>';
  }
  window.setManifest = function (id, v) { A[id] = v; save(); };
  function compManifest(s) {
    var v = A[s.id] || "";
    var prompt = s.prompt ? '<p class="hint">' + esc(s.prompt) + "</p>" : "";
    return '<div class="manifestbox">' + prompt +
      '<textarea rows="' + (s.rows || 4) + '" placeholder="' + esc(s.placeholder || "") + '" oninput="setManifest(\'' + s.id + '\',this.value)">' + esc(v) + "</textarea></div>";
  }

  /* 네 가지가 만나는 곳 */
  function ikigaiData(id) { if (!A[id]) A[id] = { like: "", good: "", need: "", paid: "", center: "" }; return A[id]; }
  window.setIkigai = function (id, k, v) { ikigaiData(id)[k] = v; save(); };
  function compIkigai(s) {
    var g = ikigaiData(s.id);
    var hint = s.hint ? '<p class="hint">' + esc(s.hint) + "</p>" : "";
    var box = function (k, label) {
      return '<label class="ikcell ik-' + k + '"><span>' + esc(label) + "</span>" +
        '<textarea rows="3" oninput="setIkigai(\'' + s.id + '\',\'' + k + '\',this.value)">' + esc(g[k]) + "</textarea></label>";
    };
    return hint + '<div class="ikigai">' +
      box("like", "내가 좋아하는 것") + box("good", "내가 잘하는 것") +
      box("need", "세상이 필요로 하는 것") + box("paid", "보상받을 수 있는 것") + "</div>" +
      '<label class="rfield"><span>네 가지가 겹치는 한가운데엔 무엇이 떠오르나요?</span>' +
      '<textarea rows="2" oninput="setIkigai(\'' + s.id + '\',\'center\',this.value)">' + esc(g.center) + "</textarea></label>";
  }

  /* 가치 우선순위 */
  function priorityData(id) {
    if (!A[id]) A[id] = { order: [], why: "" };
    var p = A[id];
    if (!p.order || !p.order.length) {
      var src = (A.w1_journey && A.w1_journey.v) ? A.w1_journey.v.filter(function (x) { return x && x.trim(); }) : [];
      p.order = src.slice();
    }
    return p;
  }
  window.setPriorityWhy = function (id, v) { if (!A[id]) A[id] = { order: [], why: "" }; A[id].why = v; save(); };
  window.setPriorityItem = function (id, i, v) { if (!A[id]) A[id] = { order: [], why: "" }; A[id].order[i] = v; save(); };
  window.movePriority = function (id, i, dir) {
    var p = A[id]; if (!p || !p.order) return;
    var j = i + dir; if (j < 0 || j >= p.order.length) return;
    var t = p.order[i]; p.order[i] = p.order[j]; p.order[j] = t;
    save(); renderStep();
  };
  function compPriority(s) {
    var p = priorityData(s.id);
    var hint = s.hint ? '<p class="hint">' + esc(s.hint) + "</p>" : "";
    if (!p.order.length) {
      var blanks = "";
      for (var k = 0; k < 5; k++) {
        blanks += '<input type="text" class="jval" placeholder="가치 ' + (k + 1) + '" value="' + esc(p.order[k] || "") + '" oninput="setPriorityItem(\'' + s.id + "'," + k + ',this.value)">';
      }
      return hint + '<p class="hint">아직 가치 여정 결과가 없네요. 지금 중요한 가치를 직접 적어도 돼요.</p><div class="jvals">' + blanks + "</div>";
    }
    var rows = p.order.map(function (val, i) {
      var up = i === 0 ? '<span class="prbtn ghost">·</span>' : '<button class="prbtn" onclick="movePriority(\'' + s.id + "'," + i + ',-1)">↑</button>';
      var down = i === p.order.length - 1 ? '<span class="prbtn ghost">·</span>' : '<button class="prbtn" onclick="movePriority(\'' + s.id + "'," + i + ',1)">↓</button>';
      return '<div class="prow"><span class="prank">' + (i + 1) + '</span><span class="pval">' + esc(val) + "</span>" +
        '<span class="prctl">' + up + down + "</span></div>";
    }).join("");
    return hint + '<div class="priority">' + rows + "</div>" +
      '<label class="rfield"><span>1순위가 왜 먼저인가요?</span><textarea rows="2" oninput="setPriorityWhy(\'' + s.id + '\',this.value)">' + esc(p.why || "") + "</textarea></label>";
  }

  /* 5년 3시나리오 */
  function odysseyData(id) { if (!A[id]) A[id] = { plans: [{ t: "", b: "", e: 0 }, { t: "", b: "", e: 0 }, { t: "", b: "", e: 0 }] }; return A[id]; }
  window.setOdyssey = function (id, i, k, v) { var p = odysseyData(id).plans[i]; p[k] = (k === "e" ? +v : v); save(); if (k === "e") { var el = document.getElementById(id + "_e" + i); if (el) el.textContent = v; } };
  function compOdyssey(s) {
    var d = odysseyData(s.id);
    var hint = s.hint ? '<p class="hint">' + esc(s.hint) + "</p>" : "";
    var labels = ["지금 길이 잘 풀린 5년", "지금이 막히면 가는 플랜 B", "돈·남 시선 신경 안 써도 된다면"];
    var blocks = d.plans.map(function (p, i) {
      return '<div class="odyblock"><div class="odylabel">' + esc(labels[i]) + "</div>" +
        '<input type="text" class="odyt" placeholder="한 줄 제목" value="' + esc(p.t || "") + '" oninput="setOdyssey(\'' + s.id + "'," + i + ",'t',this.value)\">" +
        '<textarea class="odyb" rows="3" placeholder="어떤 하루하루일까요?" oninput="setOdyssey(\'' + s.id + "'," + i + ",'b',this.value)\">" + esc(p.b || "") + "</textarea>" +
        '<div class="odyexcite"><span>설렘</span><input type="range" min="0" max="5" value="' + (p.e || 0) + '" oninput="setOdyssey(\'' + s.id + "'," + i + ",'e',this.value)\"><span class=\"odyev\" id=\"" + s.id + "_e" + i + "\">" + (p.e || 0) + "</span></div></div>";
    }).join("");
    return hint + '<div class="odyssey">' + blocks + "</div>";
  }

  /* 두려움 설정 */
  function fearData(id) { if (!A[id]) A[id] = { define: "", prevent: "", repair: "" }; return A[id]; }
  window.setFear = function (id, k, v) { fearData(id)[k] = v; save(); };
  function compFearSetting(s) {
    var f = fearData(s.id);
    var hint = s.hint ? '<p class="hint">' + esc(s.hint) + "</p>" : "";
    var box = function (k, label, ph) {
      return '<label class="fearcell"><span>' + esc(label) + "</span>" +
        '<textarea rows="2" placeholder="' + esc(ph) + '" oninput="setFear(\'' + s.id + '\',\'' + k + '\',this.value)">' + esc(f[k] || "") + "</textarea></label>";
    };
    return hint + '<div class="fearset">' +
      box("define", "최악의 경우", "무슨 일이 벌어질까?") +
      box("prevent", "미리 막을 방법", "조금이라도 막으려면?") +
      box("repair", "그래도 벌어지면", "어떻게 되돌릴까?") + "</div>";
  }

  /* ---------- 화면 ---------- */
  function renderHome() {
    var admin = isAdmin(), pubN = publishedN();
    var cards = COURSE.weeks.map(function (w, i) {
      var pub = i < pubN;
      if (!pub && !admin) {
        return '<div class="wcard locked"><div class="wbadge">' + esc(w.badge) + "</div><h3>준비 중</h3><p>곧 열려요</p></div>";
      }
      var ins = answerableSteps(w), done = ins.filter(hasAns).length;
      var meta = done ? done + "/" + ins.length + " 채움" : "시작 전";
      var flag = admin ? '<span class="pubflag ' + (pub ? "on" : "off") + '">' + (pub ? "공개" : "비공개") + "</span>" : "";
      return '<a class="wcard" href="#' + w.id + '/0"><div class="wbadge">' + esc(w.badge) + flag + "</div>" +
        "<h3>" + esc(w.title) + "</h3><p>" + esc(w.chapter) + '</p><span class="wmeta">' + meta + "</span></a>";
    }).join("");
    var adminBar = admin
      ? '<div class="adminbar">🔧 관리자 모드 — 모든 주차를 봅니다. <b>친구 공개: ' + pubN + '주차까지</b>. 더 공개하려면 <code>publishedWeeks</code> 값을 올려 배포하세요. <button class="btn ghost" onclick="exitAdmin()">관리자 나가기</button></div>'
      : "";
    var locked = COURSE.locked.map(function (l) {
      return '<div class="wcard locked"><div class="wbadge">' + esc(l.badge) + "</div><h3>" + esc(l.title) + "</h3><p>" + esc(l.desc) + "</p></div>";
    }).join("");
    var promises = COURSE.promises.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
    document.getElementById("app").innerHTML =
      '<section class="home">' +
      '<div class="hero"><h1>' + esc(COURSE.title) + "</h1><p>" + esc(COURSE.subtitle) + "</p></div>" +
      adminBar +
      '<div class="promises"><ul>' + promises + "</ul></div>" +
      '<div class="wgrid">' + cards + locked + "</div>" +
      '<div class="rowbtn center"><a class="btn big" href="#book">내 책 미리보기 →</a></div>' +
      '<div class="backup">' +
      '<p class="backup-note">쓰는 즉시 자동 저장돼요. 폰을 바꾸거나 브라우저를 정리하기 전엔 한 번 백업을 받아두면 안전해요. (친구들은 각자 자기 기기에서 각자 받으면 돼요)</p>' +
      '<div class="rowbtn center"><button class="btn ghost" onclick="exportData()">내 기록 백업하기</button> ' +
      '<button class="btn ghost" onclick="document.getElementById(\'importFile\').click()">백업 불러오기</button></div>' +
      '<input type="file" id="importFile" accept="application/json,.json" style="display:none" onchange="importData(this)">' +
      "</div>" +
      '<div class="reset"><button onclick="resetAll()">처음부터 다시</button></div>' +
      "</section>";
    window.scrollTo(0, 0);
  }

  function renderStep() {
    var week = getWeek(CUR.weekId);
    if (!week) { location.hash = "#home"; return; }
    if (!weekVisible(week)) { location.hash = "#home"; return; }
    var list = stepsOf(week);
    if (CUR.idx < 0 || CUR.idx >= list.length) { location.hash = "#home"; return; }
    var s = list[CUR.idx]; CUR.step = s; CUR.stepsList = list;
    var body;
    switch (s.type) {
      case "intro": body = '<p class="introbody">' + nl2br(s.body) + "</p>"; break;
      case "text": body = compText(s); break;
      case "list": body = compList(s); break;
      case "choices": body = compChoices(s); break;
      case "cardFilter": body = compCard(s); break;
      case "mandala": body = compMandala(s); break;
      case "sliders": body = compSliders(s); break;
      case "assess": body = compAssess(s); break;
      case "big5": body = compBig5(s); break;
      case "compare": body = compCompare(s); break;
      case "shadow": body = compShadow(s); break;
      case "byStrength": body = compByStrength(s); break;
      case "gap": body = compGap(s); break;
      case "dailyLog": body = compLog(s); break;
      case "meetup": body = compMeetup(s.meetup); break;
      case "promptForge": body = compPromptForge(s); break;
      case "reframe": body = compReframe(s); break;
      case "digest": body = compDigest(s); break;
      case "journey": body = compJourney(s); break;
      case "commit": body = compCommit(s); break;
      case "progress": body = compProgress(s); break;
      case "manifest": body = compManifest(s); break;
      case "ikigai": body = compIkigai(s); break;
      case "priority": body = compPriority(s); break;
      case "odyssey": body = compOdyssey(s); break;
      case "fearSetting": body = compFearSetting(s); break;
      default: body = "";
    }
    var pct = Math.round((CUR.idx + 1) / list.length * 100);
    var prevHref = CUR.idx > 0 ? "#" + week.id + "/" + (CUR.idx - 1) : "#home";
    var isLast = CUR.idx === list.length - 1;
    var nextHref = isLast ? "#home" : "#" + week.id + "/" + (CUR.idx + 1);
    var nextLabel = isLast ? "이 주차 마치기 ✓" : "다음 →";
    var tocOpts = list.map(function (st, i) {
      var mark = (st.type !== "intro" && st.type !== "meetup" && !st.optional && hasAns(st)) ? "✓ " : "";
      var t = st.title || (st.type === "meetup" ? "함께" : "");
      return '<option value="' + i + '"' + (i === CUR.idx ? " selected" : "") + ">" + esc(mark + (i + 1) + ". " + t) + "</option>";
    }).join("");
    var toc = '<select class="toc" onchange="location.hash=\'#' + week.id + '/\'+this.value" aria-label="이 주차 목차">' + tocOpts + "</select>";
    document.getElementById("app").innerHTML =
      '<section class="step">' +
      '<div class="crumbs"><a href="#home">홈</a> · ' + esc(week.badge) + " · " + (CUR.idx + 1) + "/" + list.length + "</div>" +
      '<div class="tocwrap">' + toc + "</div>" +
      '<div class="pbar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="jtitle">' + esc(week.title) + "</div>" +
      "<h2>" + esc(s.title) + (s.optional ? ' <span class="opthint">· 원하면</span>' : "") + "</h2>" +
      '<div class="stepbody">' + body + "</div>" +
      '<div class="nav"><a class="btn ghost" href="' + prevHref + '">← 이전</a>' +
      '<a class="btn ghost navhome" href="#home">홈</a>' +
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
  var STK = {
    book: '<svg class="stk" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" fill="#cdd9ee"/><rect x="4" y="4" width="8" height="16" rx="2" fill="#b7c8e4"/><path d="M12 5v14" stroke="#fff" stroke-width="1.1"/></svg>',
    sprout: '<svg class="stk" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21v-8" stroke="#7faf6a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M12 15c-1-4-4-4-6-4 0 3 2 5 6 4z" fill="#a9d18e"/><path d="M12 13c1-4 4-4 6-4 0 3-2 5-6 4z" fill="#bcd9a0"/></svg>',
    star: '<svg class="stk" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.4 6.1 6.6.3-5.1 4.2 1.7 6.4L12 16.9 6.4 20.2l1.7-6.4L3 9.6l6.6-.3z" fill="#f3cd6b"/></svg>',
    cloud: '<svg class="stk" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17a4 4 0 0 1-.3-8A5 5 0 0 1 16 8a3.5 3.5 0 0 1 1 6.9z" fill="#dbe6f2"/></svg>',
    heart: '<svg class="stk" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-6.5-4.2-6.5-9A3.5 3.5 0 0 1 12 8.2 3.5 3.5 0 0 1 18.5 11c0 4.8-6.5 9-6.5 9z" fill="#efa8bf"/></svg>',
    sun: '<svg class="stk" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="#f5cf72"/><g stroke="#f5cf72" stroke-width="2" stroke-linecap="round"><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7"/></g></svg>',
    leaf: '<svg class="stk" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14z" fill="#bcd9a0"/><path d="M5 19C9 15 13 11 17 7" stroke="#8db870" stroke-width="1.1" fill="none"/></svg>',
    moon: '<svg class="stk" viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 13.5A6 6 0 0 1 10.5 7.5 6 6 0 1 0 16.5 13.5z" fill="#cdd9ee"/></svg>'
  };
  function chapHead(no, title, svg) {
    return '<div class="chead">' + (svg || "") +
      '<div class="chtitle">' + (no ? '<span class="chno">' + esc(no) + "</span>" : "") +
      "<h2>" + esc(title) + "</h2></div></div>";
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
  function progressSummary() {
    var ids = ["prog_w2", "prog_w3", "prog_w4", "prog_w5", "prog_w6", "prog_w7", "prog_w8", "prog_w9", "prog_w10", "prog_w11", "prog_w12"];
    var n = ids.filter(function (i) { return A[i] && A[i].done; }).length;
    var notes = ids.map(function (i) { return A[i] && A[i].note ? A[i].note : null; }).filter(function (x) { return x; });
    var base = n ? ("지금까지 " + n + "주 실천 체크 ✓") : "아직 체크 전이에요";
    return notes.length ? base + " — " + esc(notes.join(" · ")) : base;
  }
  function renderBook() {
    var title = (A.book_title && A.book_title.trim()) || "제목 없는 책";
    var author = (A.author && A.author.trim()) || "나";
    var vals5 = (A.w1_journey && A.w1_journey.v) ? A.w1_journey.v.filter(function (x) { return x; }).join(" · ") : "";
    var radarVals = A.w4_areas || {};
    var areaItems = getWeek("w4b").steps.filter(function (s) { return s.type === "assess"; })[0].areas.map(function (a) { return a.label; });
    var html =
      '<section class="book">' +
      '<div class="noprint bookbar"><a class="btn ghost" href="#home">← 홈</a><button class="btn" onclick="window.print()">PDF로 저장 / 인쇄</button></div>' +
      '<div class="cover">' + STK.star + STK.heart + '<div class="covertag">' + esc(COURSE.title) + '</div><h1>' + esc(title) + '</h1><p class="byline">' + esc(author) + " 지음</p>" + STK.sprout + "</div>" +

      '<div class="chapter ch1">' + chapHead("첫 페이지", "나는 왜 이 책을 쓰는가", STK.book) +
      bookBlock("이 책을 시작하는 지금의 나는,", A.w1_start_mind) +
      bookBlock("요즘 가장 답답하거나 궁금한 것", A.w1_curious) +
      bookBlock("내가 답을 찾고 싶은 질문", A.w1_question) +
      bookBlock("나를 관통하는 가치 5", vals5) +
      bookBlock("가치 여정에서 다시 쓴 나", (A.w1_value_reflect && A.w1_value_reflect.mine) || "") +
      bookBlock("끝까지 망설인 가치", A.w1_value_kept) + "</div>" +

      '<div class="chapter ch2">' + chapHead("1부", "나의 작동방식", STK.sprout) +
      bookBlock("집중이 잘 될 때", fmtChoices("w2_focus_when")) +
      bookBlock("금방 흩어질 때", fmtChoices("w2_focus_break")) +
      bookBlock("시간 가는 줄 모르고 빠져드는 일", fmtAny("w2_flow")) +
      bookBlock("에너지가 가장 좋은 시간대", fmtChoices("w2_energy_peak")) +
      bookBlock("나를 움직이는 상황", fmtChoices("w2_drive")) +
      bookBlock("절대 안 움직이는 상황", fmtChoices("w2_never")) +
      bookBlock("충전되는 것", fmtChoices("w2_recharge_plus")) +
      bookBlock("방전되는 것", fmtChoices("w2_recharge_minus")) +
      bookBlock("나를 살아있게 하는 것", topAssess("w2_core_need", 2)) +
      bookBlock("내가 '괜찮은 나'로 느낄 때", topAssess("w2_selfworth", 2)) +
      bookBlock("나를 움직이는 힘", topAssess("w2_regfocus", 2)) +
      bookBlock("가장 피하고 싶은 것", fmtChoices("w2_core_fear")) +
      bookBlock("미룰 때 진짜 이유", fmtChoices("w2_procrastinate")) +
      bookBlock("힘든 감정을 다루는 법", topAssess("w2_emotion_reg", 2)) +
      bookBlock("잘 안 될 때 나에게 건네는 말", topAssess("w2_selftalk", 2)) +
      bookBlock("AI와 곱씹어 다시 쓴 작동방식", (A.w2_reframe && A.w2_reframe.mine) || "") + "</div>" +

      '<div class="chapter ch3">' + chapHead("", "나의 강점 지도", STK.star) +
      bookBlock("나의 대표 강점", fmtAny("w3_strengths")) +
      bookBlock("강점이 드러난 순간", fmtAny("w3_evidence")) +
      bookBlock("남들은 어려운데 나는 쉬운 일", fmtAny("w3_easy")) +
      bookBlock("사람들이 고마워하는 것", fmtAny("w3_thank")) +
      bookBlock("친구가 본 나의 강점", fmtChoices("w3_others")) +
      bookBlock("강점 비교 (겹침 / 나만 / 친구만)", cmpLine("w3_strengths", "w3_others")) +
      bookBlock("비교해보니", fmtChoices("w3_gap")) +
      bookBlock("강점의 그림자 — 내가 인정한", fmtChoices("w3_shadow_pick")) +
      bookBlock("강점이 드러나는 양식", fmtAny("w3_shine")) +
      bookBlock("강점의 다른 얼굴 — 남이 보는", fmtChoices("w3_shadow")) +
      bookBlock("보완하고 싶은 약점", fmtChoices("w3_weak")) +
      bookBlock("강점을 더 키우는 실험", A.w3_strength_use) +
      bookBlock("AI와 곱씹어 다시 쓴 강점", (A.w3_reframe && A.w3_reframe.mine) || "") + "</div>" +

      '<div class="chapter ch4">' + chapHead("2부", "나의 현재 지도", STK.cloud) +
      '<div class="bq"><h4>지금 / 바라는 내 삶의 영역</h4><svg class="radar" viewBox="0 0 220 220">' + radarInner(areaItems, radarVals, A.w4_want || null) + '</svg><p class="gaplegend"><span class="gk now">지금</span> <span class="gk want">바람</span></p></div>' +
      bookBlock("돈·경제 — 지금", fmtChoices("w4_money_now")) +
      bookBlock("건강·몸 — 지금", fmtChoices("w4_body_now")) +
      bookBlock("일·커리어 — 지금", fmtChoices("w4_work_now")) +
      bookBlock("배움·성장 — 지금", fmtChoices("w4_grow_now")) +
      bookBlock("마음·정서 — 지금", fmtChoices("w4b_mind_now")) +
      bookBlock("관계 — 지금", fmtChoices("w4b_rel_now")) +
      bookBlock("일상·공간 — 지금", fmtChoices("w4b_life_now")) +
      bookBlock("놀이·쉼 — 지금", fmtChoices("w4b_play_now")) +
      bookBlock("지금과 바람의 가장 큰 격차", gapTop("w4_areas", "w4_want", 3)) +
      bookBlock("가장 채우고 싶은 영역", fmtChoices("w4_fill")) +
      bookBlock("레이더로 본 균형", fmtChoices("w4_balance")) +
      bookBlock("AI와 곱씹어 다시 쓴 토대(돈·건강·일·배움)", (A.w4_reframe && A.w4_reframe.mine) || "") +
      bookBlock("AI와 곱씹어 다시 쓴 현재 지도 종합", (A.w4b_reframe && A.w4b_reframe.mine) || "") +
      '<div class="bq"><h4>채우고 싶은 영역 만다라트</h4>' + bookMandala("w4_mandala") + "</div></div>" +

      '<div class="chapter ch5">' + chapHead("3부", "내가 원하는 것", STK.heart) +
      bookBlock("결국 내가 원하는 것", A.w8_essence) +
      bookBlock("지난 한 달, 새로 알게 된 나", A.w5_review1m) +
      bookBlock("기분 좋게 하는 것들", fmtChoices("w5_joy")) +
      bookBlock("꿈꾸는 이상적인 하루", A.w5_dreamday) +
      bookBlock("원하는 삶의 속도 · 리듬", fmtChoices("w5_pace")) +
      bookBlock("만들고 싶은 습관", fmtChoices("w5_habit")) +
      bookBlock("나에게 좋은 관계란", fmtChoices("w6_good_rel")) +
      bookBlock("가까워질 때의 나", fmtChoices("w6_attach_close")) +
      bookBlock("갈등할 때의 나", fmtChoices("w6_conflict")) +
      bookBlock("도움이 필요할 때의 나", fmtChoices("w6_boundary")) +
      bookBlock("죽기 전 해보고 싶은 것", fmtAny("w6_challenge")) +
      bookBlock("깨고 싶은 두려움 · 한계", A.w6_fear) +
      bookBlock("AI와 곱씹어 다시 본 나의 관계", (A.w6_reframe && A.w6_reframe.mine) || "") +
      bookBlock("일에서 원하는 것", fmtChoices("w7_next_work")) +
      bookBlock("네 가지가 만나는 곳", fmtAny("w7_ikigai")) +
      bookBlock("3 · 7 · 10년 후의 나", fmtAny("w8_futures")) +
      bookBlock("어떻게 기억되고 싶은지", A.w8_epitaph) +
      bookBlock("나의 생의 목표", A.w8_lifegoal) +
      bookBlock("내 가치의 우선순위", fmtAny("w8_priority")) +
      '<div class="bq"><h4>생의 목표 만다라트</h4>' + bookMandala("w8_goal_mandala") + "</div>" +
      bookBlock("AI와 곱씹어 다시 쓴 3부", (A.w8_reframe && A.w8_reframe.mine) || "") + "</div>" +

      '<div class="chapter ch6">' + chapHead("", "나의 미래 그리기", STK.sun) +
      bookBlock("1년 뒤 바라는 장면", A.manifest_w1) +
      bookBlock("그 미래의 평범한 하루", A.manifest_w2) +
      bookBlock("나의 확언", A.manifest_w3) +
      bookBlock("이미 이룬 듯, 감사", A.manifest_w4) +
      bookBlock("미래의 내가 보낸 편지", A.manifest_w5) +
      bookBlock("내려놓고 싶은 두려움", A.manifest_w6) +
      bookBlock("1년 뒤 자랑하고 싶은 것", A.manifest_w7) +
      bookBlock("생의 목표, 한 장면", A.manifest_w8) +
      bookBlock("그 미래를 위한 오늘의 한 발", A.manifest_w9) +
      bookBlock("이미 그렇게 사는 듯한 하루", A.manifest_w10) +
      bookBlock("곁에 두고 싶은 사람·환경", A.manifest_w11) +
      bookBlock("3개월 전의 나에게", A.manifest_w12) + "</div>" +
      '<div class="chapter ch7">' + chapHead("", "3개월 사소한 완수", STK.leaf) +
      bookBlock("내가 정한 작은 일", (A.commit && A.commit.what) || "") +
      '<div class="bq"><h4>진행</h4><p>' + progressSummary() + "</p></div></div>" +

      '<div class="chapter ch9">' + chapHead("4부", "나의 실험", STK.star) +
      bookBlock("5년 뒤 세 갈래 길", fmtAny("w9_odyssey")) +
      bookBlock("끌리는 방향", A.w9_direction) +
      bookBlock("이번 달 작은 실험", A.w9_experiment) +
      bookBlock("두려움 설정 (최악 · 예방 · 복구)", fmtAny("w9_fear")) +
      bookBlock("한 주 실험 소감", A.w10_week) +
      bookBlock("실험 결과", A.w11_result) +
      bookBlock("배운 것 · 의외인 것", A.w11_learn) +
      bookBlock("계속할 것 / 그만둘 것", fmtAny("w11_keep")) + "</div>" +

      '<div class="chapter ch10">' + chapHead("맺음", "다음 1년의 나에게", STK.heart) +
      bookBlock("3개월 돌아보기", fmtAny("w12_recap")) +
      bookBlock("다음 1년의 나에게", A.w12_next1y) +
      bookBlock("나만의 주문", A.w12_spell) + "</div>" +
      "</section>";
    document.getElementById("app").innerHTML = html;
    window.scrollTo(0, 0);
  }

  /* ---------- 라우팅 ---------- */
  function route() {
    var h = location.hash.replace(/^#/, "");
    if (h === ADMIN_HASH) { try { localStorage.setItem("njz_admin", "1"); } catch (e) {} location.hash = "#home"; return; }
    if (h === "book") { renderBook(); return; }
    var m = h.match(/^(w\d+[a-z]*)\/(\d+)$/);
    if (m) {
      var wk = getWeek(m[1]);
      if (wk && !weekVisible(wk)) { location.hash = "#home"; return; }
      CUR.weekId = m[1]; CUR.idx = +m[2]; renderStep(); return;
    }
    renderHome();
  }
  window.addEventListener("hashchange", route);
  route();
})();
