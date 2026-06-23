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
      case "choices": return !!(v && ((v.picked && v.picked.length) || (v.other && v.other.trim())));
      case "cardFilter": return !!(v && ((v.l1 && v.l1.length) || (v.l2 && v.l2.length)));
      case "mandala": return !!(v && (v.center || (v.cells && v.cells.some(function (c) { return c; }))));
      case "sliders": return !!(v && Object.keys(v).length);
      case "dailyLog": return !!(v && v.some(function (d) { return Object.keys(d).some(function (k) { return d[k] && String(d[k]).trim(); }); }));
      case "reframe": return !!(v && (v.resonate || v.doubt || v.mine));
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
  function inputSteps(week) { return week.steps.filter(function (s) { return s.type !== "intro" && s.type !== "promptForge" && !s.optional; }); }

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
  function fmtAny(id) {
    var v = A[id];
    if (v == null) return "";
    if (typeof v === "string") return v;
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
    if (typeof v === "object") return Object.keys(v).map(function (k) { return k + " " + v[k]; }).join(", ");
    return "";
  }
  function buildPrompt(s) {
    var lines = s.collect.map(function (c) { var val = fmtAny(c.from); return "- " + c.label + ": " + (val && val.trim() ? val : "(아직 안 씀)"); });
    return s.system + "\n\n[내 기록]\n" + lines.join("\n");
  }
  function compPromptForge(s) {
    var intro = s.intro ? '<p class="hint">' + esc(s.intro) + "</p>" : "";
    return intro +
      '<textarea class="promptbox" rows="10" readonly>' + esc(buildPrompt(s)) + "</textarea>" +
      '<div class="rowbtn"><button class="btn" onclick="copyPrompt(this)">프롬프트 복사</button> ' +
      '<a class="btn ghost" href="https://claude.ai/new" target="_blank" rel="noopener">Claude 열기</a> ' +
      '<a class="btn ghost" href="https://chatgpt.com" target="_blank" rel="noopener">ChatGPT 열기</a></div>';
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
      case "promptForge": body = compPromptForge(s); break;
      case "reframe": body = compReframe(s); break;
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
    document.getElementById("app").innerHTML =
      '<section class="step">' +
      '<div class="crumbs"><a href="#home">홈</a> · ' + esc(week.badge) + " · " + (CUR.idx + 1) + "/" + list.length + "</div>" +
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
    var areaItems = getWeek("w4").steps.filter(function (s) { return s.type === "sliders"; })[0].items;
    var html =
      '<section class="book">' +
      '<div class="noprint bookbar"><a class="btn ghost" href="#home">← 홈</a><button class="btn" onclick="window.print()">PDF로 저장 / 인쇄</button></div>' +
      '<div class="cover">' + STK.star + STK.heart + '<div class="covertag">' + esc(COURSE.title) + '</div><h1>' + esc(title) + '</h1><p class="byline">' + esc(author) + " 지음</p>" + STK.sprout + "</div>" +

      '<div class="chapter ch1">' + chapHead("서문", "나는 왜 이 책을 쓰는가", STK.book) +
      bookBlock("이 책을 시작하는 지금의 나는,", A.w1_start_mind) +
      bookBlock("요즘 가장 답답하거나 궁금한 것", A.w1_curious) +
      bookBlock("내가 답을 찾고 싶은 질문", A.w1_question) +
      bookBlock("나를 관통하는 가치 5", vals5) + "</div>" +

      '<div class="chapter ch2">' + chapHead("1부", "나의 작동방식", STK.sprout) +
      bookBlock("나는 이렇게 작동한다", A.w2_summary) +
      bookBlock("집중이 잘 될 때", fmtChoices("w2_focus_when")) +
      bookBlock("금방 흩어질 때", fmtChoices("w2_focus_break")) +
      bookBlock("시간 가는 줄 모르고 빠져드는 일", A.w2_flow) +
      bookBlock("에너지가 가장 좋은 시간대", fmtChoices("w2_energy_peak")) +
      bookBlock("충전되는 것 / 방전되는 것", A.w2_recharge) +
      bookBlock("AI와 곱씹어 다시 쓴 작동방식", (A.w2_reframe && A.w2_reframe.mine) || "") + "</div>" +

      '<div class="chapter ch3">' + chapHead("", "나의 강점 지도", STK.star) +
      bookBlock("남들은 어려운데 나는 쉬운 일", A.w3_easy) +
      bookBlock("사람들이 고마워하는 것", A.w3_thank) +
      bookBlock("내가 잘 되는 환경", fmtChoices("w3_env")) +
      bookBlock("AI와 곱씹어 다시 쓴 강점", (A.w3_reframe && A.w3_reframe.mine) || "") + "</div>" +

      '<div class="chapter ch4">' + chapHead("2부", "나의 현재 지도", STK.cloud) +
      '<div class="bq"><h4>지금 내 삶의 영역</h4><svg class="radar" viewBox="0 0 220 220">' + radarInner(areaItems, radarVals) + "</svg></div>" +
      bookBlock("각 영역, 지금 한 줄", A.w4_area_note) +
      '<div class="bq"><h4>채우고 싶은 영역 만다라트</h4>' + bookMandala("w4_mandala") + "</div>" +
      bookBlock("AI와 곱씹어 다시 쓴 2부", (A.w4_reframe && A.w4_reframe.mine) || "") + "</div>" +

      '<div class="chapter ch5">' + chapHead("3부", "내가 원하는 것", STK.heart) +
      bookBlock("결국 내가 원하는 것", A.w8_essence) +
      bookBlock("지난 한 달, 새로 알게 된 나", A.w5_review1m) +
      bookBlock("기분 좋게 하는 것들", A.w5_joy) +
      bookBlock("꿈꾸는 이상적인 하루", A.w5_dreamday) +
      bookBlock("원하는 삶의 속도 · 리듬", fmtChoices("w5_pace")) +
      bookBlock("만들고 싶은 습관", A.w5_habit) +
      bookBlock("나에게 좋은 관계란", A.w6_good_rel) +
      bookBlock("죽기 전 해보고 싶은 것", A.w6_challenge) +
      bookBlock("깨고 싶은 두려움 · 한계", A.w6_fear) +
      bookBlock("일에서 원하는 것", A.w7_next_work) +
      bookBlock("네 가지가 만나는 곳", fmtAny("w7_ikigai")) +
      bookBlock("3 · 7 · 10년 후의 나", A.w8_futures) +
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
      bookBlock("계속할 것 / 그만둘 것", A.w11_keep) + "</div>" +

      '<div class="chapter ch10">' + chapHead("맺음", "다음 1년의 나에게", STK.heart) +
      bookBlock("3개월 돌아보기", A.w12_recap) +
      bookBlock("다음 1년의 나에게", A.w12_next1y) +
      bookBlock("나만의 주문", A.w12_spell) + "</div>" +
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
