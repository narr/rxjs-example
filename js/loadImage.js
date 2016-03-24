import $ from 'jquery';
import Rx from 'rxjs/Rx';
import StackBlur from '../lib/StackBlur.js';

const thumbnailPath = 'res/imgs/thumbnail.jpg';
const thumbnail = new Image();
let thumbnailLoaded;
thumbnail.src = thumbnailPath;
thumbnail.onload = () => {
  thumbnailLoaded = true;
};
const $image = $('<img alt="image" class="progressiveMedia-image">');

const imgClick = Rx.Observable.fromEvent($('.progressiveMedia'), 'click');
const imgClickSub = imgClick.subscribe(() => {
  if (thumbnailLoaded) {
    console.log('thumbnailLoaded..!!');
    imgClickSub.unsubscribe();

    const thumbnailWidth = thumbnail.naturalWidth;
    const thumbnailHeight = thumbnail.naturalHeight;
    const $canvas = $(
      `<canvas class="progressiveMedia-canvas"
        width="${thumbnailWidth}" height="${thumbnailHeight}">`
    );
    // Change this value to adjust the amount of blur
    const canvas = $canvas[0];
    const canvasContext = canvas.getContext('2d');
    const BLUR_RADIUS = 4;

    canvasContext.drawImage(thumbnail, 0, 0, thumbnailWidth, thumbnailHeight);
    StackBlur.stackBlurCanvasElRGBA(canvas, 0, 0, thumbnailWidth, thumbnailHeight, BLUR_RADIUS);

    $image.attr('src', 'res/imgs/image.jpg');
    $('.progressiveMedia').append(
      $image, $canvas
      // $canvas
    );
  }
});

const imgLoad = Rx.Observable.fromEvent($image, 'load');
const imgLoadSub = imgLoad.subscribe(() => {
  console.log('imageLoaded..!!');
  imgLoadSub.unsubscribe();
  $('.progressiveMedia-canvas').addClass('is-imageLoaded');
});
