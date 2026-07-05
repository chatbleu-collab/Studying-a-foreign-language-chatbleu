/*
 * data/curriculum.ts — 커리큘럼 데이터
 * 목적: 영어(A0~B2)·일본어(N5~N2) 단원 정의. 가이드 레슨/오프라인 대화/신규 어휘 공급원.
 * 의존성: types/models.ts
 * 확장 방법(다음 세션): UNITS 배열에 CurriculumUnit 객체를 추가하면 자동으로
 *   가이드 레슨 목록·오프라인 대화·어휘 학습에 반영된다. id 규칙: `${lang}-${level소문자}-${slug}`.
 * 현재 상태: A0/A1/N5는 스크립트까지 완전 구현, 상위 레벨은 어휘·문형 중심(스크립트 축약).
 */
import { CurriculumUnit, Language, LevelCode } from '../types/models';

export const UNITS: CurriculumUnit[] = [
  // ─────────────────── 영어 A0 ───────────────────
  {
    id: 'en-a0-greetings', language: 'en', level: 'A0', title: '인사하기', topic: 'Greetings',
    vocab: [
      { word: 'hello', meaning: '안녕하세요', example: 'Hello! Nice to meet you.' },
      { word: 'good morning', meaning: '좋은 아침입니다', example: 'Good morning, teacher.' },
      { word: 'goodbye', meaning: '안녕히 가세요', example: 'Goodbye! See you tomorrow.' },
      { word: 'thank you', meaning: '감사합니다', example: 'Thank you very much.' },
      { word: 'nice to meet you', meaning: '만나서 반갑습니다' }
    ],
    patterns: ['Hello, I am ___.', 'Nice to meet you.', 'How are you? — I am fine.'],
    script: [
      { tutor: 'Hello! How are you today?', tutorKo: '안녕하세요! 오늘 기분이 어때요? ("I am fine" 처럼 답해 보세요)', expect: ['fine', 'good', 'great', 'okay', 'happy', 'tired'], hint: '이렇게 말해 보세요: "I am fine, thank you."' },
      { tutor: 'Good! My name is Emma. What is your name?', tutorKo: '이름을 물었어요. "My name is ___" 로 답하세요.', expect: ['my name is', 'i am', "i'm"], hint: '"My name is ___." 라고 말해 보세요.' },
      { tutor: 'Nice to meet you! Where are you from?', tutorKo: '어디에서 왔는지 물었어요. "I am from Korea." 처럼 답하세요.', expect: ['from', 'korea'], hint: '"I am from Korea." 라고 말해 보세요.' },
      { tutor: 'Wonderful! Korea is a beautiful country. Goodbye for now — say goodbye to me!', tutorKo: '작별 인사를 해 보세요.', expect: ['goodbye', 'bye', 'see you'], hint: '"Goodbye! See you!" 라고 말해 보세요.' }
    ]
  },
  {
    id: 'en-a0-self-intro', language: 'en', level: 'A0', title: '자기소개', topic: 'Self introduction',
    vocab: [
      { word: 'name', meaning: '이름', example: 'My name is Minsu.' },
      { word: 'from', meaning: '~에서 온', example: 'I am from Seoul.' },
      { word: 'live', meaning: '살다', example: 'I live in Anyang.' },
      { word: 'hobby', meaning: '취미', example: 'My hobby is music.' },
      { word: 'job', meaning: '직업', example: 'What is your job?' }
    ],
    patterns: ['I am ___ years old.', 'I live in ___.', 'My hobby is ___.'],
    script: [
      { tutor: 'Let\'s practice! Tell me your name, please.', tutorKo: '이름을 말해 보세요.', expect: ['name', 'i am', "i'm"], hint: '"My name is ___." 라고 말해 보세요.' },
      { tutor: 'Great! Where do you live?', tutorKo: '어디에 사는지 물었어요. "I live in ___." 로 답하세요.', expect: ['live', 'in'], hint: '"I live in Anyang." 처럼 답해 보세요.' },
      { tutor: 'Nice! What is your hobby?', tutorKo: '취미를 물었어요. "My hobby is ___." 로 답하세요.', expect: ['hobby', 'like', 'music', 'travel', 'photo', 'game'], hint: '"My hobby is music." 처럼 답해 보세요.' },
      { tutor: 'That sounds fun! You did a great self-introduction today.', tutorKo: '자기소개 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'en-a0-numbers', language: 'en', level: 'A0', title: '숫자와 나이', topic: 'Numbers',
    vocab: [
      { word: 'one / two / three', meaning: '1 / 2 / 3' },
      { word: 'ten / twenty / thirty', meaning: '10 / 20 / 30' },
      { word: 'hundred', meaning: '백(100)', example: 'One hundred people.' },
      { word: 'how many', meaning: '몇 개', example: 'How many apples?' },
      { word: 'age', meaning: '나이', example: 'What is your age?' }
    ],
    patterns: ['How many ___ do you have?', 'I have two ___.', 'I am ___ years old.'],
    script: [
      { tutor: 'Let\'s count! How many fingers do you have?', tutorKo: '손가락이 몇 개인지 답하세요. (ten)', expect: ['ten', '10'], hint: '"I have ten fingers." 라고 답해 보세요.' },
      { tutor: 'Correct! Now, how many people are in your family?', tutorKo: '가족이 몇 명인지 숫자로 답하세요.', expect: ['one', 'two', 'three', 'four', 'five', 'six', '2', '3', '4', '5', '6'], hint: '"There are four people." 처럼 답해 보세요.' },
      { tutor: 'Good job with numbers today!', tutorKo: '숫자 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'en-a0-time', language: 'en', level: 'A0', title: '시간 말하기', topic: 'Time',
    vocab: [
      { word: "o'clock", meaning: '~시 정각', example: "It is three o'clock." },
      { word: 'half past', meaning: '~시 반', example: 'Half past seven.' },
      { word: 'morning / afternoon / evening', meaning: '아침 / 오후 / 저녁' },
      { word: 'today / tomorrow', meaning: '오늘 / 내일' },
      { word: 'what time', meaning: '몇 시', example: 'What time is it?' }
    ],
    patterns: ['What time is it? — It is ___.', 'I get up at ___.'],
    script: [
      { tutor: 'What time is it now? Look at your clock!', tutorKo: '지금 몇 시인지 "It is ___ o\'clock" 으로 답하세요.', expect: ["o'clock", 'it is', "it's"], hint: '"It is nine o\'clock." 처럼 답해 보세요.' },
      { tutor: 'Thank you! What time do you get up in the morning?', tutorKo: '아침에 몇 시에 일어나는지 답하세요.', expect: ['get up', 'at', 'six', 'seven', 'eight'], hint: '"I get up at seven." 처럼 답해 보세요.' },
      { tutor: 'Great! Time practice is done for today.', tutorKo: '시간 표현 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'en-a0-family', language: 'en', level: 'A0', title: '가족 소개', topic: 'Family',
    vocab: [
      { word: 'father / mother', meaning: '아버지 / 어머니' },
      { word: 'brother / sister', meaning: '형제 / 자매' },
      { word: 'son / daughter', meaning: '아들 / 딸' },
      { word: 'wife / husband', meaning: '아내 / 남편' },
      { word: 'family', meaning: '가족', example: 'I love my family.' }
    ],
    patterns: ['This is my ___.', 'I have a ___.', 'My ___ is kind.'],
    script: [
      { tutor: 'Tell me about your family. Who is in your family?', tutorKo: '가족 구성원을 말해 보세요. "I have a ___" 형태로.', expect: ['have', 'family', 'wife', 'husband', 'son', 'daughter', 'mother', 'father'], hint: '"I have a wife and a son." 처럼 답해 보세요.' },
      { tutor: 'That is a lovely family! Is your family kind?', tutorKo: 'Yes/No 로 답하고 한 문장 덧붙여 보세요.', expect: ['yes', 'kind', 'no'], hint: '"Yes, my family is very kind." 처럼 답해 보세요.' },
      { tutor: 'Wonderful! Family words are done for today.', tutorKo: '가족 표현 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'en-a0-food', language: 'en', level: 'A0', title: '음식 말하기', topic: 'Food',
    vocab: [
      { word: 'breakfast / lunch / dinner', meaning: '아침 / 점심 / 저녁 식사' },
      { word: 'delicious', meaning: '맛있는', example: 'This is delicious!' },
      { word: 'hungry', meaning: '배고픈', example: 'I am hungry.' },
      { word: 'water', meaning: '물', example: 'Water, please.' },
      { word: 'favorite', meaning: '가장 좋아하는', example: 'My favorite food is kimchi.' }
    ],
    patterns: ['I like ___.', 'My favorite food is ___.', 'I am hungry.'],
    script: [
      { tutor: 'I am hungry! What is your favorite food?', tutorKo: '"My favorite food is ___" 로 답하세요.', expect: ['favorite', 'like', 'food'], hint: '"My favorite food is bulgogi." 처럼 답해 보세요.' },
      { tutor: 'Yummy! What did you eat for breakfast?', tutorKo: '아침에 먹은 것을 말해 보세요. (I ate ___)', expect: ['ate', 'eat', 'rice', 'bread', 'egg', 'coffee'], hint: '"I ate rice and soup." 처럼 답해 보세요.' },
      { tutor: 'Sounds delicious! Food practice is done.', tutorKo: '음식 표현 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'en-a0-shopping', language: 'en', level: 'A0', title: '쇼핑 기초', topic: 'Shopping',
    vocab: [
      { word: 'how much', meaning: '얼마', example: 'How much is this?' },
      { word: 'expensive / cheap', meaning: '비싼 / 싼' },
      { word: 'buy', meaning: '사다', example: 'I want to buy this.' },
      { word: 'money', meaning: '돈' },
      { word: 'this / that', meaning: '이것 / 저것' }
    ],
    patterns: ['How much is this?', 'I want to buy ___.', 'It is too expensive.'],
    script: [
      { tutor: 'Welcome to my shop! What do you want to buy?', tutorKo: '"I want to buy ___" 로 답하세요.', expect: ['want', 'buy'], hint: '"I want to buy a bag." 처럼 답해 보세요.' },
      { tutor: 'Good choice! It is 50 dollars. Is it expensive or cheap?', tutorKo: 'expensive(비싸다) 또는 cheap(싸다)로 답하세요.', expect: ['expensive', 'cheap'], hint: '"It is too expensive!" 라고 말해 보세요.' },
      { tutor: 'Haha, OK! Special price for you. Shopping practice is done!', tutorKo: '쇼핑 표현 연습 완료!', expect: [] }
    ]
  },
  // ─────────────────── 영어 A1 ───────────────────
  {
    id: 'en-a1-routine', language: 'en', level: 'A1', title: '하루 일과', topic: 'Daily routines',
    vocab: [
      { word: 'usually', meaning: '보통', example: 'I usually get up at 7.' },
      { word: 'wake up', meaning: '잠에서 깨다' },
      { word: 'go to work', meaning: '일하러 가다' },
      { word: 'take a shower', meaning: '샤워하다' },
      { word: 'go to bed', meaning: '자러 가다' }
    ],
    patterns: ['I usually ___ at ___.', 'After that, I ___.', 'Before ___, I ___.'],
    script: [
      { tutor: 'Tell me about your morning. What do you usually do first?', tutorKo: '아침에 보통 제일 먼저 하는 일을 말해 보세요.', expect: ['wake', 'get up', 'usually', 'coffee', 'shower'], hint: '"I usually wake up at seven and drink coffee." 처럼 답해 보세요.' },
      { tutor: 'Nice routine! And what do you do in the evening?', tutorKo: '저녁 일과를 두 문장으로 말해 보세요.', expect: ['dinner', 'watch', 'read', 'walk', 'bed'], hint: '"I eat dinner and watch TV. Then I go to bed." 처럼 답해 보세요.' },
      { tutor: 'Very good! You described your day well.', tutorKo: '일과 표현 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'en-a1-travel', language: 'en', level: 'A1', title: '여행 표현', topic: 'Travel',
    vocab: [
      { word: 'ticket', meaning: '표', example: 'One ticket to Busan, please.' },
      { word: 'reservation', meaning: '예약', example: 'I have a reservation.' },
      { word: 'airport / station', meaning: '공항 / 역' },
      { word: 'How can I get to ___?', meaning: '___에 어떻게 가나요?' },
      { word: 'sightseeing', meaning: '관광' }
    ],
    patterns: ['I want to go to ___.', 'How can I get to ___?', 'One ticket, please.'],
    script: [
      { tutor: 'You are at the station. Ask me how to get to the museum!', tutorKo: '"How can I get to ___?" 를 사용해 질문하세요.', expect: ['how can i get', 'where is', 'museum'], hint: '"How can I get to the museum?" 라고 물어 보세요.' },
      { tutor: 'Take bus number 5. It takes ten minutes. Now buy a ticket from me!', tutorKo: '표를 사는 말을 해 보세요.', expect: ['ticket', 'please', 'one'], hint: '"One ticket, please." 라고 말해 보세요.' },
      { tutor: 'Here you are! Have a nice trip. Travel practice is done!', tutorKo: '여행 표현 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'en-a1-restaurant', language: 'en', level: 'A1', title: '식당에서', topic: 'Restaurants',
    vocab: [
      { word: 'menu', meaning: '메뉴', example: 'Can I see the menu?' },
      { word: 'order', meaning: '주문하다', example: 'I would like to order.' },
      { word: 'recommend', meaning: '추천하다', example: 'What do you recommend?' },
      { word: 'bill / check', meaning: '계산서', example: 'Check, please.' },
      { word: 'I would like ___', meaning: '___를 주세요(정중)' }
    ],
    patterns: ['I would like ___, please.', 'What do you recommend?', 'Can I have the bill?'],
    script: [
      { tutor: 'Welcome to Emma\'s Restaurant! Are you ready to order?', tutorKo: '"I would like ___" 로 주문해 보세요.', expect: ['i would like', 'order', 'please'], hint: '"I would like pasta, please." 처럼 주문해 보세요.' },
      { tutor: 'Great choice! Anything to drink?', tutorKo: '음료를 주문해 보세요.', expect: ['water', 'coffee', 'juice', 'cola', 'tea', 'please'], hint: '"Water, please." 라고 말해 보세요.' },
      { tutor: 'Coming right up! Now ask me for the bill.', tutorKo: '계산서를 요청하세요.', expect: ['bill', 'check'], hint: '"Can I have the bill, please?" 라고 말해 보세요.' },
      { tutor: 'Here it is. Thank you for coming!', tutorKo: '식당 표현 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'en-a1-hobbies', language: 'en', level: 'A1', title: '취미 이야기', topic: 'Hobbies',
    vocab: [
      { word: 'enjoy', meaning: '즐기다', example: 'I enjoy taking photos.' },
      { word: 'weekend', meaning: '주말' },
      { word: 'free time', meaning: '여가 시간' },
      { word: 'interested in', meaning: '~에 관심 있는' },
      { word: 'once a week', meaning: '일주일에 한 번' }
    ],
    patterns: ['In my free time, I ___.', 'I enjoy ___ing.', 'I am interested in ___.'],
    script: [
      { tutor: 'What do you enjoy doing in your free time?', tutorKo: '"I enjoy ___ing" 로 답해 보세요.', expect: ['enjoy', 'like', 'music', 'photo', 'travel', 'walk', 'game'], hint: '"I enjoy taking photos and making music." 처럼 답해 보세요.' },
      { tutor: 'Cool! How often do you do it?', tutorKo: '빈도를 말해 보세요. (every day, once a week...)', expect: ['every', 'once', 'week', 'day', 'sometimes', 'often'], hint: '"I do it almost every day." 처럼 답해 보세요.' },
      { tutor: 'That is a great hobby! Keep it up.', tutorKo: '취미 표현 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'en-a1-questions', language: 'en', level: 'A1', title: '질문 만들기', topic: 'Asking questions',
    vocab: [
      { word: 'who / what / where', meaning: '누가 / 무엇 / 어디' },
      { word: 'when / why / how', meaning: '언제 / 왜 / 어떻게' },
      { word: 'Can you ___?', meaning: '~해 줄 수 있나요?' },
      { word: 'Do you ___?', meaning: '~하나요?' },
      { word: 'again', meaning: '다시', example: 'Can you say that again?' }
    ],
    patterns: ['What is ___?', 'Where do you ___?', 'Can you say that again, please?'],
    script: [
      { tutor: 'Today YOU ask the questions! Ask me where I am from.', tutorKo: '"Where are you from?" 을 물어 보세요.', expect: ['where are you from', 'where'], hint: '"Where are you from?" 라고 물어 보세요.' },
      { tutor: 'I am from London! Now ask me what I like.', tutorKo: '"What do you like?" 를 물어 보세요.', expect: ['what do you like', 'what'], hint: '"What do you like?" 라고 물어 보세요.' },
      { tutor: 'I like tea and books! Great questions today.', tutorKo: '질문 만들기 연습 완료!', expect: [] }
    ]
  },
  // ─────────────────── 영어 A2 ───────────────────
  {
    id: 'en-a2-opinions', language: 'en', level: 'A2', title: '의견 말하기', topic: 'Opinions',
    vocab: [
      { word: 'I think that ___', meaning: '나는 ~라고 생각한다' },
      { word: 'agree / disagree', meaning: '동의하다 / 반대하다' },
      { word: 'in my opinion', meaning: '내 생각에는' },
      { word: 'because', meaning: '왜냐하면' },
      { word: 'important', meaning: '중요한' }
    ],
    patterns: ['In my opinion, ___.', 'I agree because ___.', 'I think ___ is important.'],
    script: [
      { tutor: 'Let\'s share opinions! Do you think smartphones are good for us? Why?', tutorKo: '의견 + because 이유를 말해 보세요.', expect: ['think', 'because', 'agree', 'good', 'bad'], hint: '"I think they are good because we can learn anywhere." 처럼 답해 보세요.' },
      { tutor: 'Interesting point! Some people disagree. What do you say to them?', tutorKo: '반대 의견에 한 문장으로 답해 보세요.', expect: ['but', 'however', 'understand', 'still'], hint: '"I understand, but we can use them wisely." 처럼 답해 보세요.' },
      { tutor: 'Well argued! Opinion practice is done.', tutorKo: '의견 표현 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'en-a2-experiences', language: 'en', level: 'A2', title: '경험 말하기', topic: 'Experiences',
    vocab: [
      { word: 'have been to', meaning: '~에 가 본 적 있다', example: 'I have been to Japan.' },
      { word: 'have tried', meaning: '~해 본 적 있다' },
      { word: 'never', meaning: '한 번도 ~않다' },
      { word: 'last year', meaning: '작년에' },
      { word: 'unforgettable', meaning: '잊을 수 없는' }
    ],
    patterns: ['I have been to ___.', 'I have never ___.', 'It was ___.'],
    script: [
      { tutor: 'Have you ever traveled to another country? Tell me about it!', tutorKo: '"I have been to ___" 로 경험을 말해 보세요.', expect: ['have been', 'went', 'travel', 'never'], hint: '"I have been to Japan. It was wonderful." 처럼 답해 보세요.' },
      { tutor: 'Sounds amazing! What was the best part?', tutorKo: '가장 좋았던 점을 과거형으로 말해 보세요.', expect: ['was', 'food', 'people', 'view', 'beautiful'], hint: '"The food was the best part." 처럼 답해 보세요.' },
      { tutor: 'What a great memory! Experience practice is done.', tutorKo: '경험 표현 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'en-a2-future', language: 'en', level: 'A2', title: '미래 계획', topic: 'Future plans',
    vocab: [
      { word: 'be going to', meaning: '~할 예정이다' },
      { word: 'plan to', meaning: '~할 계획이다' },
      { word: 'someday', meaning: '언젠가' },
      { word: 'goal', meaning: '목표' },
      { word: 'hope', meaning: '바라다', example: 'I hope to visit Europe.' }
    ],
    patterns: ['I am going to ___.', 'I plan to ___ next ___.', 'My goal is to ___.'],
    script: [
      { tutor: 'What are you going to do this weekend?', tutorKo: '"I am going to ___" 로 계획을 말해 보세요.', expect: ['going to', 'plan', 'will'], hint: '"I am going to take photos in the park." 처럼 답해 보세요.' },
      { tutor: 'Nice plan! And what is your big goal this year?', tutorKo: '올해 목표를 말해 보세요.', expect: ['goal', 'want', 'hope', 'app', 'english', 'travel'], hint: '"My goal is to speak English well." 처럼 답해 보세요.' },
      { tutor: 'I believe you can do it! Future practice is done.', tutorKo: '미래 표현 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'en-a2-problems', language: 'en', level: 'A2', title: '문제 해결', topic: 'Problem solving',
    vocab: [
      { word: 'problem', meaning: '문제' },
      { word: 'broken', meaning: '고장 난', example: 'My phone is broken.' },
      { word: 'help', meaning: '돕다', example: 'Could you help me?' },
      { word: 'solution', meaning: '해결책' },
      { word: 'refund', meaning: '환불' }
    ],
    patterns: ['I have a problem with ___.', 'Could you help me?', 'Can I get a refund?'],
    script: [
      { tutor: 'Oh no, your hotel room key does not work! What do you say at the front desk?', tutorKo: '문제를 설명하고 도움을 요청하세요.', expect: ['problem', 'key', 'not work', 'help', 'broken'], hint: '"Excuse me, I have a problem. My key does not work." 처럼 말해 보세요.' },
      { tutor: 'I am so sorry! We will fix it right away. Is there anything else?', tutorKo: '추가 요청을 하나 해 보세요.', expect: ['no', 'yes', 'water', 'towel', 'thank'], hint: '"Yes, can I have more towels, please?" 처럼 답해 보세요.' },
      { tutor: 'Of course! Problem solved. Great job today.', tutorKo: '문제 해결 표현 연습 완료!', expect: [] }
    ]
  },
  // ─────────────────── 영어 B1 ───────────────────
  {
    id: 'en-b1-discussion', language: 'en', level: 'B1', title: '토론 기초', topic: 'Discussions',
    vocab: [
      { word: 'point of view', meaning: '관점' },
      { word: 'on the other hand', meaning: '다른 한편으로는' },
      { word: 'advantage / disadvantage', meaning: '장점 / 단점' },
      { word: 'convince', meaning: '설득하다' },
      { word: 'evidence', meaning: '근거' }
    ],
    patterns: ['From my point of view, ___.', 'On the other hand, ___.', 'The main advantage is ___.'],
    script: [
      { tutor: 'Let\'s discuss: Is it better to live in a city or in the countryside? Give me two reasons.', tutorKo: '관점 + 이유 2개를 말해 보세요.', expect: ['city', 'countryside', 'because', 'first', 'second'], hint: '"I prefer the city because it is convenient. Also, there are more jobs." 처럼 답해 보세요.' },
      { tutor: 'Good reasoning! But the countryside has fresh air and low prices. How do you respond?', tutorKo: '"On the other hand" 등을 써서 반박해 보세요.', expect: ['on the other hand', 'however', 'but', 'agree', 'true'], hint: '"That is true, but I still think..." 처럼 답해 보세요.' },
      { tutor: 'Excellent discussion skills!', tutorKo: '토론 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'en-b1-storytelling', language: 'en', level: 'B1', title: '이야기하기', topic: 'Storytelling',
    vocab: [
      { word: 'once', meaning: '한 번은, 예전에' },
      { word: 'suddenly', meaning: '갑자기' },
      { word: 'in the end', meaning: '결국' },
      { word: 'realize', meaning: '깨닫다' },
      { word: 'incredible', meaning: '믿을 수 없는' }
    ],
    patterns: ['One day, ___.', 'Suddenly, ___.', 'In the end, ___.'],
    script: [
      { tutor: 'Tell me a short story about a memorable day in your life. Start with "One day..."', tutorKo: '3~4문장으로 과거 이야기를 만들어 보세요.', expect: ['one day', 'went', 'was', 'saw'], hint: '"One day, I went to the sea. Suddenly, it rained. In the end, we laughed a lot." 처럼 이야기해 보세요.' },
      { tutor: 'What a story! How did you feel at that moment?', tutorKo: '감정을 과거형으로 표현해 보세요.', expect: ['felt', 'happy', 'surprised', 'excited', 'scared'], hint: '"I felt really surprised but happy." 처럼 답해 보세요.' },
      { tutor: 'You are becoming a great storyteller!', tutorKo: '스토리텔링 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'en-b1-work', language: 'en', level: 'B1', title: '업무 상황', topic: 'Work situations',
    vocab: [
      { word: 'schedule a meeting', meaning: '회의를 잡다' },
      { word: 'deadline', meaning: '마감일' },
      { word: 'in charge of', meaning: '~을 담당하는' },
      { word: 'colleague', meaning: '동료' },
      { word: 'proposal', meaning: '제안서' }
    ],
    patterns: ['I am in charge of ___.', 'Could we schedule a meeting for ___?', 'The deadline is ___.'],
    script: [
      { tutor: 'Imagine we are colleagues. Explain what project you are working on now.', tutorKo: '진행 중인 프로젝트를 2~3문장으로 설명해 보세요.', expect: ['working on', 'project', 'app', 'music', 'in charge'], hint: '"I am working on a language learning app. I am in charge of the design." 처럼 답해 보세요.' },
      { tutor: 'Sounds important! Ask me to schedule a meeting about it.', tutorKo: '회의 일정을 제안해 보세요.', expect: ['schedule', 'meeting', 'could we', 'tomorrow', 'monday'], hint: '"Could we schedule a meeting for tomorrow at 3?" 처럼 물어 보세요.' },
      { tutor: 'Tomorrow at 3 works for me. See you then!', tutorKo: '업무 표현 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'en-b1-news', language: 'en', level: 'B1', title: '뉴스 요약', topic: 'News summaries',
    vocab: [
      { word: 'according to', meaning: '~에 따르면' },
      { word: 'announce', meaning: '발표하다' },
      { word: 'increase / decrease', meaning: '증가하다 / 감소하다' },
      { word: 'recently', meaning: '최근에' },
      { word: 'summary', meaning: '요약' }
    ],
    patterns: ['According to the news, ___.', 'The article says that ___.', 'In summary, ___.'],
    script: [
      { tutor: 'Think of any news you saw recently. Summarize it for me in 2-3 sentences.', tutorKo: '최근 본 뉴스를 "According to..." 로 요약해 보세요.', expect: ['according', 'news', 'said', 'announced'], hint: '"According to the news, a new AI model was announced recently." 처럼 요약해 보세요.' },
      { tutor: 'Thanks for the summary! What is your opinion about it?', tutorKo: '그 뉴스에 대한 의견을 말해 보세요.', expect: ['think', 'opinion', 'interesting', 'important'], hint: '"I think it is an important change because..." 처럼 답해 보세요.' },
      { tutor: 'Well summarized and well argued!', tutorKo: '뉴스 요약 연습 완료!', expect: [] }
    ]
  },
  // ─────────────────── 영어 B2 ───────────────────
  {
    id: 'en-b2-debate', language: 'en', level: 'B2', title: '디베이트', topic: 'Debates',
    vocab: [
      { word: 'furthermore', meaning: '게다가' },
      { word: 'counterargument', meaning: '반론' },
      { word: 'compelling', meaning: '설득력 있는' },
      { word: 'nevertheless', meaning: '그럼에도 불구하고' },
      { word: 'to sum up', meaning: '요약하자면' }
    ],
    patterns: ['While it is true that ___, ___.', 'A compelling reason is ___.', 'To sum up, ___.'],
    script: [
      { tutor: 'Debate topic: "AI will replace most human jobs." Take a side and defend it with structured arguments.', tutorKo: '입장 + 근거 2개 + 예상 반론 대응까지 시도해 보세요.', expect: ['agree', 'disagree', 'first', 'furthermore', 'however'], hint: '"I partly agree. First... Furthermore... However, new jobs will also appear." 구조로 말해 보세요.' },
      { tutor: 'Strong arguments! Now give me one counterargument against your own position.', tutorKo: '자기 입장에 대한 반론을 하나 제시해 보세요.', expect: ['counterargument', 'however', 'on the other hand', 'some people'], hint: '"On the other hand, some people argue that..." 처럼 답해 보세요.' },
      { tutor: 'That is advanced debating. Impressive!', tutorKo: '디베이트 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'en-b2-presentation', language: 'en', level: 'B2', title: '프레젠테이션', topic: 'Presentations',
    vocab: [
      { word: "today I'd like to talk about", meaning: '오늘 ~에 대해 말씀드리려 합니다' },
      { word: 'moving on to', meaning: '다음으로 넘어가서' },
      { word: 'as you can see', meaning: '보시다시피' },
      { word: 'in conclusion', meaning: '결론적으로' },
      { word: 'Q and A', meaning: '질의응답' }
    ],
    patterns: ["Today I'd like to talk about ___.", 'Moving on to ___.', 'In conclusion, ___.'],
    script: [
      { tutor: 'Give me a 1-minute mini presentation about your favorite project. Use an opening, one main point, and a conclusion.', tutorKo: '서론-본론-결론 구조로 짧은 발표를 해 보세요.', expect: ["i'd like to talk", 'today', 'in conclusion', 'first'], hint: '"Today I\'d like to talk about my music project. The main point is... In conclusion..." 구조로 발표해 보세요.' },
      { tutor: 'Great structure! Here is a Q&A question: what was the biggest challenge?', tutorKo: '가장 어려웠던 점을 답변해 보세요.', expect: ['challenge', 'difficult', 'hardest', 'problem'], hint: '"The biggest challenge was... but I solved it by..." 처럼 답해 보세요.' },
      { tutor: 'You handled the Q&A like a pro!', tutorKo: '프레젠테이션 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'en-b2-complex', language: 'en', level: 'B2', title: '심화 주제', topic: 'Complex topics',
    vocab: [
      { word: 'implication', meaning: '함의, 영향' },
      { word: 'perspective', meaning: '시각' },
      { word: 'trade-off', meaning: '상충 관계' },
      { word: 'sustainable', meaning: '지속 가능한' },
      { word: 'nuance', meaning: '미묘한 차이' }
    ],
    patterns: ['One implication of ___ is ___.', 'From a ___ perspective, ___.', 'There is a trade-off between ___ and ___.'],
    script: [
      { tutor: 'Let\'s go deep: what are the trade-offs of technology making life more convenient?', tutorKo: 'trade-off 표현을 써서 양면을 논해 보세요.', expect: ['trade-off', 'convenient', 'however', 'privacy', 'health'], hint: '"There is a trade-off between convenience and privacy..." 처럼 논해 보세요.' },
      { tutor: 'Thoughtful analysis! Which side of the trade-off do you personally choose, and why?', tutorKo: '개인적 선택과 이유를 말해 보세요.', expect: ['choose', 'personally', 'because', 'value'], hint: '"Personally, I choose... because I value..." 처럼 답해 보세요.' },
      { tutor: 'A nuanced answer. Excellent work!', tutorKo: '심화 토픽 연습 완료!', expect: [] }
    ]
  },

  // ─────────────────── 일본어 N5 ───────────────────
  {
    id: 'ja-n5-kana', language: 'ja', level: 'N5', title: 'かな 기초 (히라가나·가타카나)', topic: 'Hiragana and Katakana',
    vocab: [
      { word: 'あ・い・う・え・お', reading: 'a i u e o', meaning: '기본 모음 5개' },
      { word: 'か・き・く・け・こ', reading: 'ka ki ku ke ko', meaning: 'か행' },
      { word: 'さ・し・す・せ・そ', reading: 'sa shi su se so', meaning: 'さ행' },
      { word: 'アメリカ', reading: 'amerika', meaning: '미국 (가타카나 예)' },
      { word: 'コーヒー', reading: 'koohii', meaning: '커피 (가타카나 예)' }
    ],
    patterns: ['히라가나 = 일본 고유어/문법', '가타카나 = 외래어/강조'],
    script: [
      { tutor: 'こんにちは！「あいうえお」— 따라 읽어 보세요. (romaji: a, i, u, e, o)', tutorKo: '기본 모음 5개를 로마자로 입력해 보세요.', expect: ['aiueo', 'a i u e o', 'あいうえお'], hint: '"a i u e o" 라고 입력해 보세요.' },
      { tutor: 'すばらしい！「コーヒー」는 무슨 뜻일까요?', tutorKo: '가타카나 단어의 뜻을 한국어로 답하세요.', expect: ['커피', 'coffee', 'こーひー'], hint: '외래어 "커피"입니다.' },
      { tutor: 'せいかい！(정답) 오늘의 かな 연습 완료입니다.', tutorKo: 'かな 기초 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'ja-n5-greetings', language: 'ja', level: 'N5', title: '기본 인사', topic: 'Basic greetings',
    vocab: [
      { word: 'こんにちは', reading: 'konnichiwa', meaning: '안녕하세요 (낮)' },
      { word: 'おはようございます', reading: 'ohayou gozaimasu', meaning: '안녕하세요 (아침)' },
      { word: 'ありがとうございます', reading: 'arigatou gozaimasu', meaning: '감사합니다' },
      { word: 'すみません', reading: 'sumimasen', meaning: '실례합니다/죄송합니다' },
      { word: 'はじめまして', reading: 'hajimemashite', meaning: '처음 뵙겠습니다' }
    ],
    patterns: ['はじめまして。___です。', 'よろしくおねがいします。'],
    script: [
      { tutor: 'こんにちは！ (konnichiwa) — 저에게 인사해 보세요!', tutorKo: '"こんにちは" 또는 로마자 "konnichiwa" 로 인사하세요.', expect: ['こんにちは', 'konnichiwa', 'konnichiha'], hint: '"こんにちは (konnichiwa)" 라고 답해 보세요.' },
      { tutor: 'はじめまして。エマです。あなたは？ (하지메마시테, 엠마입니다. 당신은?)', tutorKo: '"___です (desu)" 로 이름을 말해 보세요.', expect: ['です', 'desu'], hint: '"ミンスです (Minsu desu)" 처럼 답해 보세요.' },
      { tutor: 'よろしくおねがいします！ 마지막으로 감사 인사를 해 보세요.', tutorKo: '"ありがとうございます" 를 입력해 보세요.', expect: ['ありがとう', 'arigatou', 'arigato'], hint: '"ありがとうございます (arigatou gozaimasu)" 라고 답해 보세요.' },
      { tutor: 'かんぺき！(완벽) 인사 연습 완료입니다.', tutorKo: '인사 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'ja-n5-daily-vocab', language: 'ja', level: 'N5', title: '일상 어휘', topic: 'Daily vocabulary',
    vocab: [
      { word: 'みず', reading: 'mizu', meaning: '물' },
      { word: 'ごはん', reading: 'gohan', meaning: '밥, 식사' },
      { word: 'いえ', reading: 'ie', meaning: '집' },
      { word: 'ともだち', reading: 'tomodachi', meaning: '친구' },
      { word: 'きょう', reading: 'kyou', meaning: '오늘' }
    ],
    patterns: ['これは ___ です。(이것은 ___입니다)', '___ をください。(___ 주세요)'],
    script: [
      { tutor: '「みず」(mizu)는 무슨 뜻일까요?', tutorKo: '한국어 뜻을 답하세요.', expect: ['물', 'water'], hint: '마시는 "물"입니다.' },
      { tutor: 'せいかい！ 그럼 물을 달라고 해 보세요: 「みずをください」', tutorKo: '"みずをください (mizu o kudasai)" 를 따라 입력하세요.', expect: ['ください', 'kudasai'], hint: '"みずをください" 라고 입력해 보세요.' },
      { tutor: 'はい、どうぞ！(네, 여기요) 일상 어휘 연습 완료입니다.', tutorKo: '일상 어휘 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'ja-n5-grammar', language: 'ja', level: 'N5', title: '필수 문법 (です/ます)', topic: 'Essential grammar',
    vocab: [
      { word: '〜です', reading: 'desu', meaning: '~입니다 (명사문)' },
      { word: '〜ます', reading: 'masu', meaning: '~합니다 (동사 정중형)' },
      { word: '〜は', reading: 'wa', meaning: '~은/는 (주제 조사)' },
      { word: '〜を', reading: 'o', meaning: '~을/를 (목적 조사)' },
      { word: '〜か', reading: 'ka', meaning: '~입니까? (의문)' }
    ],
    patterns: ['わたしは ___ です。', 'ごはんを たべます。', '___ですか。'],
    script: [
      { tutor: '「わたしは かんこくじん です」 = "나는 한국인입니다". 이 문장을 따라 입력해 보세요.', tutorKo: '히라가나 또는 로마자(watashi wa kankokujin desu)로 입력하세요.', expect: ['です', 'desu', 'kankokujin'], hint: '"わたしは かんこくじん です" 를 그대로 입력해 보세요.' },
      { tutor: 'じょうず！(잘했어요) 이번엔 "밥을 먹습니다" — 「ごはんを たべます」를 입력해 보세요.', tutorKo: '동사 ます형 연습입니다.', expect: ['たべます', 'tabemasu'], hint: '"ごはんを たべます (gohan o tabemasu)" 입니다.' },
      { tutor: 'かんぺき！ です/ます 기초 문법 완료입니다.', tutorKo: '필수 문법 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'ja-n5-numbers', language: 'ja', level: 'N5', title: '숫자와 시간', topic: 'Numbers and time',
    vocab: [
      { word: 'いち・に・さん', reading: 'ichi ni san', meaning: '1, 2, 3' },
      { word: 'よん・ご・ろく', reading: 'yon go roku', meaning: '4, 5, 6' },
      { word: 'なんじ', reading: 'nanji', meaning: '몇 시' },
      { word: '〜じ', reading: 'ji', meaning: '~시' },
      { word: 'いま', reading: 'ima', meaning: '지금' }
    ],
    patterns: ['いま なんじですか。', 'さんじです。(3시입니다)'],
    script: [
      { tutor: '1부터 3까지 일본어로 말해 보세요!', tutorKo: '"いち に さん" 또는 로마자로 입력하세요.', expect: ['いちにさん', 'いち に さん', 'ichi ni san', 'ichinisan'], hint: '"ichi, ni, san" 입니다.' },
      { tutor: 'いいですね！ 「いま なんじですか」(지금 몇 시입니까?) — 「〜じです」로 답해 보세요.', tutorKo: '예: "くじです (9시입니다)"', expect: ['じです', 'ji desu', 'jidesu'], hint: '"さんじです (sanji desu)" 처럼 답해 보세요.' },
      { tutor: 'せいかい！ 숫자·시간 연습 완료입니다.', tutorKo: '숫자와 시간 연습 완료!', expect: [] }
    ]
  },
  // ─────────────────── 일본어 N4 ───────────────────
  {
    id: 'ja-n4-conversation', language: 'ja', level: 'N4', title: '일상 회화', topic: 'Daily conversation',
    vocab: [
      { word: 'しゅうまつ', reading: 'shuumatsu', meaning: '주말' },
      { word: 'いそがしい', reading: 'isogashii', meaning: '바쁘다' },
      { word: 'たのしい', reading: 'tanoshii', meaning: '즐겁다' },
      { word: '〜たいです', reading: 'tai desu', meaning: '~하고 싶습니다' },
      { word: '〜ました', reading: 'mashita', meaning: '~했습니다 (과거)' }
    ],
    patterns: ['しゅうまつは なにを しましたか。', '___へ いきました。', '___たいです。'],
    script: [
      { tutor: 'しゅうまつは なにを しましたか。(주말에 무엇을 했나요?)', tutorKo: '"〜ました" 과거형으로 답해 보세요.', expect: ['ました', 'mashita'], hint: '"えいがを みました (영화를 봤습니다)" 처럼 답해 보세요.' },
      { tutor: 'いいですね！ こんど なにを したいですか。(다음에 뭘 하고 싶나요?)', tutorKo: '"〜たいです" 로 희망을 말해 보세요.', expect: ['たいです', 'tai desu', 'taidesu'], hint: '"りょこうに いきたいです (여행 가고 싶습니다)" 처럼 답해 보세요.' },
      { tutor: 'すてきですね！ 일상 회화 연습 완료입니다.', tutorKo: '일상 회화 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'ja-n4-travel', language: 'ja', level: 'N4', title: '여행 일본어', topic: 'Travel',
    vocab: [
      { word: 'えき', reading: 'eki', meaning: '역' },
      { word: 'きっぷ', reading: 'kippu', meaning: '표' },
      { word: 'ホテル', reading: 'hoteru', meaning: '호텔' },
      { word: 'よやく', reading: 'yoyaku', meaning: '예약' },
      { word: '〜まで おねがいします', reading: 'made onegaishimasu', meaning: '~까지 부탁합니다' }
    ],
    patterns: ['きっぷを ください。', 'よやくを おねがいします。', 'えきは どこですか。'],
    script: [
      { tutor: 'ようこそ！ 도쿄역에서 표를 사 봅시다. 「きっぷをください」라고 말해 보세요.', tutorKo: '표 구매 표현 연습입니다.', expect: ['きっぷ', 'kippu', 'ください', 'kudasai'], hint: '"きっぷを ください (kippu o kudasai)" 입니다.' },
      { tutor: 'はい、どうぞ！ 이번엔 호텔 예약: 「よやくを おねがいします」', tutorKo: '예약 표현을 입력해 보세요.', expect: ['よやく', 'yoyaku', 'おねがい', 'onegai'], hint: '"よやくを おねがいします" 입니다.' },
      { tutor: 'かしこまりました！ 여행 일본어 연습 완료입니다.', tutorKo: '여행 표현 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'ja-n4-shopping', language: 'ja', level: 'N4', title: '쇼핑 일본어', topic: 'Shopping',
    vocab: [
      { word: 'いくらですか', reading: 'ikura desu ka', meaning: '얼마입니까?' },
      { word: 'たかい', reading: 'takai', meaning: '비싸다' },
      { word: 'やすい', reading: 'yasui', meaning: '싸다' },
      { word: 'これ・それ・あれ', reading: 'kore sore are', meaning: '이것·그것·저것' },
      { word: 'カード', reading: 'kaado', meaning: '카드' }
    ],
    patterns: ['これは いくらですか。', 'カードで おねがいします。'],
    script: [
      { tutor: 'いらっしゃいませ！ 가격을 물어 보세요: 「これは いくらですか」', tutorKo: '가격 묻기 표현입니다.', expect: ['いくら', 'ikura'], hint: '"これは いくらですか (kore wa ikura desu ka)" 입니다.' },
      { tutor: 'さんぜんえんです。(3000엔입니다) 비싸다고 반응해 보세요!', tutorKo: '"たかい (takai)" 를 사용하세요.', expect: ['たかい', 'takai'], hint: '"ちょっと たかいですね (좀 비싸네요)" 처럼 답해 보세요.' },
      { tutor: 'じゃあ、にせんえんで！(그럼 2000엔에!) 쇼핑 연습 완료입니다.', tutorKo: '쇼핑 표현 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'ja-n4-directions', language: 'ja', level: 'N4', title: '길 묻기', topic: 'Directions',
    vocab: [
      { word: 'みぎ / ひだり', reading: 'migi / hidari', meaning: '오른쪽 / 왼쪽' },
      { word: 'まっすぐ', reading: 'massugu', meaning: '똑바로' },
      { word: 'ちかく', reading: 'chikaku', meaning: '근처' },
      { word: 'どこですか', reading: 'doko desu ka', meaning: '어디입니까?' },
      { word: 'まがってください', reading: 'magatte kudasai', meaning: '돌아 주세요' }
    ],
    patterns: ['えきは どこですか。', 'まっすぐ いって、みぎに まがってください。'],
    script: [
      { tutor: 'すみません — 역이 어디인지 물어 보세요!', tutorKo: '"えきは どこですか" 를 입력해 보세요.', expect: ['どこ', 'doko'], hint: '"えきは どこですか (eki wa doko desu ka)" 입니다.' },
      { tutor: 'まっすぐ いって、みぎに まがってください。(똑바로 가서 오른쪽으로 도세요) — "오른쪽"이 일본어로 뭐였죠?', tutorKo: '한 단어로 답하세요.', expect: ['みぎ', 'migi'], hint: '"みぎ (migi)" 입니다.' },
      { tutor: 'せいかい！ 길 묻기 연습 완료입니다.', tutorKo: '길 묻기 연습 완료!', expect: [] }
    ]
  },
  // ─────────────────── 일본어 N3 ───────────────────
  {
    id: 'ja-n3-extended', language: 'ja', level: 'N3', title: '긴 대화 이어가기', topic: 'Extended conversations',
    vocab: [
      { word: 'それで', reading: 'sorede', meaning: '그래서' },
      { word: 'ところで', reading: 'tokorode', meaning: '그런데 (화제 전환)' },
      { word: '〜と おもいます', reading: 'to omoimasu', meaning: '~라고 생각합니다' },
      { word: '〜そうです', reading: 'sou desu', meaning: '~라고 합니다 (전문)' },
      { word: 'なるほど', reading: 'naruhodo', meaning: '그렇군요' }
    ],
    patterns: ['それで、どうなりましたか。', 'ところで、___は どうですか。'],
    script: [
      { tutor: 'さいきん、なにか おもしろいことが ありましたか。(최근에 재미있는 일 있었나요?)', tutorKo: '과거형 + それで 등 접속사를 써서 2문장 이상 말해 보세요.', expect: ['ました', 'それで', 'mashita', 'sorede'], hint: '"せんしゅう うみへ いきました。それで しゃしんを とりました。" 처럼 이어 보세요.' },
      { tutor: 'なるほど！ ところで、あなたの しゅみは なんですか。(그런데 취미가 뭔가요?)', tutorKo: '취미를 "〜ことです" 형태로 답해 보세요.', expect: ['しゅみ', 'shumi', 'こと', 'koto', 'おんがく', 'ongaku'], hint: '"しゅみは おんがくを つくることです" 처럼 답해 보세요.' },
      { tutor: 'すばらしいですね！ 대화 확장 연습 완료입니다.', tutorKo: '긴 대화 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'ja-n3-opinions', language: 'ja', level: 'N3', title: '의견 말하기', topic: 'Opinions',
    vocab: [
      { word: '〜と おもいます', reading: 'to omoimasu', meaning: '~라고 생각합니다' },
      { word: 'さんせい / はんたい', reading: 'sansei / hantai', meaning: '찬성 / 반대' },
      { word: 'りゆう', reading: 'riyuu', meaning: '이유' },
      { word: 'たしかに', reading: 'tashikani', meaning: '확실히, 분명' },
      { word: '〜べきだ', reading: 'beki da', meaning: '~해야 한다' }
    ],
    patterns: ['わたしは 〜と おもいます。りゆうは 〜からです。'],
    script: [
      { tutor: 'AIで べんきょうするのは いいと おもいますか。(AI로 공부하는 것이 좋다고 생각하나요?)', tutorKo: '"〜と おもいます + りゆうは〜からです" 구조로 답해 보세요.', expect: ['おもいます', 'omoimasu', 'から', 'kara'], hint: '"いいと おもいます。りゆうは いつでも べんきょうできるからです。" 처럼 답해 보세요.' },
      { tutor: 'たしかに！ では、わるいてんも ひとつ いってください。(단점도 하나 말해 주세요)', tutorKo: '단점을 한 문장으로 말해 보세요.', expect: ['でも', 'demo', 'ときどき', 'まちがい', 'machigai'], hint: '"でも、ときどき まちがいも あります" 처럼 답해 보세요.' },
      { tutor: 'バランスのいい いけんですね！ 의견 연습 완료입니다.', tutorKo: '의견 말하기 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'ja-n3-experiences', language: 'ja', level: 'N3', title: '경험 말하기', topic: 'Experiences',
    vocab: [
      { word: '〜たことが あります', reading: 'ta koto ga arimasu', meaning: '~한 적이 있습니다' },
      { word: 'はじめて', reading: 'hajimete', meaning: '처음으로' },
      { word: 'わすれられない', reading: 'wasurerarenai', meaning: '잊을 수 없는' },
      { word: 'けいけん', reading: 'keiken', meaning: '경험' },
      { word: 'かんどうしました', reading: 'kandou shimashita', meaning: '감동했습니다' }
    ],
    patterns: ['にほんへ いったことが あります。', 'はじめて 〜たとき、〜。'],
    script: [
      { tutor: 'にほんへ いったことが ありますか。(일본에 가 본 적 있나요?)', tutorKo: '"〜たことが あります/ありません" 으로 답해 보세요.', expect: ['ことが あります', 'koto ga arimasu', 'ありません', 'arimasen'], hint: '"はい、いったことが あります" 또는 "いいえ、ありません" 으로 답해 보세요.' },
      { tutor: 'わすれられない けいけんを ひとつ おしえてください。(잊을 수 없는 경험을 하나 알려 주세요)', tutorKo: '과거 경험을 2문장으로 말해 보세요.', expect: ['ました', 'mashita', 'とき', 'toki'], hint: '"はじめて うみを みたとき、かんどうしました" 처럼 답해 보세요.' },
      { tutor: 'すてきな けいけんですね！ 경험 연습 완료입니다.', tutorKo: '경험 말하기 연습 완료!', expect: [] }
    ]
  },
  // ─────────────────── 일본어 N2 ───────────────────
  {
    id: 'ja-n2-professional', language: 'ja', level: 'N2', title: '비즈니스 커뮤니케이션', topic: 'Professional communication',
    vocab: [
      { word: 'おせわに なっております', reading: 'osewa ni natte orimasu', meaning: '신세 지고 있습니다 (비즈니스 인사)' },
      { word: 'いただけますか', reading: 'itadakemasu ka', meaning: '해 주실 수 있습니까 (겸양)' },
      { word: 'かくにん', reading: 'kakunin', meaning: '확인' },
      { word: 'しめきり', reading: 'shimekiri', meaning: '마감' },
      { word: 'よろしく おねがいいたします', reading: 'yoroshiku onegai itashimasu', meaning: '잘 부탁드립니다 (격식)' }
    ],
    patterns: ['ごかくにん いただけますか。', 'しめきりは 〜までです。'],
    script: [
      { tutor: 'ビジネスメールの れんしゅうです。「확인해 주실 수 있습니까?」를 겸양 표현으로 말해 보세요.', tutorKo: '"ごかくにん いただけますか" 를 입력해 보세요.', expect: ['かくにん', 'kakunin', 'いただけます', 'itadakemasu'], hint: '"ごかくにん いただけますか" 입니다.' },
      { tutor: 'かんぺきです。では、マナーとして メールの さいごに つける あいさつは？', tutorKo: '격식 마무리 인사를 입력해 보세요.', expect: ['よろしく', 'yoroshiku', 'おねがい', 'onegai'], hint: '"よろしく おねがいいたします" 입니다.' },
      { tutor: 'プロフェッショナル！ 비즈니스 표현 연습 완료입니다.', tutorKo: '비즈니스 커뮤니케이션 연습 완료!', expect: [] }
    ]
  },
  {
    id: 'ja-n2-advanced', language: 'ja', level: 'N2', title: '심화 토론', topic: 'Advanced discussion',
    vocab: [
      { word: '〜に かんして', reading: 'ni kanshite', meaning: '~에 관해서' },
      { word: 'いっぽうで', reading: 'ippou de', meaning: '한편으로' },
      { word: 'かだい', reading: 'kadai', meaning: '과제, 문제' },
      { word: 'かのうせい', reading: 'kanousei', meaning: '가능성' },
      { word: 'けつろん', reading: 'ketsuron', meaning: '결론' }
    ],
    patterns: ['〜に かんして、わたしの けつろんは 〜です。', 'いっぽうで、〜という かだいも あります。'],
    script: [
      { tutor: 'AIぎじゅつに かんして、しゃかいへの えいきょうを ろんじてください。(AI 기술이 사회에 미치는 영향을 논해 주세요)', tutorKo: '장점 + いっぽうで + 과제 구조로 논해 보세요.', expect: ['いっぽう', 'ippou', 'かだい', 'kadai', 'べんり', 'benri'], hint: '"べんりに なる いっぽうで、しごとが へる かだいも あります" 처럼 논해 보세요.' },
      { tutor: 'するどい ぶんせきですね。さいごに、けつろんを ひとことで。(마지막으로 결론을 한마디로)', tutorKo: '"けつろんは〜です" 로 마무리하세요.', expect: ['けつろん', 'ketsuron'], hint: '"けつろんは、バランスが たいせつだと いうことです" 처럼 마무리해 보세요.' },
      { tutor: 'みごとです！ 심화 토론 연습 완료입니다.', tutorKo: '심화 토론 연습 완료!', expect: [] }
    ]
  }
];

/** 언어별 단원 목록 (레벨 순서 유지) */
export function unitsFor(language: Language): CurriculumUnit[] {
  return UNITS.filter((u) => u.language === language);
}

/** 특정 레벨의 단원 목록 */
export function unitsForLevel(language: Language, level: LevelCode): CurriculumUnit[] {
  return UNITS.filter((u) => u.language === language && u.level === level);
}
