const {chromium} = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || (require('node:fs').existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try {
  const {questions,formatForm}=await import('../questions.js');
  for(const [width,height,count] of [[320,568,10],[390,844,13],[430,932,10]]) {
   const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:2});
   const page=await context.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
   await page.goto(process.env.GAME_URL || 'http://127.0.0.1:8010/dist/game.html');
   const fits=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`horizontal overflow at ${width}`);
   await fits();
   assert.equal(await page.locator('.setting span').evaluateAll(nodes=>nodes.every(n=>n.getBoundingClientRect().height>=44)),true);
   await page.getByRole('radio',{name:count===10?'10문제':'전체 13문제',exact:true}).tap();
   await page.getByRole('button',{name:'도전 시작하기'}).tap();
   const seen=new Set(); let correct=0;
   for(let i=0;i<count;i++) {
    const verb=await page.locator('.verb').getAttribute('data-verb'); seen.add(verb);
    const q=questions.find(q=>q.verb===verb);
    await fits();
    assert.equal(await page.locator('.answer').evaluateAll(nodes=>nodes.every(n=>n.getBoundingClientRect().height>=44)),true);
    assert.equal(await page.locator('.answers').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),1);
    if(i===0 && width===390) await page.screenshot({path:'/tmp/te-game-phone.png',fullPage:true});
    const option=i%2===0?q.answer:q.options.find(o=>o!==q.answer);
    if(option===q.answer) correct++;
    await page.getByRole('button',{name:formatForm(q,option),exact:true}).tap();
    await fits();
    // Rotate the phone after answering, then restore portrait.
    if(i===1) {await page.setViewportSize({width:height,height:width}); await fits(); await page.setViewportSize({width,height});}
    await page.getByRole('button',{name:i===count-1?'결과 보기':'다음 문제'}).tap();
   }
   assert.equal(seen.size,count);
   assert.equal(await page.locator('.big').textContent(),`${Math.round(correct/count*100)}점`);
   assert.equal(await page.locator('.review li').count(),count); await fits();
   await page.getByRole('button',{name:'같은 설정으로 다시 도전'}).tap();
   assert.match(await page.locator('.topline').textContent(),new RegExp(`문제 1 / ${count}.*0개 정답`));
   assert.deepEqual(errors,[]);
   console.log(`PASS touch ${width}×${height}: ${count} questions, mixed scoring, results, retry and rotation; no overflow or JS errors.`);
   await context.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
