/* 「나를 알아가는 3개월」 콘텐츠 데이터
 * 엔진(app.js)과 분리. 2·3달차는 weeks 배열에 주차만 추가하면 확장된다.
 * 주의: 본문에는 기법/출처 이름을 노출하지 않는다. 출처 매핑은 _content/진행자-출처노트.md 참고.
 */

const COURSE = {
  title: "나를 알아가는 3개월",
  subtitle: "나를 알고, 하고 싶은 걸 찾아가는 90일",
  promises: [
    "비교가 아니라 신호 — 남이 얼마나 갔나가 아니라 내 에너지·끌림을 봅니다.",
    "진단이 아니라 이해 — 점수나 라벨로 나를 가두지 않아요.",
    "빈칸은 실패가 아니에요 — 오늘 눈에 들어오는 한 칸이면 충분합니다.",
    "쌓이면 책이 됩니다 — 여기 쓴 답이 곧 내 책의 한 페이지예요."
  ],
  weeks: [
    {
      id: "w1", no: 1, badge: "1주차",
      title: "서문 — 나는 왜 이 책을 쓰는가",
      chapter: "서문",
      steps: [
        { type: "intro", title: "서문을 시작해요",
          body: "이 책의 첫 페이지를 여는 시간이에요. 멋있게 쓰지 않아도 괜찮아요. 지금의 솔직한 마음을 그대로 담아보세요." },
        { type: "text", id: "author", title: "지은이", hint: "이름 또는 닉네임. 표지에 들어가요.", placeholder: "예: 유림" },
        { type: "text", id: "book_title", title: "내 책의 제목", hint: "가제여도 괜찮아요. 마지막에 바꿀 수 있어요.", placeholder: "예: 나를 알아가는 90일" },
        { type: "text", id: "w1_start_mind", multiline: true, title: "이 책을 시작하는 지금의 나는,", hint: "요즘 마음, 일, 일상의 한 장면." },
        { type: "text", id: "w1_curious", multiline: true, title: "요즘 가장 답답하거나 궁금한 것", hint: "회사 얘기 말고, 진짜 궁금한 '나'에 대한 것." },
        { type: "text", id: "w1_question", title: "이 코스에서 답을 찾고 싶은 질문 하나", placeholder: "\"______________________?\"", hint: "3개월 내내 곁에 둘 질문이에요." },
        { type: "text", id: "w1_letter", multiline: true, title: "3개월 뒤의 나에게", hint: "짧아도 좋아요. 한 문장이면 충분." }
      ],
      meetup: {
        discuss: [
          "요즘의 나를 날씨로 표현하면? 한 줄 이유와 함께.",
          "내가 이 코스에서 답을 찾고 싶은 질문은 무엇인가요?"
        ],
        activity: [
          "각자 서문을 2~3문장 낭독 — 피드백 없이 듣기만 해요.",
          "4주 모임 요일·시간을 정하고, 다음 주 진행자를 뽑아요."
        ]
      }
    },
    {
      id: "w2", no: 2, badge: "2주차",
      title: "나의 작동방식",
      chapter: "1부 · 나의 작동방식",
      steps: [
        { type: "intro", title: "나는 어떻게 작동하나",
          body: "이건 진단이 아니에요. 잘 안 되는 게 '의지' 문제가 아니라 원래 내 작동방식일 수 있어요. 그걸 알면 나를 덜 탓하고 더 잘 쓸 수 있어요." },
        { type: "choices", id: "w2_focus_when", multi: true, allowOther: true, title: "나는 언제 집중이 잘 되나요?",
          options: ["마감이 닥쳤을 때","관심 있는 주제일 때","혼자 조용할 때","적당한 소음(카페 등)","몸을 움직인 뒤","이른 아침","늦은 밤","마음이 편할 때"] },
        { type: "choices", id: "w2_focus_break", multi: true, allowOther: true, title: "나는 언제 금방 흩어지나요?",
          options: ["관심 없는 일","여러 일이 한꺼번에","알림·메신저","피곤하거나 배고플 때","오래 앉아만 있을 때","압박이 너무 클 때"] },
        { type: "text", id: "w2_flow", multiline: true, title: "시간 가는 줄 모르고 빠져드는 일", hint: "최근이 아니어도, 떠오르는 무엇이든." },
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
        { type: "text", id: "w2_summary", multiline: true, title: "정리 — 나는 이렇게 작동한다", hint: "위 답을 훑고 3~4문장으로. 이게 책 1부의 핵심이 돼요." }
      ],
      meetup: {
        discuss: [
          "채움 기록에서 반복해 나를 살린 것 / 빨아먹은 것은?",
          "잘 안 되던 일이 '의지'가 아니라 '작동방식'이라면, 나를 어떻게 다르게 도울 수 있을까요?"
        ],
        activity: [
          "한 사람씩 작동방식을 공유하고, 나머지가 '내가 본 그 사람의 패턴'을 한마디씩 보태요."
        ]
      }
    },
    {
      id: "w3", no: 3, badge: "3주차",
      title: "강점 · 가치",
      chapter: "1부 · 나의 강점 지도",
      steps: [
        { type: "intro", title: "나를 움직이는 가치와 강점",
          body: "이번 주는 「나의 가치 여정」을 직접 다녀오는 것부터 시작해요. 단어를 고르고 좁히다 보면 지금의 나를 관통하는 가치가 남아요. 그다음 그 가치를 내 삶으로 끌어와 곱씹어요." },
        { type: "journey", id: "w3_journey", title: "나의 가치 여정 다녀오기",
          url: "https://word-journey.site/",
          intro: "아래 버튼으로 「나의 가치 여정」에 다녀와요. 천천히 단어를 골라 좁히면, 지금 나를 관통하는 가치 다섯 개가 남아요.",
          linkLabel: "나의 가치 여정 다녀오기",
          bring: "다녀와서, 거기서 나온 가치 다섯 개를 여기에 옮겨 적어요.",
          where: "이 가치들이 내 일상 어디에서 보이나요? (혹은 어디서 안 지켜지나요?)",
          surprise: "다섯 개 중 의외였던 가치 하나 — 왜 의외였나요?" },
        { type: "text", id: "w3_easy", multiline: true, title: "남들은 어려워하는데 나는 비교적 쉬운 일", hint: "사소해 보여도 괜찮아요." },
        { type: "text", id: "w3_thank", multiline: true, title: "사람들이 나에게 자주 부탁하거나 고마워하는 것" },
        { type: "choices", id: "w3_env", multi: true, allowOther: true, title: "내가 잘 되는 환경",
          options: ["혼자","함께","조용한 곳","북적이는 곳","마감 있음","마감 없음","아침형","밤형","계획적","즉흥적"] },
        { type: "promptForge", id: "w3_ai", title: "AI와 함께 곱씹기 · 프롬프트 만들기",
          intro: "지금까지 1부에 적은 내용을 모아, AI에게 물어볼 프롬프트를 만들었어요. 복사해서 ChatGPT나 Claude에 붙여넣고, 돌아온 답을 다음 장에서 곱씹어요.",
          system: "너는 따뜻하지만 솔직한 자기탐구 코치야. 아래는 내가 나를 알아가며 적은 1부 기록이야. (1) 여기서 보이는 나의 강점과 작동방식 패턴, (2) 내가 스스로 과소평가하는 것 같은 점, (3) 내가 더 깊이 생각해볼 질문 3가지를 짚어줘. 단정짓지 말고, 내가 곱씹을 수 있게 말해줘.",
          collect: [
            { label: "나는 이렇게 작동한다", from: "w2_summary" },
            { label: "집중이 잘 될 때", from: "w2_focus_when" },
            { label: "시간 가는 줄 모르는 일", from: "w2_flow" },
            { label: "충전되는 것 / 방전되는 것", from: "w2_recharge" },
            { label: "나를 관통하는 가치", from: "w3_journey" },
            { label: "남들은 어려운데 나는 쉬운 일", from: "w3_easy" },
            { label: "고마워하는 것", from: "w3_thank" },
            { label: "잘 되는 환경", from: "w3_env" }
          ] },
        { type: "reframe", id: "w3_reframe", title: "AI와 함께 곱씹기 · 내 걸로 만들기",
          hint: "AI 답을 그대로 믿지 말고, 내 걸로 소화하는 게 핵심이에요. AI는 내가 준 것만 비춰줄 뿐이에요." }
      ],
      meetup: {
        discuss: [
          "가치 여정에서 나온 다섯 가치 중, 의외였던 것은?",
          "강점인데 내가 당연하게 여겨서 안 쓰고 있는 건 없나요?",
          "친구가 써준 단어 중, 내가 전혀 몰랐던 나의 강점은?"
        ],
        activity: [
          "각자 「나의 가치 여정」 결과(다섯 가치)를 공유하고, 왜 그게 남았는지 한마디씩.",
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
          hint: "AI가 비춰준 것 중 내게 진짜인 것만 남겨요." }
      ],
      meetup: {
        discuss: [
          "내 레이더에서 가장 채워진 영역 / 가장 빈 영역은? 예상과 같았나요?",
          "지금 가장 채우고 싶은 영역에 마음이 가는 이유는?"
        ],
        activity: [
          "각자 레이더 그림을 공유해요.",
          "함께 만다라트 만들기 — 한 명씩 가운데 목표를 정하면, 나머지가 둘레 8칸 아이디어를 보태줘요.",
          "영역 하나를 골라, 그게 '이상적'이면 어떤 모습일지 돌아가며 수다 떨어요."
        ]
      }
    }
  ],
  locked: [
    { badge: "2달차", title: "내가 원하는 걸 찾는다", desc: "하고 싶은 것·삶의 방향을 찾아가요 — 곧 열려요" },
    { badge: "3달차", title: "파고들어 책으로", desc: "비전을 세우고 작게 실험해 완성해요 — 곧 열려요" }
  ]
};
