import { Quiz } from './engine.js';
import { questions, formatForm } from './questions.js';
const root = document.querySelector('#game');
let quiz, timer, deadline, timeLabel;
let settings = {count:13, seconds:0};
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function button(text, action, className = 'primary') {
  const node = element('button', className, text);
  node.type = 'button'; node.addEventListener('click', action); return node;
}
function stopTimer() { clearInterval(timer); timer = undefined; }
function startScreen() {
  document.body.classList.remove('playing');
  stopTimer(); quiz = undefined; root.replaceChildren();
  const panel = element('div', 'welcome');
  panel.append(element('span', 'eyebrow', 'LET’S PLAY'), element('h2', '', '오늘은 얼마나 도전할까요?'), element('p', '', '13개 동사로 연습하는 작은 일본어 습관'));
  const form = element('form');
  function choices(legend, name, options, value) {
    const field = element('fieldset'); field.append(element('legend','',legend));
    const row = element('div','settings-row');
    options.forEach(([label, val]) => {
      const wrap = element('label','setting');
      const input = element('input'); input.type = 'radio'; input.name = name; input.value = val; input.checked = value === val;
      wrap.append(input,element('span','',label)); row.append(wrap);
    });
    field.append(row); form.append(field);
  }
  choices('문제 수','count',[['10문제',10],['전체 13문제',13]],settings.count);
  choices('문제마다 제한 시간','seconds',[['시간 제한 없음',0],['10초',10],['20초',20],['30초',30]],settings.seconds);
  const submit = element('button','primary','도전 시작하기 →'); submit.type = 'button'; form.append(submit);
  const begin = event => {
    event.preventDefault();
    settings = {
      count:Number(form.querySelector('input[name="count"]:checked').value),
      seconds:Number(form.querySelector('input[name="seconds"]:checked').value)
    };
    start();
  };
  submit.addEventListener('click', begin);
  form.addEventListener('submit', begin);
  panel.append(form,element('p','hint','문제와 보기는 매번 섞여요 · 틀린 문제도 해설로 배워요'));
  root.append(panel);
}
function start() {
  document.body.classList.add('playing');
  stopTimer(); quiz = new Quiz(questions, Math.random, settings.count); render();
  root.querySelector('button')?.focus();
}
function render() {
  stopTimer(); root.replaceChildren();
  if (quiz.finished) return renderResult();
  const q = quiz.current;
  const top = element('div', 'topline');
  top.append(element('span', '', `문제 ${quiz.index + 1} / ${quiz.questions.length}`), element('span', 'score', `✦ ${quiz.score}개 정답`));
  const track = element('div', 'track');
  track.setAttribute('role', 'progressbar'); track.setAttribute('aria-label', '완료한 문제');
  track.setAttribute('aria-valuenow', quiz.index); track.setAttribute('aria-valuemin', 0); track.setAttribute('aria-valuemax', quiz.questions.length);
  const fill = element('span'); fill.style.width = `${quiz.index / quiz.questions.length * 100}%`; track.append(fill);
  root.append(top, track);
  timeLabel = element('div','timer', settings.seconds ? `남은 시간 ${settings.seconds}초` : '나의 속도로 천천히');
  timeLabel.setAttribute('role','timer'); root.append(timeLabel);
  const verb = element('h2', 'verb', formatForm(q, q.verb)); verb.lang = 'ja'; verb.dataset.verb = q.verb;
  root.append(element('div', 'prompt', '이 동사의 て형은 무엇일까요?'), verb, element('p', 'meaning', q.meaning));
  const answers = element('div', 'answers');
  q.options.forEach((option, index) => {
    const node = button('',() => select(option),'answer'); node.dataset.option = option; node.lang = 'ja';
    const number = element('span','',String(index + 1)); number.setAttribute('aria-hidden','true');
    node.append(number, element('span','option-text',formatForm(q, option))); answers.append(node);
  });
  root.append(answers, element('p', 'hint', '선택지를 누르거나 키보드 1–4로 답해 보세요.'));
  if (settings.seconds) {
    deadline = performance.now() + settings.seconds * 1000;
    timer = setInterval(() => {
      const seconds = Math.max(0, Math.ceil((deadline - performance.now()) / 1000));
      timeLabel.textContent = `남은 시간 ${seconds}초`;
      timeLabel.classList.toggle('urgent', seconds <= 3);
      if (seconds === 0) select(null);
    }, 100);
  }
}
function select(option) {
  if (settings.seconds && performance.now() >= deadline) option = null;
  const result = quiz.answer(option);
  if (!result) return;
  stopTimer();
  if (option === null) timeLabel.textContent = '시간 종료';
  root.querySelectorAll('.answer').forEach(node => {
    node.disabled = true;
    if (node.dataset.option === result.answer) node.classList.add('correct');
    else if (node.dataset.option === option) node.classList.add('wrong');
  });
  root.querySelector('.score').textContent = `✦ ${quiz.score}개 정답`;
  const feedback = element('div', `feedback ${result.correct ? 'good' : 'bad'}`); feedback.setAttribute('role', 'status');
  feedback.append(element('strong', '', result.correct ? '✿ 정답이에요! 잘했어요.' : option === null ? '시간이 끝났어요. 정답을 배워 볼까요?' : '괜찮아요! 함께 기억해 봐요.'), element('div', '', `${formatForm(result, result.verb)} → ${formatForm(result, result.answer)}`), element('div', '', result.explanation));
  const next = button(quiz.index === quiz.questions.length - 1 ? '결과 보기 →' : '다음 문제 →', () => {
    quiz.next(); render(); root.querySelector('button')?.focus();
  });
  root.append(feedback, next); next.focus();
  root.classList.remove('celebrate','encourage'); void root.offsetWidth;
  root.classList.add(result.correct ? 'celebrate' : 'encourage');
}
function renderResult() {
  const panel = element('div', 'result'); panel.setAttribute('aria-live','polite');
  panel.append(element('div', 'result-flower', '🌷'), element('h2', '', '오늘의 도전 완료!'));
  const percent = Math.round(quiz.score / quiz.questions.length * 100);
  const score = element('div', 'big', `${percent}`); score.append(element('small', '', '점')); panel.append(score);
  panel.append(element('p','result-count', `${quiz.questions.length}문제 중 ${quiz.score}개 정답 · 정답률 ${percent}%`));
  panel.append(element('p', '', quiz.score === quiz.questions.length ? '모두 맞혔어요! て형 마스터예요.' : '도전한 만큼 성장했어요. 해설을 읽고 다시 만나 봐요.'));
  const list = element('ul', 'review');
  quiz.results.forEach(r => {
    const item = element('li',r.correct ? 'review-correct' : 'review-wrong');
    item.append(element('strong','',`${r.correct ? '✓' : '↻'} ${formatForm(r, r.verb)} → ${formatForm(r, r.answer)}`));
    if (!r.correct) item.append(element('div','',r.selected === null ? '시간 초과' : `내 답: ${formatForm(r, r.selected)}`));
    item.append(element('div','review-rule',r.explanation)); list.append(item);
  });
  panel.append(list, button('같은 설정으로 다시 도전 ↻',start),button('설정 바꾸기',startScreen,'secondary'));
  root.append(panel);
}
document.addEventListener('keydown', event => {
  if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || !quiz || quiz.finished || quiz.answered) return;
  if (/^[1-4]$/.test(event.key)) { event.preventDefault(); select(quiz.current.options[Number(event.key) - 1]); }
});
startScreen();
