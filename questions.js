export const questions = [
  {verb:'書く', kanjiReading:'か', reading:'かく', meaning:'쓰다 · 1그룹', answer:'書いて', options:['書いて','書って','書んで','書きて'], explanation:'「く」로 끝나는 1그룹 동사: く → いて'},
  {verb:'泳ぐ', kanjiReading:'およ', reading:'およぐ', meaning:'헤엄치다 · 1그룹', answer:'泳いで', options:['泳いで','泳いて','泳って','泳ぎて'], explanation:'「ぐ」로 끝나는 1그룹 동사: ぐ → いで'},
  {verb:'話す', kanjiReading:'はな', reading:'はなす', meaning:'말하다 · 1그룹', answer:'話して', options:['話して','話いて','話って','話んで'], explanation:'「す」로 끝나는 1그룹 동사: す → して'},
  {verb:'待つ', kanjiReading:'ま', reading:'まつ', meaning:'기다리다 · 1그룹', answer:'待って', options:['待って','待いて','待ちて','待んで'], explanation:'「う・つ・る」로 끝나는 1그룹 동사: → って'},
  {verb:'飲む', kanjiReading:'の', reading:'のむ', meaning:'마시다 · 1그룹', answer:'飲んで', options:['飲んで','飲って','飲みて','飲いて'], explanation:'「む・ぶ・ぬ」로 끝나는 1그룹 동사: → んで'},
  {verb:'遊ぶ', kanjiReading:'あそ', reading:'あそぶ', meaning:'놀다 · 1그룹', answer:'遊んで', options:['遊んで','遊って','遊びて','遊いて'], explanation:'「む・ぶ・ぬ」로 끝나는 1그룹 동사: → んで'},
  {verb:'買う', kanjiReading:'か', reading:'かう', meaning:'사다 · 1그룹', answer:'買って', options:['買って','買いて','買うて','買んで'], explanation:'「う・つ・る」로 끝나는 1그룹 동사: → って'},
  {verb:'行く', kanjiReading:'い', reading:'いく', meaning:'가다 · 1그룹', answer:'行って', options:['行って','行いて','行きて','行んで'], explanation:'예외를 기억해요! 「いく(行く)」의 て형은 「いって(行って)」입니다.'},
  {verb:'食べる', kanjiReading:'た', reading:'たべる', meaning:'먹다 · 2그룹', answer:'食べて', options:['食べて','食べって','食べりて','食べんで'], explanation:'2그룹 동사: 마지막 「る」를 빼고 「て」를 붙여요.'},
  {verb:'見る', kanjiReading:'み', reading:'みる', meaning:'보다 · 2그룹', answer:'見て', options:['見て','見って','見りて','見んで'], explanation:'2그룹 동사: みる(見る) → み(見) ＋ て → みて(見て)'},
  {verb:'起きる', kanjiReading:'お', reading:'おきる', meaning:'일어나다 · 2그룹', answer:'起きて', options:['起きて','起きって','起きりて','起きんで'], explanation:'2그룹 동사: 마지막 「る」를 빼고 「て」를 붙여요.'},
  {verb:'する', reading:'する', meaning:'하다 · 3그룹', answer:'して', options:['して','すって','すて','しんで'], explanation:'3그룹 불규칙 동사: 「する」는 「して」로 바뀌어요.'},
  {verb:'来る', kanjiReading:'き', reading:'くる', meaning:'오다 · 3그룹', answer:'来て', options:['来て','来って','来りて','来んで'], explanation:'3그룹 불규칙 동사: 「くる(来る)」→「きて(来て)」. 읽기도 바뀌어요!'}
];

// Keep answer IDs unchanged; show readings before the original spelling everywhere.
export function formatForm(question, form) {
  if (!form) return '';
  const reading = form === question.verb ? question.reading
    : question.kanjiReading ? question.kanjiReading + form.slice(1) : form;
  return reading === form ? form : `${reading}(${form})`;
}
