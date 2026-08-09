"use strict";

function initNavToggle(){
  const toggle = document.getElementById("navToggle");
  const drawer = document.getElementById("navDrawer");
  const scrim = document.getElementById("navScrim");
  const links = Array.from(drawer.querySelectorAll("a"));
  let previouslyFocused = null;

  const setOpen = (isOpen) => {
    drawer.classList.toggle("open",isOpen);
    scrim.classList.toggle("open",isOpen);
    toggle.setAttribute("aria-expanded",String(isOpen));
    toggle.setAttribute("aria-label",isOpen ? "メニューを閉じる" : "メニューを開く");
    drawer.setAttribute("aria-hidden",String(!isOpen));

    if(isOpen){
      previouslyFocused = document.activeElement;
      (links[0] || drawer).focus();
    }else if(previouslyFocused instanceof HTMLElement){
      previouslyFocused.focus();
    }
  };

  toggle.addEventListener("click",() => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  scrim.addEventListener("click",() => setOpen(false));
  links.forEach(link => link.addEventListener("click",() => setOpen(false)));

  document.addEventListener("keydown",event => {
    if(event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true"){
      setOpen(false);
      return;
    }

    if(event.key !== "Tab" || toggle.getAttribute("aria-expanded") !== "true" || links.length === 0){
      return;
    }

    const first = links[0];
    const last = links[links.length - 1];

    if(event.shiftKey && document.activeElement === first){
      event.preventDefault();
      last.focus();
    }else if(!event.shiftKey && document.activeElement === last){
      event.preventDefault();
      first.focus();
    }
  });
}

function initImageProtection(){
  document.addEventListener("contextmenu",event => {
    if(event.target.closest("img")){
      event.preventDefault();
    }
  });

  document.addEventListener("dragstart",event => {
    if(event.target.closest("img")){
      event.preventDefault();
    }
  });
}

function initReveal(){
  const targets = document.querySelectorAll(".reveal");

  if(!("IntersectionObserver" in window)){
    targets.forEach(target => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.12});

  targets.forEach(target => observer.observe(target));
}

function initStarfield(){
  const container = document.getElementById("stars");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  container.appendChild(canvas);

  let stars = [];
  let frame = 0;
  let animationId = null;

  function resize(){
    const ratio = Math.min(window.devicePixelRatio || 1,2);
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio,0,0,ratio,0,0);

    const count = Math.min(
      140,
      Math.floor((window.innerWidth * window.innerHeight) / 9000)
    );

    stars = Array.from({length:count},() => ({
      x:Math.random() * window.innerWidth,
      y:Math.random() * window.innerHeight,
      r:Math.random() * 1.4 + .3,
      baseAlpha:Math.random() * .6 + .2,
      phase:Math.random() * Math.PI * 2,
      speed:Math.random() * .015 + .005,
      gold:Math.random() < .15
    }));
  }

  function renderFrame(){
    context.clearRect(0,0,window.innerWidth,window.innerHeight);

    stars.forEach(star => {
      const twinkle = reduceMotion
        ? .65
        : Math.sin(frame * star.speed + star.phase) * .35 + .65;

      context.beginPath();
      context.arc(star.x,star.y,star.r,0,Math.PI * 2);
      context.fillStyle = star.gold
        ? `rgba(216,177,104,${star.baseAlpha * twinkle})`
        : `rgba(230,222,250,${star.baseAlpha * twinkle})`;
      context.fill();
    });
  }

  function draw(){
    frame += 1;
    renderFrame();
    animationId = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize",() => {
    resize();
    if(reduceMotion){
      renderFrame();
    }
  });

  if(reduceMotion){
    renderFrame();
  }else{
    animationId = requestAnimationFrame(draw);

    document.addEventListener("visibilitychange",() => {
      if(document.hidden && animationId !== null){
        cancelAnimationFrame(animationId);
        animationId = null;
      }else if(!document.hidden && animationId === null){
        animationId = requestAnimationFrame(draw);
      }
    });
  }
}

document.addEventListener("DOMContentLoaded",() => {
  initNavToggle();
  initImageProtection();
  initReveal();
  initStarfield();
});
