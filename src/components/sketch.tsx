import p5Types from 'p5';

let sat = 100; // saturation max 100
let brt = 100; // brightness max 100
let alph = 10; // alpha max 100
let numbPart = 300; // number of particles
let partStroke = 1; // line width
let fr;

let resizeCount: number;

export const Sketch = (p5: any, p5State: IP5State) => {
  p5.setup = () => {
    p5.createCanvas(window.innerWidth, window.innerHeight);

    p5.colorMode(p5.HSB, 359, 100, 100, 100);

    p5State.cols = Math.floor(p5.width / p5State.scl);
    p5State.rows = Math.floor(p5.height / p5State.scl);
    fr = p5.createP('');

    p5State.flowfield = new Array(p5State.cols * p5State.rows);

    for (var i = 0; i < numbPart; i++) {
      p5State.particles[i] = new Particle(p5);
    }
    p5.background(253);
    setTimeout(() => {
      p5.noLoop();
    }, 10000);
  };

  p5.windowResized = () => {
    if (resizeCount > 1) return;
    resizeCount++;
    p5.resizeCanvas(window.innerWidth, window.innerHeight);
    // myCanvas1.parent('myContainer1');

    p5.background(253);
    p5State.p = 1;
    setTimeout(() => {
      p5.noLoop();
    }, 10000);
  };

  p5.draw = () => {
    if (p5State.p > 0) {
      var yoff = 0;
      for (var y = 0; y < p5State.rows; y++) {
        var xoff = 0;
        for (var x = 0; x < p5State.cols; x++) {
          var index = x + y * p5State.cols;
          var angle =
            p5.noise(xoff, yoff, p5State.zoff) * p5State.angMult +
            p5State.angTurn;

          var v = p5.constructor?.Vector?.fromAngle(angle);
          v?.setMag(1);
          p5State.flowfield[index] = v;
          xoff += p5State.inc;
        }
        yoff += p5State.inc;

        p5State.zoff += p5State.zOffInc;
      }

      for (var i = 0; i < p5State.particles.length; i++) {
        p5State.particles[i].follow(p5State.flowfield);
        p5State.particles[i].update();
        p5State.particles[i].edges();
        p5State.particles[i].show();
      }

      p5State.hu += p5State.colorInc;
      if (p5State.hu > 359) {
        p5State.hu = 0;
      }
    }
  };

  class Particle {
    p: p5Types;
    pos: p5Types.Vector;
    vel: p5Types.Vector;
    acc: p5Types.Vector;
    maxspeed: number;
    prevPos: p5Types.Vector;

    constructor(p: p5Types) {
      this.p = p;
      this.pos = p.createVector(p.random(p.width), p.random(p.height));
      this.vel = p.createVector(0, 0);
      this.acc = p.createVector(0, 0);
      this.maxspeed = 4;
      this.prevPos = this.pos.copy();
    }

    update() {
      this.vel.add(this.acc);
      this.vel.limit(this.maxspeed);
      this.pos.add(this.vel);
      this.acc.mult(0);
    }

    follow(vectors: p5Types.Vector[]) {
      var x = Math.floor(this.pos.x / p5State.scl);
      var y = Math.floor(this.pos.y / p5State.scl);
      var index = x + y * p5State.cols;
      var force = vectors[index];
      this.applyForce(force);
    }

    applyForce(force: p5Types.Vector) {
      this.acc.add(force);
    }

    show() {
      this.p.stroke(p5State.hu, sat, brt, alph);
      this.p.strokeWeight(partStroke);
      this.p.line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
      this.updatePrev();
    }

    updatePrev() {
      this.prevPos.x = this.pos.x;
      this.prevPos.y = this.pos.y;
    }

    edges() {
      if (this.pos.x > this.p.width) {
        this.pos.x = 0;
        this.updatePrev();
      }
      if (this.pos.x < 0) {
        this.pos.x = this.p.width;
        this.updatePrev();
      }
      if (this.pos.y > this.p.height) {
        this.pos.y = 0;
        this.updatePrev();
      }
      if (this.pos.y < 0) {
        this.pos.y = this.p.height;
        this.updatePrev();
      }
    }
  }
};
