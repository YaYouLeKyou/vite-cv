// https://unsplash.com/t/nature

'use strict';

function loadImage(url) {
  return new Promise((loaded, failed) => {
    const img = new Image();
    img.addEventListener('load', () => loaded(img));
    img.src = url;
  });
}

class Picture {
  constructor(url, descrip, fontSize, x, y, z, scale, hp = 50, vp = 500) {
    this.descrip = descrip;
    this.fontSize = fontSize;
    this.scale = scale;
    this.tx = 0;
    this.tz = 0;
    this.x = x;
    this.y = y;
    this.z = z;
    this.hp = hp;
    this.vp = vp;
    this.loaded = false;
    this.img = null;
    loadImage(url).then((img) => {
      this.loaded = true;
      this.img = img;
    });
  }
  computeScaleProjected(z) {
    return 0.8 / (0.8 + z);
  }
  draw(ctx, screenWidth, screenHeight) {
    const z = this.z + (this.tz - 0.5) * 2.6;
    if (z > -0.7) {
      const scaleProjected = this.computeScaleProjected(z);
      const scale = this.scale * scaleProjected;
      const coef = screenWidth / 700;
      const w = this.img.width * scale * coef;
      const h = this.img.height * scale * coef;
      const hw = w * 0.5;
      const hh = h * 0.5;
      const x =
        (this.x * scaleProjected + 0.5 + this.tx * 1.5) * screenWidth - hw;
      const y = (this.y * scaleProjected + 0.5) * screenHeight - hh;
      const hp = this.hp * scale * coef;
      const vp = this.vp * scale * coef;
      if (x > -(w + hp * 2) || x - hp * 2 > screenWidth) {
        ctx.lineWidth = 0.5;
        ctx.fillStyle = '#FFF';
        ctx.globalAlpha = 0.1;
        ctx.fillRect(x - hp, y - vp, w + hp * 2, h + vp * 2);
        ctx.globalAlpha = 1;
        ctx.drawImage(this.img, x, y, w, h);

        const fontSize = this.fontSize * scaleProjected;
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(this.descrip, x, y + h + fontSize * 2);
      }
    }
  }
}

const Control = {
  coef: 30,
  initialize(canvas) {
    this.canvas = canvas;
    canvas.addEventListener('mousemove', this.move.bind(this));
    canvas.addEventListener('touchmove', this.move.bind(this));
    this.px = 0;
    this.py = 0.7;
    this.ex = 0;
    this.ey = 0;
  },
  move(e) {
    let p = e;
    const touchs = e.targetTouches;
    if (touchs) {
      e.preventDefault();
      p = touchs[0];
    }
    const dpr = window.devicePixelRatio || 1;
    this.px = (p.clientX * dpr) / this.canvas.width - 0.5;
    this.py = (p.clientY * dpr) / this.canvas.height - 0.5;
  },
  ease() {
    this.ex += (this.px - this.ex) / this.coef;
    this.ey += (this.py - this.ey) / this.coef;
  },
};

const Canvas = {
  initialize() {
    this.elem = document.querySelector('canvas');
    this.ctx = this.elem.getContext('2d');
    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
    return this.ctx;
  },
  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.width = this.elem.offsetWidth * dpr;
    this.height = this.elem.offsetHeight * dpr;
    this.elem.width = this.width;
    this.elem.height = this.height;
  },
};

const ctx = Canvas.initialize();
Control.initialize(Canvas.elem);
const pictures = [];

pictures.push(
  new Picture('./images/recettes.png', 'API & Librarys', 8, 0.5, 0, 2.7, 0.25)
);
pictures.push(
  new Picture(
    './images/drunkin-alien.png',
    "Drunkin' Alien",
    8,
    -0.5,
    0,
    2.3,
    0.25
  )
);
pictures.push(
  new Picture(
    './images/whatwatch.png',
    'whatwhatch, find your movie',
    8,
    0.5,
    0,
    1.9,
    0.25
  )
);
pictures.push(
  new Picture('./images/watwatch.png', 'WhatWatch', 8, -0.5, 0, 1.5, 0.25)
);
pictures.push(
  new Picture('./images/webstyle.png', 'WebStyle', 8, 0.5, 0, 1.1, 0.25)
);
pictures.push(
  new Picture('./images/abc.jpg', 'ABC Architecture', 8, -0.5, 0, 0.7, 0.25)
);
pictures.push(new Picture('./images/yza.jpg', 'YZA', 8, 0.5, 0, 0.3, 0.25));

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, Canvas.width, Canvas.height);
  Control.ease();
  for (let picture of pictures) {
    if (picture.loaded) {
      picture.tx = Control.ex;
      picture.tz = Control.ey;
      picture.draw(ctx, Canvas.width, Canvas.height);
    }
  }
}
requestAnimationFrame(animate);
