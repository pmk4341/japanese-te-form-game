export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function validateQuestions(questions) {
  if (questions.length !== 13) throw new Error('확정된 13개 동사가 필요합니다.');
  if (new Set(questions.map(q => q.verb)).size !== 13) throw new Error('동사가 중복되었습니다.');
  for (const q of questions) {
    if (!q.verb || !q.meaning || !q.explanation || q.options.length !== 4 || new Set(q.options).size !== 4 || !q.options.includes(q.answer)) throw new Error('문제 구성이 올바르지 않습니다.');
  }
}
export class Quiz {
  constructor(questions, random = Math.random, count = 13) {
    validateQuestions(questions);
    if (![10, 13].includes(count)) throw new Error("10문제 또는 13문제를 선택하세요.");
    this.questions = shuffle(questions, random).slice(0, count).map(q => ({...q, options: shuffle(q.options, random)}));
    this.index = 0;
    this.results = [];
  }
  get current() { return this.questions[this.index]; }
  get finished() { return this.index >= this.questions.length; }
  get score() { return this.results.filter(r => r.correct).length; }
  get answered() { return this.results.length > this.index; }
  answer(option) {
    if (this.finished || this.answered || (option !== null && !this.current.options.includes(option))) return null;
    const result = {...this.current, selected: option, correct: option === this.current.answer};
    this.results.push(result);
    return result;
  }
  next() {
    if (this.finished || !this.answered) return false;
    this.index++;
    return true;
  }
}
