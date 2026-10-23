const {chromium} = require('playwright');
const assert = require('node:assert/strict');
(async()=> {
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || (require('node:fs').existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), headless:true,args:['--no-sandbox']});
  try {
    const page = await browser.newPage({viewport:{width:1280,height:1000}});
    const errors=[]; page.on('pageerror',error=>errors.push(error.message));
    const base = process.env.GAME_URL || 'http://127.0.0.1:8000';
    const {questions,formatForm}=await import('../questions.js');
    const answers=Object.fromEntries(questions.map(q=>[q.verb,q.answer]));
    await page.goto(base);
    await page.screenshot({path:'/tmp/te-game-start.png',fullPage:true});
    if (await page.locator('#download-game').count()) {
      const pending = page.waitForEvent('download');
      await page.locator('#download-game').click();
      const download = await pending;
      assert.equal(await download.failure(), null);
      assert.equal(download.suggestedFilename(), 'japanese-te-form-game.html');
      await download.saveAs('/tmp/japanese-te-form-game-downloaded.html');
      const fs = require('node:fs');
      const html = fs.readFileSync('/tmp/japanese-te-form-game-downloaded.html','utf8');
      assert.ok(html.startsWith('<!doctype html>'));
      assert.ok(!/<script[^>]*src=|<link[^>]*stylesheet/.test(html));
      if (!process.env.TEST_DOWNLOADED) fs.copyFileSync('/tmp/japanese-te-form-game-downloaded.html',require('node:path').join(__dirname,'../dist/downloaded-game.html'));
    }
    await page.getByRole('button',{name:'도전 시작하기'}).click();
    const seen = new Set();
    for(let i=0;i<13;i++) {
      const verb=await page.locator('.verb').getAttribute('data-verb'); seen.add(verb);
      assert.equal(await page.locator('.answer').count(),4);
      const question = questions.find(q=>q.verb===verb);
      assert.equal(await page.locator('.verb').textContent(),formatForm(question,verb));
      assert.deepEqual((await page.locator('.option-text').allTextContents()).sort(),question.options.map(o=>formatForm(question,o)).sort());
      const correct = page.getByRole('button',{name:formatForm(questions.find(q=>q.verb===verb),answers[verb]),exact:true});
      await correct.click();
      assert.equal(await page.locator('.answer:disabled').count(),4);
      assert.match(await page.locator('.feedback').textContent(),/정답이에요/);
      assert.equal(await page.locator('.answer.correct').evaluate(el=>getComputedStyle(el).animationName),'pop');
      await page.keyboard.press('1');
      assert.equal(await page.locator('.score').textContent(),`✦ ${i+1}개 정답`);
      await page.getByRole('button',{name:i===12?'결과 보기':'다음 문제'}).click();
    }
    assert.equal(seen.size,13);
    assert.match(await page.locator('.big').textContent(),/100/);
    assert.equal(await page.locator('.review li').count(),13);
    await page.screenshot({path:'/tmp/te-game-result.png',fullPage:true});
    await page.getByRole('button',{name:'같은 설정으로 다시 도전'}).click();
    assert.match(await page.locator('.topline').textContent(),/문제 1 \/ 13.*0개 정답/);
    await page.reload();
    await page.getByLabel('10문제',{exact:true}).check();
    await page.getByRole('button',{name:'도전 시작하기'}).click();
    for(let i=0;i<10;i++) {
      const verb=await page.locator('.verb').getAttribute('data-verb');
      const wrong=page.locator('.answer').filter({hasNotText:formatForm(questions.find(q=>q.verb===verb),answers[verb])}).first();
      await wrong.click();
      assert.equal(await page.locator('.answer.wrong').count(),1);
      assert.equal(await page.locator('.answer.correct').count(),1);
      assert.equal(await page.locator('.answer.wrong').evaluate(el=>getComputedStyle(el).animationName),'shake');
      await page.getByRole('button',{name:i===9?'결과 보기':'다음 문제'}).click();
    }
    assert.equal(await page.locator('.big').textContent(),'0점');
    assert.equal(await page.locator('.review-wrong').count(),10);
    await page.getByRole('button',{name:'설정 바꾸기'}).click();
    await page.getByLabel('10초',{exact:true}).check();
    await page.clock.install();
    await page.getByRole('button',{name:'도전 시작하기'}).click();
    await page.clock.fastForward(10100);
    assert.match(await page.locator('.feedback').textContent(),/시간이 끝났어요/);
    assert.equal(await page.locator('.score').textContent(),'✦ 0개 정답');
    await page.clock.fastForward(20000);
    assert.equal(await page.locator('.feedback').count(),1);
    await page.getByRole('button',{name:'다음 문제'}).click();
    assert.match(await page.locator('.timer').textContent(),/10초/);
    const verb=await page.locator('.verb').getAttribute('data-verb');
    const index=await page.locator('.answer').evaluateAll((els,answer)=>els.findIndex(el=>el.dataset.option===answer),answers[verb]);
    await page.keyboard.press(String(index+1));
    await page.clock.fastForward(20000);
    assert.match(await page.locator('.feedback').textContent(),/정답이에요/);
    assert.equal(await page.locator('.score').textContent(),'✦ 1개 정답');
    // Responsive and reduced-motion checks.
    await page.setViewportSize({width:375,height:812});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.reload();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),true);
    await page.getByRole('button',{name:'도전 시작하기'}).click();
    const mobileVerb=await page.locator('.verb').getAttribute('data-verb');
    await page.getByRole('button',{name:formatForm(questions.find(q=>q.verb===mobileVerb),answers[mobileVerb]),exact:true}).click();
    assert.equal(await page.locator('.answer.correct').evaluate(el=>getComputedStyle(el).animationName),'none');
    assert.equal(await page.locator('#game').evaluate(el=>getComputedStyle(el,'::after').display),'none');
    await page.screenshot({path:'/tmp/te-game-mobile.png',fullPage:true});
    assert.deepEqual(errors,[]);
    console.log('Browser checks passed: all 13 correct, 10 wrong, score/reset, timeout, keyboard, animation, mobile, reduced motion; no page errors.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
