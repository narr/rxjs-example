import Rx from 'rxjs/Rx';
import $ from 'jquery';


const ANI_DURATION = 100;
const LEFT_MARGIN_TO_CURSOR = 10;
const LEFT_ANI_QUEUE = 'leftAni';
const TOP_ANI_QUEUE = 'topAni';
let waggingDelaySub = {};


// function setLocation(e) {
//   this.style.cssText = `
//     position:absolute;
//     left:${e.clientX}px;
//     top:${e.clientY - this.offsetHeight / 2}px;
//   `;
// }

// function setLeft(x) {
//   this.style.left = `${x}px`;
// }

function setTop(y) {
  this.style.top = `${y - this.offsetHeight / 2}px`;
}

function extractClientX(e) {
  return e.clientX;
}

function extractClientY(e) {
  return e.clientY;
}

function add(x, y) {
  return x + y;
}

function partialAdd(x) {
  return add.bind(null, x);
}

function randomize() {
  return Math.round(40 * Math.random() - 20); // -20 ~ 20
}

function locateAnimate(e) {
  $(this).stop().animate({
    left: e.clientX + LEFT_MARGIN_TO_CURSOR,
    top: e.clientY - this.offsetHeight / 2
  }, {
    duration: ANI_DURATION,
    easing: 'linear'
  });
}

function leftAnimate(x) {
  $(this).stop(LEFT_ANI_QUEUE).animate({
    left: x + LEFT_MARGIN_TO_CURSOR
  }, {
    queue: LEFT_ANI_QUEUE,
    duration: ANI_DURATION,
    easing: 'linear'
  }).dequeue(LEFT_ANI_QUEUE); // dequeue => to start animation immediately
}

function topAnimate(y, Observable) {
  $(this).stop(TOP_ANI_QUEUE).animate({
    top: y - this.offsetHeight / 2
  }, {
    queue: TOP_ANI_QUEUE,
    duration: ANI_DURATION,
    easing: 'linear',
    complete: () => {
      if (Observable) {
        waggingDelaySub = Observable.subscribe(range => {
          setTop.bind(this, add(y, range))();
        });
      }
    }
  }).dequeue(TOP_ANI_QUEUE);
}


const mousemove = Rx.Observable.fromEvent(document, 'mousemove');
const left = mousemove.map(extractClientX);
const top = mousemove.map(extractClientY);


// Update the mouse
const themouse = document.querySelector('#themouse');
const themouseDelay = 50;

mousemove
  .delay(themouseDelay)
  // .subscribe(setLocation.bind(themouse));
  // left.subscribe(setLeft.bind(themouse));
  // top.subscribe(setTop.bind(themouse));
  .subscribe(locateAnimate.bind(themouse));


// Update the tail
const mouseoffset = themouse.offsetWidth;
const tailDelay = 300;
const thetail = document.querySelector('#thetail');

left
  .map(partialAdd(mouseoffset))
  .delay(tailDelay)
  // .subscribe(setLeft.bind(thetail));
  .subscribe(leftAnimate.bind(thetail));

top
  .delay(tailDelay)
  // .subscribe(setTop.bind(thetail));
  .subscribe(topAnimate.bind(thetail));


// Update wagging
const mouseandtailoffset = mouseoffset + thetail.offsetWidth;
const wagDelay = tailDelay * 1.5;
const wagging = document.querySelector('#wagging');
const INTERVAL = 100;

left
  .map(partialAdd(mouseandtailoffset))
  .delay(wagDelay)
  // .subscribe(setLeft.bind(wagging));
  .subscribe(leftAnimate.bind(wagging));

const waggingDelay = Rx.Observable
// https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/interval.md
  .interval(INTERVAL)
  .map(randomize);

top.delay(wagDelay)
// https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/combinelatestproto.md
  // .combineLatest(waggingDelay, add) // this makes wagging forever
  // .subscribe(setTop.bind(wagging));
  .subscribe(y => {
    if (waggingDelaySub.isUnsubscribed === false) {
      waggingDelaySub.unsubscribe();
    }
    topAnimate.bind(wagging, y, waggingDelay)();
  });
