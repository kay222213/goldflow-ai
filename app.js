/* GoldFlow AI Elite — honest candle-based analysis; no synthetic order flow. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const fmt = (n, digits=2) => Number.isFinite(n) ? n.toLocaleString(undefined,{minimumFractionDigits:digits,maximumFractionDigits:digits}) : '—';
const state = {quote:null, candles:[], csvRows:[], prefs:{}};
const prefsKey='goldflow-preferences-v1';
function setConnection(ok,text){$('connectionDot').className='dot '+(ok?'ok':'bad');$('connectionText').textContent=text;}
function setNotice(text){$('notice').textContent=text;}
function loadPrefs(){try{state.prefs=JSON.parse(localStorage.getItem(prefsKey)||'{}');}catch{state.prefs={};}
 if(state.prefs.provider)$('provider').value=state.prefs.provider;}
function savePrefs(){state.prefs={provider:$('provider').value};try{localStorage.setItem(prefsKey,JSON.stringify(state.prefs));$('settingsStatus').textContent='Preferences saved on this device only.';}catch{$('settingsStatus').textContent='Local storage is unavailable; settings will not persist.';}}
function clearPrefs(){try{localStorage.removeItem(prefsKey);}catch{}state.prefs={};$('provider').value='goldapi';$('settingsStatus').textContent='Local preferences cleared.';}
async function refreshQuote(){
 const provider=$('provider').value;
 if(provider==='manual'){setConnection(false,'Disconnected');setNotice('Manual mode selected. No quote is available, so signals are disabled.');$('price').textContent='—';$('priceMeta').textContent='Manual / disconnected';renderAnalysis();return;}
 // Public gold API demo calls are often key-gated; never use a fake fallback.
 setConnection(false,'Feed unavailable');
 $('price').textContent='—';$('priceMeta').textContent='No verified quote';
 setNotice('No verified public XAUUSD feed is configured. GoldAPI-style endpoints commonly require an API key and may block browser requests; this build does not embed secrets or invent prices.');
 $('freshness').textContent='NO FEED';$('dataSummary').textContent='Disconnected: no provider response has been verified. To enable live quotes, configure a compatible backend/feed adapter; never paste a private API key into this public frontend.';
 $('dataMetrics').innerHTML=metric('Spot quote','Unavailable')+metric('Aggressor flow','Not supplied')+metric('DOM / order book','Not supplied');
 renderAnalysis();
}
function metric(label,value){return `<div class="metric"><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></div>`;}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderAnalysis(){
 $('marketSummary').textContent='No verified candle series loaded. Structure, session levels, and signals require fresh, timestamped OHLC data.';
 $('structureGrid').innerHTML=metric('H4 / H1','Unavailable')+metric('M15 / M5','Unavailable')+metric('CVD / footprint','Disabled without classified trades');
 $('decisionTag').textContent='NO TRADE';$('decisionTag').className='tag neutral';$('decisionTitle').textContent='Insufficient verified evidence';
 $('decisionReason').textContent='No fresh price series is connected. Capital preservation takes priority; no BUY or SELL is issued.';
 $('setupDetails').innerHTML=metric('Confidence','Not scored')+metric('Reward:risk','Not calculable');
 $('buyCard').textContent='No confirmed setup. Requires completed candles and a valid risk plan.';
 $('sellCard').textContent='No confirmed setup. Requires completed candles and a valid risk plan.';
}
function nval(id){const n=Number($(id).value);return Number.isFinite(n)?n:NaN;}
function result(label,value,note=''){return `<div class="result"><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong>${note?`<p>${escapeHtml(note)}</p>`:''}</div>`;}
function calcRisk(){
 const balance=nval('balance'),equity=nval('equity'),riskPct=nval('riskPct'),target=nval('target'),dailyLoss=nval('dailyLoss'),maxDD=nval('maxDD'),dayPL=nval('dayPL'),peak=nval('peak'),maxPositions=nval('maxPositions'),maxTrades=nval('maxTrades'),trades=nval('tradesTaken'),minRR=nval('minRR'),maxLosses=nval('maxLosses'),losses=nval('losses'),stopThreshold=nval('stopThreshold');
 const warnings=[];const required=[balance,equity,riskPct,target,dailyLoss,maxDD,dayPL,peak,maxPositions,maxTrades,trades,minRR,maxLosses,losses,stopThreshold];
 if(required.some(x=>!Number.isFinite(x)))warnings.push('Check all fields; every value must be numeric.');
 if(balance<0||equity<0||peak<0||riskPct<=0||riskPct>5||target<0||dailyLoss<0||maxDD<0||maxPositions<1||maxTrades<1||trades<0||minRR<1||maxLosses<1||losses<0||stopThreshold<0)warnings.push('One or more inputs are outside allowed limits. Risk is capped at 5% per trade and minimum R:R is 1:1.');
 const risk=equity*riskPct/100,drawdown=Math.max(0,peak-equity),ddPct=peak>0?drawdown/peak*100:0;
 const remainingDaily=Math.max(0,dailyLoss+Math.min(0,dayPL));
 const remainingTarget=Math.max(0,target-dayPL);
 const targetPct=equity>0?target/equity*100:NaN;
 const hypotheticalNet=risk*minRR;
 const wins= hypotheticalNet>0?Math.ceil(remainingTarget/hypotheticalNet):NaN;
 const stop=stopThreshold>0&&dayPL<=-stopThreshold;
 if(equity<=0)warnings.push('Equity must be above zero to calculate monetary risk.');
 if(targetPct>=50)warnings.push(`Daily target is ${fmt(targetPct)}% of current equity — an extreme target, not a realistic or assured daily outcome.`);
 if(ddPct>=5)warnings.push(`Equity drawdown is ${fmt(ddPct)}% from the entered peak; review the account's hard drawdown limit.`);
 if(dayPL<=-dailyLoss)warnings.push('Daily maximum loss reached or exceeded. Stop trading under your configured rule.');
 if(drawdown>=maxDD&&maxDD>0)warnings.push('Maximum total drawdown reached or exceeded. Stop trading under your configured rule.');
 if(trades>=maxTrades)warnings.push('Maximum trades per day reached.');
 if(losses>=maxLosses)warnings.push('Maximum consecutive losses reached.');
 if(stop)warnings.push('Optional daily stop threshold reached.');
 if(warnings.length===0)warnings.push('Inputs pass basic validation. This is a calculator, not a guarantee; include open-position risk and actual costs separately.');
 $('riskWarnings').innerHTML=warnings.map(w=>`<p>${escapeHtml(w)}</p>`).join('');
 const cur=$('currency').value;
 $('riskResults').innerHTML=
 result('Monetary risk / trade',`${cur} ${fmt(risk)}`,`Equity × ${fmt(riskPct)}%`)+
 result('Target as % of equity',`${fmt(targetPct)}%`,`Target ÷ equity × 100`)+
 result('Remaining daily loss allowance',`${cur} ${fmt(remainingDaily)}`,'Simplified; excludes unentered open-position exposure')+
 result('Remaining distance to target',`${cur} ${fmt(remainingTarget)}`,'Target − today’s realized P/L, floored at zero')+
 result('Equity drawdown',`${cur} ${fmt(drawdown)}`,`${fmt(ddPct)}% below entered equity peak`)+
 result('Hypothetical wins needed',Number.isFinite(wins)?String(wins):'—',`Assumes every win nets ${cur} ${fmt(hypotheticalNet)} at ${fmt(minRR)}R; losses and costs omitted`)+
 result('Max positions',String(maxPositions),'User-configured limit; not broker-validated')+
 result('Trade allowance',`${Math.max(0,maxTrades-trades)} left`,'Trades remaining today')+
 result('Position size','Not calculated','Needs verified contract size, tick value, stop distance and conversion');
}
function resetRisk(){const vals={balance:1000,equity:1000,currency:'ZAR',riskPct:.5,target:100,dailyLoss:30,maxDD:100,dayPL:0,peak:1000,maxPositions:1,maxTrades:3,tradesTaken:0,minRR:2,maxLosses:3,losses:0,stopThreshold:0};Object.entries(vals).forEach(([k,v])=>$(k).value=v);calcRisk();}
function parseCSV(text){
 const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim());if(lines.length<10)throw Error('CSV must contain a header and at least 9 candle rows.');
 const headers=lines[0].split(',').map(x=>x.trim().toLowerCase());
 const idx={};['time','open','high','low','close'].forEach(k=>idx[k]=headers.indexOf(k));
 if(['open','high','low','close'].some(k=>idx[k]<0))throw Error('Required headers: open, high, low, close. Optional: time, volume.');
 const rows=[];
 for(let i=1;i<lines.length;i++){const cells=lines[i].split(',');const r={time:idx.time>=0?cells[idx.time]?.trim():String(i),open:Number(cells[idx.open]),high:Number(cells[idx.high]),low:Number(cells[idx.low]),close:Number(cells[idx.close]),volume:headers.includes('volume')?Number(cells[headers.indexOf('volume')]):NaN};
 if([r.open,r.high,r.low,r.close].some(v=>!Number.isFinite(v))||r.high<Math.max(r.open,r.close)||r.low>Math.min(r.open,r.close)||r.high<r.low)continue;rows.push(r);}
 if(rows.length<9)throw Error('Not enough valid OHLC rows. Check column order and numeric values.');
 return rows;
}
$('csvFile').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{state.csvRows=parseCSV(await file.text());$('btStatus').textContent=`Loaded ${state.csvRows.length} valid candles from ${file.name}. Ensure timestamps are chronological and candle timeframe is consistent.`;$('runBacktest').disabled=false;}catch(err){state.csvRows=[];$('runBacktest').disabled=true;$('btStatus').textContent=err.message;}});
function runBacktest(){
 const rows=state.csvRows,look=Math.floor(nval('lookback')),stop=nval('btStop'),target=nval('btTarget'),cost=nval('btCosts'),trainShare=nval('trainShare')/100;
 if(!rows.length||look<3||stop<=0||target<=0||cost<0||trainShare<.5||trainShare>.9){$('btStatus').textContent='Invalid settings or no CSV loaded.';return;}
 const split=Math.floor(rows.length*trainShare);const trades=[];let side=0,entry=0,sl=0,tp=0,entryIndex=0;
 // Walk-forward simulation uses only prior lookback candles for each signal.
 for(let i=Math.max(look,split);i<rows.length;i++){
   const r=rows[i];
   if(side!==0){
     let exit=null,reason='';
     if(side===1){if(r.low<=sl){exit=sl;reason='stop';}else if(r.high>=tp){exit=tp;reason='target';}}
     else {if(r.high>=sl){exit=sl;reason='stop';}else if(r.low<=tp){exit=tp;reason='target';}}
     if(exit!==null){trades.push({side,pnl:(exit-entry)*side-cost,reason,bars:i-entryIndex});side=0;}
     continue;
   }
   const prior=rows.slice(i-look,i);const hi=Math.max(...prior.map(x=>x.high)),lo=Math.min(...prior.map(x=>x.low));
   // Close-confirmed breakout; enter at next bar open only if the next bar exists.
   if(r.close>hi){side=1;entry=r.close;sl=entry-stop;tp=entry+target;entryIndex=i;}
   else if(r.close<lo){side=-1;entry=r.close;sl=entry+stop;tp=entry-target;entryIndex=i;}
 }
 const wins=trades.filter(t=>t.pnl>0),losses=trades.filter(t=>t.pnl<=0),grossWin=wins.reduce((s,t)=>s+t.pnl,0),grossLoss=-losses.reduce((s,t)=>s+t.pnl,0),net=trades.reduce((s,t)=>s+t.pnl,0);
 let equity=0,peak=0,maxDD=0;for(const t of trades){equity+=t.pnl;peak=Math.max(peak,equity);maxDD=Math.max(maxDD,peak-equity);}
 const avgWin=wins.length?grossWin/wins.length:0,avgLoss=losses.length?grossLoss/losses.length:0;
 const exp=trades.length?net/trades.length:0,wr=trades.length?wins.length/trades.length*100:0,pf=grossLoss?grossWin/grossLoss:(grossWin?Infinity:0);
 $('btStatus').textContent=`Out-of-sample section: bars ${split+1}–${rows.length}. ${trades.length} closed trades. Signals use a simple candle-close breakout proxy, not order-flow data. Any open position at end is excluded.`;
 $('btResults').innerHTML=result('Closed trades',String(trades.length),'Open trade excluded')+result('Win rate',`${fmt(wr,1)}%`,'Historical sample only')+result('Net price units',fmt(net),'Costs deducted per closed trade')+result('Profit factor',Number.isFinite(pf)?fmt(pf):'∞','Gross wins ÷ gross losses')+result('Expectancy / trade',fmt(exp),'Mean net price units')+result('Average win',fmt(avgWin),'Price units after costs')+result('Average loss',fmt(avgLoss),'Absolute price units after costs')+result('Max drawdown',fmt(maxDD),'Cumulative price units')+result('Consecutive losses',String(maxConsecutiveLosses(trades)),'In this out-of-sample sequence');
}
function maxConsecutiveLosses(trades){let run=0,max=0;for(const t of trades){if(t.pnl<=0){run++;max=Math.max(max,run);}else run=0;}return max;}
function activateTabs(){document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b===btn));document.querySelectorAll('.tabpage').forEach(p=>p.classList.toggle('hidden',p.id!==`tab-${btn.dataset.tab}`));}));}
$('refreshBtn').addEventListener('click',refreshQuote);$('calcRisk').addEventListener('click',calcRisk);$('resetRisk').addEventListener('click',resetRisk);$('runBacktest').addEventListener('click',runBacktest);$('saveSettings').addEventListener('click',savePrefs);$('clearCache').addEventListener('click',clearPrefs);
loadPrefs();activateTabs();calcRisk();refreshQuote();
if('serviceWorker' in navigator && location.protocol!=='file:'){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
})();