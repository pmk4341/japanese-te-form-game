import test from 'node:test';
import assert from 'node:assert/strict';
import { Quiz, shuffle, validateQuestions } from '../engine.js';
// Neutral fixtures exercise the engine without inventing the user's verb list.
const fixture = Array.from({length:13}, (_, i) => ({verb:`verb-${i}`, meaning:`meaning-${i}`, answer:`answer-${i}`, options:[`answer-${i}`,`wrong-a-${i}`,`wrong-b-${i}`,`wrong-c-${i}`], explanation:`rule-${i}`}));
test('13 unique questions, four unique options and one correct answer are required', () => {
  validateQuestions(fixture);
  assert.throws(() => validateQuestions(fixture.slice(1)));
  assert.throws(() => validateQuestions([...fixture.slice(1), fixture[1]]));
  assert.throws(() => validateQuestions(fixture.map(q => ({...q, options:[q.answer,q.answer,'x','y']}))));
  assert.throws(() => validateQuestions(fixture.map(q => ({...q, answer:'absent'}))));
});
test('all questions score once, invalid input and premature next are ignored', () => {
  const quiz = new Quiz(fixture);
  assert.equal(quiz.next(), false);
  assert.equal(quiz.answer('invalid'), null);
  for (let i=0;i<13;i++) {
    assert.ok(quiz.answer(quiz.current.answer).correct);
    assert.equal(quiz.answer(quiz.current.answer), null);
    assert.equal(quiz.score,i+1);
    assert.equal(quiz.next(),true);
  }
  assert.equal(quiz.finished,true);
  assert.equal(quiz.answer('anything'),null);
  assert.equal(quiz.next(),false);
  assert.equal(quiz.results.length,13);
});
test('incorrect and mixed scores and replay reset', () => {
  for (const expected of [0,6,13]) {
    const quiz = new Quiz(fixture);
    for (let i=0;i<13;i++) {
      quiz.answer(i<expected ? quiz.current.answer : quiz.current.options.find(o=>o!==quiz.current.answer));
      quiz.next();
    }
    assert.equal(quiz.score,expected);
  }
  const fresh = new Quiz(fixture);
  assert.equal(fresh.score,0); assert.equal(fresh.index,0);
});
test('shuffling preserves input, all questions and choices', () => {
  const original = JSON.stringify(fixture);
  const quiz = new Quiz(fixture,()=>0);
  assert.equal(JSON.stringify(fixture), original);
  assert.deepEqual(quiz.questions.map(q=>q.verb).sort(), fixture.map(q=>q.verb).sort());
  for(const q of quiz.questions) assert.deepEqual([...q.options].sort(), [...fixture.find(v=>v.verb===q.verb).options].sort());
  assert.deepEqual(shuffle([],()=>0),[]);
});
import {questions} from '../questions.js';
const expected = {'書く':'書いて','泳ぐ':'泳いで','話す':'話して','待つ':'待って','飲む':'飲んで','遊ぶ':'遊んで','買う':'買って','行く':'行って','食べる':'食べて','見る':'見て','起きる':'起きて','する':'して','来る':'来て'};
test('all 13 confirmed verbs have exactly the approved answers and valid choices', () => {
  validateQuestions(questions);
  assert.deepEqual(Object.fromEntries(questions.map(q=>[q.verb,q.answer])), expected);
  for (const q of questions) {
    assert.equal(q.options.filter(o=>o===expected[q.verb]).length,1);
    assert.ok(q.reading);
    const quiz = new Quiz(questions,()=>0);
    while(quiz.current.verb!==q.verb) { quiz.answer(null); quiz.next(); }
    assert.equal(quiz.answer(q.answer).correct,true);
  }
});
test('10 or 13 unique questions, timeout counts once, all distractors fail', () => {
  for (const count of [10,13]) {
    const quiz = new Quiz(questions,Math.random,count);
    assert.equal(quiz.questions.length,count);
    assert.equal(new Set(quiz.questions.map(q=>q.verb)).size,count);
    assert.equal(quiz.answer(null).correct,false);
    assert.equal(quiz.answer(quiz.current.answer),null);
    assert.equal(quiz.score,0);
  }
  assert.throws(()=>new Quiz(questions,Math.random,12));
  for (const question of questions) for (const wrong of question.options.filter(o=>o!==question.answer)) {
    const quiz = new Quiz(questions,()=>0);
    while(quiz.current.verb!==question.verb) { quiz.answer(null); quiz.next(); }
    assert.equal(quiz.answer(wrong).correct,false);
    assert.equal(quiz.score,0);
  }
});
