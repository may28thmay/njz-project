/* 「나를 알아가는 3개월」 콘텐츠 데이터
 * 엔진(app.js)과 분리. 2·3달차는 weeks 배열에 주차만 추가하면 확장된다.
 * 주의: 본문에는 기법/출처 이름을 노출하지 않는다. 출처 매핑은 _content/진행자-출처노트.md 참고.
 */

const COURSE = {
  title: "나를 알아가는 3개월",
  subtitle: "나를 알고, 하고 싶은 걸 찾아가는 90일",
  promises: [
    "남들과 비교하지 않아요. 내 에너지와 끌림에만 귀 기울여요.",
    "점수나 라벨로 나를 가두지 않아요. 그저 이해하려는 거예요.",
    "빈칸이 있어도 괜찮아요. 오늘 눈에 들어오는 한 칸이면 돼요.",
    "한 칸씩 쌓이면 한 권이 돼요. 여기 쓴 답이 곧 내 책이에요."
  ],
  weeks: [
    {
      id: "w1", no: 1, badge: "1주차",
      title: "나는 왜 이 책을 쓰는가",
      chapter: "첫 페이지",
      steps: [
        { type: "intro", title: "첫 페이지를 펼쳐요",
          body: "이 책의 첫 페이지를 여는 시간이에요. 멋있게 쓰지 않아도 괜찮아요. 지금의 솔직한 마음을 그대로 담아보세요. 끝에는 「나의 가치 여정」에 다녀와, 나를 관통하는 가치도 만나볼 거예요." },
        { type: "text", id: "author", title: "지은이", hint: "이름 또는 닉네임. 표지에 들어가요.", placeholder: "예: 유림" },
        { type: "text", id: "book_title", title: "내 책의 제목", hint: "가제여도 괜찮아요. 마지막에 바꿀 수 있어요.", placeholder: "예: 나를 알아가는 90일" },
        { type: "text", id: "w1_start_mind", multiline: true, title: "이 책을 시작하는 지금의 나는,", hint: "요즘 마음, 일, 일상의 한 장면." },
        { type: "text", id: "w1_curious", multiline: true, title: "요즘 가장 답답하거나 궁금한 것", hint: "회사 얘기 말고, 진짜 궁금한 '나'에 대한 것." },
        { type: "text", id: "w1_question", title: "이 코스에서 답을 찾고 싶은 질문 하나", placeholder: "\"______________________?\"", hint: "3개월 내내 곁에 둘 질문이에요." },
        { type: "journey", id: "w1_journey", title: "나의 가치 여정 다녀오기",
          url: "https://word-journey.site/",
          intro: "이 책의 출발점이에요. 아래 버튼으로 「나의 가치 여정」에 다녀와요. 천천히 단어를 골라 좁히면, 지금 나를 관통하는 가치 다섯 개가 남아요.",
          linkLabel: "나의 가치 여정 다녀오기",
          bring: "다녀와서, 거기서 나온 가치 다섯 개를 여기에 옮겨 적어요.",
          where: "이 가치들이 내 일상 어디에서 보이나요? (혹은 어디서 안 지켜지나요?)",
          surprise: "다섯 개 중 의외였던 가치 하나는? 왜 의외였나요?" },
        { type: "intro", title: "가치 여정, 더 깊이 음미하기",
          body: "방금 고른 다섯 가치를 더 깊이 들여다봐요. 가치 여정에서 받은 분석을 ChatGPT나 Claude에 넣어 돌리면, 나를 비춰주는 풀 분석이 나와요. 천천히 읽고, 아래에서 내 걸로 곱씹어 소화해요. (분석을 안 돌렸어도, 다섯 가치를 떠올리며 답해도 괜찮아요.)" },
        { type: "reframe", id: "w1_value_reflect", title: "분석을 내 걸로 곱씹기",
          hint: "AI 분석을 그대로 믿지 말고, 내 걸로 소화하는 게 핵심이에요. AI는 내가 준 것만 비춰줄 뿐이에요." },
        { type: "text", id: "w1_value_kept", multiline: true, title: "끝까지 망설이다 뺀 가치",
          hint: "다섯 개로 추리며 마지막까지 고민하다 끝내 뺀 가치가 있나요? 무엇이고, 왜 아까웠나요? 그게 지금 '2순위의 나'일 수 있어요." },
        { type: "text", id: "w1_value_tension", optional: true, multiline: true, title: "원하는 모습과, 거기 가는 힘",
          hint: "내가 바라는 '상태'(편안함·행복 같은)와, 거기 가려고 스스로에게 요구하는 '힘'(부지런함·노력 같은)이 부딪힐 때가 있나요?" },
        { type: "commit", id: "commit", title: "3개월간 반드시 해낼 사소한 일",
          hint: "딱 하나만. 작아도 좋아요(예: 사진 정리, 매일 물 한 잔, 책 한 권). 12주 뒤 '이건 해냈다' 하나면 충분해요. 매주 가볍게 체크할 거예요." },
        { type: "manifest", id: "manifest_w1", title: "이번 주의 미래 그리기",
          prompt: "1년 뒤, 내가 가장 바라는 한 장면을 그려봐요. 어디서, 누구와, 무엇을 하고 있나요? 구체적일수록 좋아요." }
      ],
      meetup: {
        discuss: [
          "요즘의 나를 날씨로 표현하면? 한 줄 이유와 함께.",
          "내가 이 코스에서 답을 찾고 싶은 질문은 무엇인가요?",
          "가치 여정에서 남은 다섯 가치 중, 의외였던 것은?"
        ],
        activity: [
          "각자 첫 페이지를 2~3문장 낭독해요. 피드백 없이 듣기만.",
          "각자 가치 다섯 개를 공유하고, 왜 그게 남았는지 한마디씩 나눠요.",
          "각자 정한 '3개월간 해낼 사소한 일'을 공유하고, 매주 서로 안부 묻기로 약속해요."
        ]
      }
    },
    {
      id: "w2", no: 2, badge: "2주차",
      title: "나의 작동방식",
      chapter: "1부 · 나의 작동방식",
      steps: [
        { type: "intro", title: "나는 어떻게 작동하나",
          body: "이건 진단이 아니에요. 잘 안 되는 게 '의지' 문제가 아니라 원래 내 작동방식일 수 있어요. 그걸 알면 나를 덜 탓하고 더 잘 쓸 수 있어요. 이번 주부터, 쓴 걸 AI가 정리해주고 그걸 다시 내 걸로 곱씹는 시간도 가져요." },
        { type: "progress", id: "prog_w2", title: "사소한 일, 이번 주는 어땠어요?" },
        { type: "choices", id: "w2_focus_when", multi: true, allowOther: true, title: "나는 언제 집중이 잘 되나요?",
          options: ["마감이 닥쳤을 때","관심 있는 주제일 때","혼자 조용할 때","적당한 소음(카페 등)","몸을 움직인 뒤","이른 아침","늦은 밤","마음이 편할 때"] },
        { type: "choices", id: "w2_focus_break", multi: true, allowOther: true, title: "나는 언제 금방 흩어지나요?",
          options: ["관심 없는 일","여러 일이 한꺼번에","알림·메신저","피곤하거나 배고플 때","오래 앉아만 있을 때","압박이 너무 클 때"] },
        { type: "text", id: "w2_flow", multiline: true, title: "시간 가는 줄 모르고 빠져드는 일", hint: "최근이 아니어도, 떠오르는 무엇이든." },
        { type: "choices", id: "w2_drive", multi: true, allowOther: true, title: "나를 움직이게 하는 건 어떤 상황인가요?",
          options: ["마감·기한이 있을 때","인정받을 때","경쟁 상황","자유롭게 맡겨질 때","함께하는 사람이 있을 때","목표가 뚜렷할 때","호기심·재미","돈·보상","의미·기여가 느껴질 때"] },
        { type: "text", id: "w2_never", multiline: true, title: "반대로, 어떤 상황에선 절대 안 움직여요", hint: "아무리 좋아 보여도 이 조건이면 안 하게 되는 것." },
        { type: "choices", id: "w2_energy_peak", multi: false, title: "머리가 가장 잘 도는 시간대",
          options: ["이른 아침","오전","점심 직후","늦은 오후","저녁","밤"] },
        { type: "text", id: "w2_recharge", multiline: true, title: "나를 충전시키는 것 / 방전시키는 것", hint: "사람·장소·활동 무엇이든." },
        { type: "dailyLog", id: "w2_log", title: "주간 채움 기록 (한 주 과제)",
          hint: "하루 한 번, 편한 때 적어요. 못 쓴 칸은 그냥 빈칸. 다 채우는 게 목표가 아니에요.",
          fields: [
            { key: "date", label: "날짜" },
            { key: "plus", label: "나를 살린 것" },
            { key: "minus", label: "나를 빨아먹은 것" },
            { key: "pull", label: "문득 끌린 것" },
            { key: "delay", label: "미루거나 피한 것" }
          ] },
        { type: "text", id: "w2_summary", multiline: true, title: "정리 — 나는 이렇게 작동한다", hint: "위 답을 훑고 3~4문장으로. 이게 책 1부의 핵심이 돼요." },
        { type: "promptForge", id: "w2_ai", title: "AI와 함께 곱씹기 · 프롬프트 만들기",
          intro: "여기까지 적은 '나의 작동방식'을 모아, AI에게 물어볼 프롬프트를 만들었어요. 복사해서 ChatGPT나 Claude에 붙여넣고, 돌아온 답을 아래에서 곱씹어요.",
          system: "너는 따뜻하지만 솔직한 자기탐구 코치야. 아래는 내가 나를 관찰하며 적은 작동방식 기록이야. (1) 여기서 보이는 나의 작동 패턴(언제 잘 되고 언제 흩어지는지, 무엇이 나를 움직이는지), (2) 내가 스스로 놓치고 있는 것 같은 점, (3) 내가 더 깊이 생각해볼 질문 3가지를 짚어줘. 단정짓지 말고, 내가 곱씹을 수 있게 말해줘.",
          collect: [
            { label: "나는 이렇게 작동한다", from: "w2_summary" },
            { label: "나를 움직이는 상황", from: "w2_drive" },
            { label: "절대 안 움직이는 상황", from: "w2_never" },
            { label: "시간 가는 줄 모르는 일", from: "w2_flow" },
            { label: "나를 관통하는 가치", from: "w1_journey" }
          ] },
        { type: "reframe", id: "w2_reframe", title: "AI와 함께 곱씹기 · 내 걸로 만들기",
          hint: "AI 답을 그대로 믿지 말고, 내 걸로 소화하는 게 핵심이에요. AI는 내가 준 것만 비춰줄 뿐이에요." },
        { type: "manifest", id: "manifest_w2", title: "이번 주의 미래 그리기",
          prompt: "그 미래 속 나의 '평범한 하루'를 아침부터 밤까지 그려봐요. 어떤 리듬으로 살고 있나요?" }
      ],
      meetup: {
        discuss: [
          "채움 기록에서 반복해 나를 살린 것 / 빨아먹은 것은?",
          "나를 움직이는 조건과, 절대 안 움직이는 조건 — 의외인 게 있었나요?",
          "잘 안 되던 일이 '의지'가 아니라 '작동방식'이라면, 나를 어떻게 다르게 도울 수 있을까요?"
        ],
        activity: [
          "한 사람씩 작동방식을 공유하고, 나머지가 '내가 본 그 사람의 패턴'을 한마디씩 보태요."
        ]
      }
    },
    {
      id: "w3", no: 3, badge: "3주차",
      title: "강점",
      chapter: "1부 · 나의 강점 지도",
      steps: [
        { type: "intro", title: "나의 강점 지도",
          body: "지난주에 만난 가치를 곁에 두고, 이번 주는 강점을 길어올려요. 남들은 어려워하는데 나는 쉬운 일, 사람들이 자주 고마워하는 것 — 거기에 내 강점이 숨어 있어요. 당연하게 여겨 안 쓰던 강점을 찾아봐요." },
        { type: "progress", id: "prog_w3", title: "사소한 일, 이번 주는 어땠어요?" },
        { type: "text", id: "w3_easy", multiline: true, title: "남들은 어려워하는데 나는 비교적 쉬운 일", hint: "사소해 보여도 괜찮아요." },
        { type: "text", id: "w3_thank", multiline: true, title: "사람들이 나에게 자주 부탁하거나 고마워하는 것" },
        { type: "choices", id: "w3_env", multi: true, allowOther: true, title: "내가 잘 되는 환경",
          options: ["혼자","함께","조용한 곳","북적이는 곳","마감 있음","마감 없음","아침형","밤형","계획적","즉흥적"] },
        { type: "text", id: "w3_setup", multiline: true, title: "하고 싶은 걸 하려면, 나를 어떤 환경에 세팅해야 할까?",
          hint: "위 '잘 되는 환경'을 바탕으로 — 무엇을 두고, 무엇을 없애고, 누구와, 언제 할지." },
        { type: "promptForge", id: "w3_ai", title: "AI와 함께 곱씹기 · 프롬프트 만들기",
          intro: "지금까지 1부에 적은 내용을 모아, AI에게 물어볼 프롬프트를 만들었어요. 복사해서 ChatGPT나 Claude에 붙여넣고, 돌아온 답을 다음 장에서 곱씹어요.",
          system: "너는 따뜻하지만 솔직한 자기탐구 코치야. 아래는 내가 나를 알아가며 적은 1부 기록이야. (1) 여기서 보이는 나의 강점과 작동방식 패턴, (2) 내가 스스로 과소평가하는 것 같은 점, (3) 내가 더 깊이 생각해볼 질문 3가지를 짚어줘. 단정짓지 말고, 내가 곱씹을 수 있게 말해줘.",
          collect: [
            { label: "나는 이렇게 작동한다", from: "w2_summary" },
            { label: "나를 움직이는 상황", from: "w2_drive" },
            { label: "절대 안 움직이는 상황", from: "w2_never" },
            { label: "시간 가는 줄 모르는 일", from: "w2_flow" },
            { label: "나를 관통하는 가치", from: "w1_journey" },
            { label: "남들은 어려운데 나는 쉬운 일", from: "w3_easy" },
            { label: "잘 되는 환경 / 세팅", from: "w3_setup" }
          ] },
        { type: "reframe", id: "w3_reframe", title: "AI와 함께 곱씹기 · 내 걸로 만들기",
          hint: "AI 답을 그대로 믿지 말고, 내 걸로 소화하는 게 핵심이에요. AI는 내가 준 것만 비춰줄 뿐이에요." },
        { type: "manifest", id: "manifest_w3", title: "이번 주의 미래 그리기 · 확언",
          prompt: "그 미래의 나를 한 문장으로 적어봐요. \"나는 ___다\" 또는 \"나는 ___한다.\"", rows: 2, placeholder: "나는 ..." }
      ],
      meetup: {
        discuss: [
          "강점인데 내가 당연하게 여겨서 안 쓰고 있는 건 없나요?",
          "친구가 써준 단어 중, 내가 전혀 몰랐던 나의 강점은?"
        ],
        activity: [
          "각자 다른 3명에게 '이 친구 하면 떠오르는 강점 단어 3개'를 써서 전달해요.",
          "받은 단어 vs 내가 쓴 강점을 비교 — 갭이 큰 지점 하나를 이야기해요."
        ]
      }
    },
    {
      id: "w4", no: 4, badge: "4주차",
      title: "현재 지도 + 만다라트",
      chapter: "2부 · 나의 현재 지도",
      steps: [
        { type: "intro", title: "지금의 나를 지도로",
          body: "지금의 나를 인생 영역별로 그려봐요. 평가가 아니라 현재 위치예요. 점수가 낮은 영역이 나쁜 게 아니라, 지금 거기 있다는 뜻일 뿐이에요." },
        { type: "progress", id: "prog_w4", title: "사소한 일, 이번 주는 어땠어요?" },
        { type: "sliders", id: "w4_areas", title: "지금 내 삶의 영역들 (0~10)",
          hint: "직감으로 슬라이더를 옮겨요. 옮기면 아래 그림이 함께 변해요.",
          items: ["돈","건강","일","마음","관계","일상","배움","놀이"] },
        { type: "text", id: "w4_area_note", multiline: true, title: "각 영역, 지금 한 줄씩",
          hint: "돈·건강·일·마음·관계·일상·배움·놀이 — 마음 가는 영역에 '지금 어떤지' 한 줄씩." },
        { type: "mandala", id: "w4_mandala", title: "채우고 싶은 영역 만다라트",
          centerLabel: "지금 가장 채우고 싶은 영역",
          hint: "가운데에 한 가지를 적고, 둘레 8칸에 떠오르는 것(작은 행동·아이디어)을 채워요. 다 안 채워도 괜찮아요." },
        { type: "promptForge", id: "w4_ai", title: "AI와 함께 곱씹기 · 프롬프트 만들기",
          intro: "2부 '나의 현재 지도'를 바탕으로 AI에게 물어볼 프롬프트예요. 복사해서 돌려보고, 다음 장에서 곱씹어요.",
          system: "너는 따뜻하지만 솔직한 자기탐구 코치야. 아래는 내 삶의 영역별 현재 상태야. (1) 전체 균형이 어떻게 보이는지, (2) 지금 한 곳에 힘을 준다면 어디가 좋을지 이유와 함께, (3) 내가 더 생각해볼 질문 3가지를 짚어줘. 단정짓지 말아줘.",
          collect: [
            { label: "영역별 점수", from: "w4_areas" },
            { label: "각 영역 한 줄", from: "w4_area_note" },
            { label: "채우고 싶은 영역 만다라트", from: "w4_mandala" }
          ] },
        { type: "reframe", id: "w4_reframe", title: "AI와 함께 곱씹기 · 내 걸로 만들기",
          hint: "AI가 비춰준 것 중 내게 진짜인 것만 남겨요." },
        { type: "manifest", id: "manifest_w4", title: "이번 주의 미래 그리기 · 감사",
          prompt: "그 미래가 이미 이뤄졌다고 느껴봐요. 그래서 지금, 고마운 것 하나는?" }
      ],
      meetup: {
        discuss: [
          "내 레이더에서 가장 채워진 영역 / 가장 빈 영역은? 예상과 같았나요?",
          "지금 가장 채우고 싶은 영역에 마음이 가는 이유는?"
        ],
        activity: [
          "각자 레이더 그림을 공유해요.",
          "함께 만다라트 만들기 — 한 명씩 가운데 목표를 정하면, 나머지가 둘레 8칸 아이디어를 보태줘요.",
          "한 달 돌아보기 — 각자 '나의 미래 그리기' 4주치를 다시 읽고, 달라진 점 한 가지씩."
        ]
      }
    },
    {
      id: "w5", no: 5, badge: "5주차",
      title: "마음 · 라이프스타일",
      chapter: "3부 · 내가 원하는 것",
      steps: [
        { type: "intro", title: "이제 '원하는 것'으로",
          body: "지난 한 달은 '지금의 나'를 봤어요. 작동방식·강점·현재 지도를 한 번 훑어보고 와요. 이번 달부터는 방향을 틀어 '내가 원하는 것'으로 가요. 아직 막연해도 괜찮아요. 작고 사소한 끌림부터 적어봐요." },
        { type: "text", id: "w5_review1m", multiline: true, title: "지난 한 달, 나에 대해 새로 알게 된 것",
          hint: "1달차(작동방식·강점·현재 지도)를 훑어보고 떠오르는 한두 가지. 이게 2달차의 출발점이에요." },
        { type: "progress", id: "prog_w5", title: "사소한 일, 이번 주는 어땠어요?" },
        { type: "text", id: "w5_joy", multiline: true, title: "요즘 나를 기분 좋게 하는 것들", hint: "거창하지 않아도 돼요. 아침 커피, 짧은 산책, 좋아하는 노래처럼 작은 것들." },
        { type: "text", id: "w5_dreamday", multiline: true, title: "내가 꿈꾸는 이상적인 하루", hint: "눈뜰 때부터 잠들 때까지, 가장 마음에 드는 하루를 그려봐요." },
        { type: "choices", id: "w5_pace", multi: true, allowOther: true, title: "내가 원하는 삶의 속도 · 리듬",
          options: ["느긋하게","규칙적으로","즉흥적으로","몰입과 휴식 반복","천천히 깊게","여러 가지 동시에","단순하게","여유 있게"] },
        { type: "text", id: "w5_habit", multiline: true, title: "새로 만들고 싶은 습관 하나",
          hint: "무엇을 만들고 싶은지 — 예: 다섯 줄 일기, 물 한 잔, 짧은 산책." },
        { type: "choices", id: "w5_habit_when", multi: false, allowOther: true, title: "그 습관, 언제·어디에 붙일까?",
          hint: "이미 하는 일 바로 뒤에 붙이면 한결 쉬워져요.",
          options: ["아침에 일어나서","출근·등교길","점심 먹고","집에 오면","저녁 먹고","자기 전","커피 마실 때","씻고 나서"] },
        { type: "manifest", id: "manifest_w5", title: "이번 주의 미래 그리기 · 편지",
          prompt: "그 미래의 내가 지금의 나에게 짧은 편지를 보낸다면? 어떤 말을 해줄까요?" }
      ],
      meetup: {
        discuss: [
          "내가 꿈꾸는 이상적인 하루에서, 지금도 할 수 있는 한 조각은?",
          "만들고 싶은 습관 — 무엇이 그걸 어렵게 하고, 무엇이 쉽게 할까요?"
        ],
        activity: [
          "각자 '이상적인 하루'를 한 장면씩 이야기하고, 나머지가 '그거 너답다' 싶은 부분을 짚어줘요.",
          "각자의 '만들고 싶은 습관'을 공유하고, 다음 모임까지 서로 안부 묻기로 해요."
        ]
      }
    },
    {
      id: "w6", no: 6, badge: "6주차",
      title: "관계 · 도전",
      chapter: "3부 · 내가 원하는 것",
      steps: [
        { type: "intro", title: "나를 둘러싼 사람들, 그리고 미뤄둔 도전",
          body: "원하는 삶에는 '누구와, 어떻게'가 빠질 수 없어요. 마음 한켠에 미뤄둔 도전도요. 눈치 보지 말고 솔직하게 적어봐요." },
        { type: "progress", id: "prog_w6", title: "사소한 일, 이번 주는 어땠어요?" },
        { type: "text", id: "w6_good_rel", multiline: true, title: "나에게 '좋은 관계'란 어떤 걸까요?", hint: "함께 있으면 편한 사람들의 공통점, 내가 바라는 관계의 모습." },
        { type: "choices", id: "w6_want", multi: true, allowOther: true, title: "지금 내 관계에서 더 원하는 것",
          options: ["더 깊게","더 넓게","적당한 거리","새로운 인연","지금을 지키기","솔직함","함께하는 시간","혼자만의 시간"] },
        { type: "text", id: "w6_near_far", multiline: true, title: "곁에 더 두고 싶은 사람 / 거리를 두고 싶은 관계", hint: "이름이 아니어도, 어떤 결의 관계인지." },
        { type: "text", id: "w6_challenge", multiline: true, title: "죽기 전에 꼭 해보고 싶은 것", hint: "크든 작든. 떠오르는 대로 여러 개 적어도 좋아요." },
        { type: "text", id: "w6_fear", multiline: true, title: "깨고 싶은 나의 두려움 · 한계", hint: "'이것만 아니면 해볼 텐데' 싶은 것." },
        { type: "manifest", id: "manifest_w6", title: "이번 주의 미래 그리기 · 내려놓기",
          prompt: "그 미래로 가기 위해 지금 내려놓고 싶은 두려움 하나는? 그걸 내려놓은 나를 그려봐요." }
      ],
      meetup: {
        discuss: [
          "내가 바라는 '좋은 관계'의 모습 — 지금 그런 관계가 있나요?",
          "죽기 전 해보고 싶은 것 중 하나를, 올해 작게 시작한다면?"
        ],
        activity: [
          "각자 '해보고 싶은 도전' 하나를 공유하고, 첫걸음을 같이 정해줘요.",
          "서로에게 '이 친구라면 이 두려움 넘을 수 있어' 한마디씩 건네요."
        ]
      }
    },
    {
      id: "w7", no: 7, badge: "7주차",
      title: "일 · 성장 · 네 가지가 만나는 곳",
      chapter: "3부 · 내가 원하는 것",
      steps: [
        { type: "intro", title: "좋아하고, 잘하고, 필요하고, 보상받는",
          body: "하고 싶은 일을 찾을 때 도움이 되는 네 가지가 있어요. 좋아하는 것 · 잘하는 것 · 세상이 필요로 하는 것 · 보상받을 수 있는 것. 이 네 가지가 겹치는 곳을 천천히 더듬어봐요." },
        { type: "progress", id: "prog_w7", title: "사소한 일, 이번 주는 어땠어요?" },
        { type: "text", id: "w7_next_work", multiline: true, title: "앞으로의 일에서 내가 원하는 것", hint: "직업·직장 말고도, 일을 통해 얻고 싶은 것(자유·성장·인정·의미 등)." },
        { type: "text", id: "w7_strength_use", multiline: true, title: "내 장점을 지금보다 더 살린다면?", hint: "3주차에서 본 강점을 떠올리며 — 어디에, 어떻게 더 쓸 수 있을까요?" },
        { type: "text", id: "w7_places", multiline: true, title: "가보고 싶은 곳 · 해보고 싶은 경험", hint: "여행지든, 분야든, 배워보고 싶은 것이든." },
        { type: "ikigai", id: "w7_ikigai", title: "네 가지가 만나는 곳",
          hint: "각 칸을 떠오르는 대로 채워요. 다 못 채워도 괜찮아요. 마지막에, 네 가지가 겹치는 한가운데에 무엇이 떠오르는지 적어봐요." },
        { type: "manifest", id: "manifest_w7", title: "이번 주의 미래 그리기 · 자랑",
          prompt: "1년 뒤 가장 자랑하고 싶은 것 하나는 무엇일까요? 그걸 이룬 장면을 그려봐요." }
      ],
      meetup: {
        discuss: [
          "네 칸 중 가장 쉽게 채워진 칸 / 가장 비어 있는 칸은?",
          "한가운데에 떠오른 것 — 지금 삶과 얼마나 가깝고, 머나요?"
        ],
        activity: [
          "각자 한가운데 칸을 공유하고, 나머지가 '거기에 어울리는 너의 강점'을 보태줘요.",
          "가보고 싶은 곳·경험 중 하나를 골라, 올해 안에 해볼 작은 버전을 같이 정해요."
        ]
      }
    },
    {
      id: "w8", no: 8, badge: "8주차",
      title: "궁극의 질문 · 우선순위",
      chapter: "3부 · 내가 원하는 것",
      steps: [
        { type: "intro", title: "멀리 보고, 다시 지금으로",
          body: "이번 주는 조금 멀리 봐요. 몇 년 뒤의 나, 그리고 삶 전체를. 그런 다음 '그래서 지금 무엇이 가장 중요한지'로 돌아와요. 양이 조금 많은 주예요 — 다 못 채워도 괜찮고, '원하면'이라 적힌 칸은 시간 될 때 와도 돼요." },
        { type: "progress", id: "prog_w8", title: "사소한 일, 이번 주는 어땠어요?" },
        { type: "text", id: "w8_futures", multiline: true, title: "3년 후 · 7년 후 · 10년 후의 나", hint: "각각 한두 줄씩. 어디서, 어떤 모습으로 살고 있을까요?" },
        { type: "text", id: "w8_epitaph", optional: true, multiline: true, title: "사람들이 나를 어떻게 기억하면 좋을까요?", hint: "먼 훗날, 한 문장으로 남는다면." },
        { type: "text", id: "w8_lifegoal", multiline: true, title: "지금 떠오르는 '생의 목표' 하나", hint: "거창하지 않아도 돼요. 지금 마음에 가장 크게 걸리는 것." },
        { type: "priority", id: "w8_priority", title: "내 가치, 무엇이 먼저일까?",
          hint: "1주차 가치 여정에서 남은 다섯 가치예요. ↑↓로 지금 나에게 중요한 순서대로 옮겨봐요. 그리고 1순위가 왜 먼저인지 한 줄 적어요." },
        { type: "mandala", id: "w8_goal_mandala", title: "생의 목표 만다라트",
          centerLabel: "내 생의 목표",
          hint: "가운데에 목표를 적고, 둘레 8칸에 그걸 향한 작은 행동·조각을 채워요. 다 안 채워도 괜찮아요." },
        { type: "promptForge", id: "w8_ai", title: "AI와 함께 곱씹기 · 프롬프트 만들기",
          intro: "3부 '내가 원하는 것'을 모아 AI에게 물어볼 프롬프트예요. 복사해서 돌려보고, 다음 장에서 곱씹어요.",
          system: "너는 따뜻하지만 솔직한 자기탐구 코치야. 아래는 내가 '원하는 것'에 대해 적은 기록이야. (1) 여기서 보이는 나의 진짜 욕구와 방향, (2) 내가 말로는 원한다면서 행동으로는 피하는 것 같은 지점, (3) 생의 목표에 한 발 다가가기 위해 이번 달 해볼 만한 '작은 실험' 3가지를 제안해줘. 단정짓지 말고, 내가 곱씹을 수 있게 말해줘.",
          collect: [
            { label: "기분 좋게 하는 것", from: "w5_joy" },
            { label: "꿈꾸는 이상적인 하루", from: "w5_dreamday" },
            { label: "만들고 싶은 습관", from: "w5_habit" },
            { label: "해보고 싶은 도전", from: "w6_challenge" },
            { label: "일에서 원하는 것", from: "w7_next_work" },
            { label: "네 가지가 겹치는 곳", from: "w7_ikigai" },
            { label: "생의 목표", from: "w8_lifegoal" },
            { label: "가치 우선순위", from: "w8_priority" }
          ] },
        { type: "reframe", id: "w8_reframe", optional: true, title: "AI와 함께 곱씹기 · 내 걸로 만들기",
          hint: "AI가 비춰준 것 중 내게 진짜인 것만 남겨요. 특히 '작은 실험' 제안은 다음 달에 직접 해볼 거예요." },
        { type: "text", id: "w8_essence", title: "이 모든 걸 한 문장으로 — 결국 내가 원하는 건",
          hint: "3부에서 적은 것들을 떠올리며, 가장 굵은 줄기 하나만 남겨봐요.", placeholder: "나는 결국 ___을(를) 원한다." },
        { type: "manifest", id: "manifest_w8", title: "이번 주의 미래 그리기 · 한 장면",
          prompt: "내 생의 목표가 이뤄진 순간을 한 장면으로 또렷이 그려봐요. 무엇이 보이고, 어떤 기분인가요?" }
      ],
      meetup: {
        discuss: [
          "3·7·10년 후의 나 — 쓰면서 가장 설렜던 건? 가장 막막했던 건?",
          "내 가치 1순위가 지금 내 일상에서 지켜지고 있나요?"
        ],
        activity: [
          "각자 '생의 목표'를 한 문장으로 공유해요. 피드백 없이 듣기만.",
          "함께 목표 만다라트 채우기 — 한 명의 가운데 목표에 나머지가 둘레 행동을 보태줘요.",
          "2달차를 돌아보며, '내가 원하는 것'이 한 달 전과 어떻게 달라졌는지 한마디씩."
        ]
      }
    },
    {
      id: "w9", no: 9, badge: "9주차",
      title: "비전 · 작은 실험 설계",
      chapter: "4부 · 나의 실험",
      steps: [
        { type: "intro", title: "머리에서 손발로",
          body: "이제 마지막 달이에요. 알게 된 것·원하는 것을 '작은 실험'으로 옮겨봐요. 크게 바꾸지 않아도 돼요. 2주 안에 해볼 수 있는 작은 한 걸음이면 충분해요." },
        { type: "progress", id: "prog_w9", title: "사소한 일, 이번 주는 어땠어요?" },
        { type: "odyssey", id: "w9_odyssey", title: "5년 뒤, 세 갈래 길",
          hint: "정답을 고르는 게 아니에요. 세 가지 인생을 가볍게 상상해보고, 각각 얼마나 설레는지 느껴봐요." },
        { type: "text", id: "w9_direction", multiline: true, title: "세 길을 보고 나니, 지금 끌리는 방향은?", hint: "한 줄이면 충분해요. 섞여도 괜찮아요." },
        { type: "text", id: "w9_experiment", multiline: true, title: "이번 달 해볼 작은 실험 하나",
          hint: "이렇게 적어봐요 — \"나는 ___을 해보면 / ___일 것 같다 / 2주 안에 ___로 확인한다.\" 작을수록 좋아요." },
        { type: "fearSetting", id: "w9_fear", title: "그게 조금 두렵다면",
          hint: "두려움은 막연할 때 가장 커요. 적어두면 작아져요." },
        { type: "manifest", id: "manifest_w9", title: "이번 주의 미래 그리기 · 한 발",
          prompt: "그 미래로 가는 '오늘 내디딜 수 있는 가장 작은 한 발'은 무엇인가요?" }
      ],
      meetup: {
        discuss: [
          "세 갈래 길 중 가장 설렜던 시나리오는? 의외였나요?",
          "내가 정한 작은 실험 — 서로 더 작고 쉽게 만들어줄 수 있을까요?"
        ],
        activity: [
          "각자 '2주 실험'을 선언하고, 다음 모임에서 결과를 묻기로 약속해요.",
          "서로의 두려움에 '예방·복구' 아이디어를 한 줄씩 보태줘요."
        ]
      }
    },
    {
      id: "w10", no: 10, badge: "10주차",
      title: "실험 실행 주간",
      chapter: "4부 · 나의 실험",
      steps: [
        { type: "intro", title: "적게 쓰고, 많이 살기",
          body: "이번 주는 채우는 칸이 적어요. 대신 정한 실험을 실제로 해보는 주예요. 완벽하지 않아도, 해본 것 자체가 데이터예요." },
        { type: "progress", id: "prog_w10", title: "사소한 일, 이번 주는 어땠어요?" },
        { type: "dailyLog", id: "w10_log", title: "실험 기록 (한 주)",
          hint: "실험한 날만 적어도 돼요. 안 한 날은 빈칸.",
          fields: [
            { key: "date", label: "날짜" },
            { key: "did", label: "오늘 해본 것" },
            { key: "feel", label: "하고 난 느낌" }
          ] },
        { type: "text", id: "w10_week", multiline: true, title: "한 주 살아보니 — 한 줄", hint: "잘 됐든 안 됐든 솔직하게." },
        { type: "manifest", id: "manifest_w10", title: "이번 주의 미래 그리기 · 이미",
          prompt: "그 미래의 내가 이미 된 것처럼 오늘 하루를 산다면, 어떤 모습일까요?" }
      ],
      meetup: {
        discuss: [
          "실험, 해보니 어땠어요? 예상과 달랐던 점은?",
          "막힌 데가 있다면 무엇이 막았나요?"
        ],
        activity: [
          "각자 실험 중간 보고 — 응원과 작은 팁만, 평가는 없기.",
          "한 주 더 이어갈지, 바꿀지 각자 정해요."
        ]
      }
    },
    {
      id: "w11", no: 11, badge: "11주차",
      title: "실험 회고 · 책 점검",
      chapter: "4부 · 나의 실험",
      steps: [
        { type: "intro", title: "해보고 알게 된 것",
          body: "실험의 목적은 성공이 아니라 '나에 대한 데이터'예요. 맞았든 틀렸든, 한 걸음 더 나를 알게 됐어요." },
        { type: "progress", id: "prog_w11", title: "사소한 일, 이번 주는 어땠어요?" },
        { type: "text", id: "w11_result", multiline: true, title: "실험 결과 — 가설은 맞았나요?", hint: "무슨 일이 있었는지 그대로." },
        { type: "text", id: "w11_learn", multiline: true, title: "배운 것 · 의외였던 것", hint: "나에 대해 새로 안 것." },
        { type: "text", id: "w11_keep", multiline: true, title: "계속할 것 / 그만둘 것", hint: "이번 실험에서 건진 것, 내려놓을 것." },
        { type: "intro", title: "내 책 한 번 훑어보기",
          body: "지금까지 쓴 '내 책'을 위쪽 메뉴 '내 책'에서 펼쳐봐요. 비어 있어 아쉬운 칸이 있으면 한두 개만 채워와요. 다음 주에 책을 완성해요." },
        { type: "manifest", id: "manifest_w11", title: "이번 주의 미래 그리기 · 곁",
          prompt: "그 미래로 가는 길에 곁에 두고 싶은 사람이나 환경은 누구·무엇인가요?" }
      ],
      meetup: {
        discuss: [
          "실험에서 가장 크게 배운 것 하나는?",
          "내 책을 다시 보니 마음에 드는 페이지는?"
        ],
        activity: [
          "각자 실험 회고를 나누고, 서로 '그게 너다운 발견'을 짚어줘요.",
          "다음 주 완성 모임 준비 — 낭독할 페이지 하나씩 골라오기."
        ]
      }
    },
    {
      id: "w12", no: 12, badge: "12주차",
      title: "완성 · 맺음",
      chapter: "맺음",
      steps: [
        { type: "intro", title: "마지막 장을 덮으며",
          body: "12주를 걸어왔어요. 빈칸이 있어도 괜찮아요 — 채운 만큼이 지금의 나예요. 이제 책을 닫는 글을 써요." },
        { type: "progress", id: "prog_w12", title: "사소한 일, 마지막 체크 — 해냈나요?" },
        { type: "text", id: "w12_recap", multiline: true, title: "3개월 돌아보기 — 가장 큰 변화 / 가장 좋았던 순간", hint: "크지 않아도 돼요. 작게 달라진 것도." },
        { type: "text", id: "w12_next1y", multiline: true, title: "다음 1년의 나에게", hint: "1주차에 적은 '찾고 싶은 질문'을 떠올리며." },
        { type: "text", id: "w12_spell", title: "나만의 주문 — 흔들릴 때 꺼낼 한 문장", placeholder: "예: 나는 천천히, 그러나 나답게 간다.", hint: "이 책 전체를 한 문장으로." },
        { type: "manifest", id: "manifest_w12", title: "이번 주의 미래 그리기 · 편지 닫기",
          prompt: "3개월 전의 나에게, 지금의 내가 한마디 건넨다면?" }
      ],
      meetup: {
        discuss: [
          "12주 전과 지금, 가장 달라진 한 가지는?",
          "'나만의 주문'을 서로 나눠요."
        ],
        activity: [
          "각자 책에서 한 페이지를 낭독해요 — 듣기만, 박수로.",
          "서로에게 '이 사람의 3개월'을 한 문장 선물로 써줘요.",
          "각자 '내 책'을 PDF로 저장 — 완성을 축하해요."
        ]
      }
    }
  ],
  locked: []
};
