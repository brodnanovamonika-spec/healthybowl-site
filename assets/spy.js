(function(){
var bar=document.createElement('div');bar.className='prog';document.body.appendChild(bar);
var up=document.createElement('button');up.className='totop';up.type='button';up.setAttribute('aria-label','Top');up.innerHTML='&uarr;';document.body.appendChild(up);
up.onclick=function(){window.scrollTo({top:0,behavior:'smooth'})};
var tick=false;
function run(){
  tick=false;
  var h=document.documentElement,y=window.scrollY,max=h.scrollHeight-innerHeight;
  bar.style.width=(max>0?Math.min(100,y/max*100):0)+'%';
  up.classList.toggle('on',y>700);
  var secs=document.querySelectorAll('article section'),cur=null;
  for(var i=0;i<secs.length;i++){var s=secs[i];if(s.offsetParent===null)continue;if(s.getBoundingClientRect().top<=160)cur=s.id}
  var links=document.querySelectorAll('.toc a');
  for(i=0;i<links.length;i++){var on=cur&&links[i].getAttribute('href')==='#'+cur;
    if(on!==links[i].classList.contains('act')){links[i].classList.toggle('act',!!on);
      if(on&&getComputedStyle(document.getElementById('toc')||links[i].parentNode).display==='flex'){var t=links[i].parentNode;t.scrollTo({left:links[i].offsetLeft-24,behavior:'smooth'})}}}
}
function req(){if(!tick){tick=true;requestAnimationFrame(run)}}
addEventListener('scroll',req,{passive:true});addEventListener('resize',req);addEventListener('hashchange',req);
document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.sw'))setTimeout(req,50)});
run();
})();
