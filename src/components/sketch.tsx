import p5 from 'p5';
import p5Types from 'p5';

let colorInc = 1.5; // Color change speed
let sat = 100; // saturation max 100
let brt = 100; // brightness max 100
let alph = 10; // alpha max 100
let numbPart = 300; // number of particles
let partStroke = 1; // line width
let angMult = 25; // 0.1 = straighter lines; 25+ = sharp curves
let angTurn = 1; // adjust angle for straight lines (after adjusting angMult)
let zOffInc = 0.00001; // speed of vector changes
let inc = 0.1;
let scl = 10;
let cols: number, rows: number;
let zoff = 0;
let fr;
let particles: any[] = [];
let flowfield: p5Types.Vector[];
let hu = 0;
let p = 1;
let parentStyle: CSSStyleDeclaration;
let canvasHeight: number;
let canvasWidth: number;
let audioState: string;
let cnv: any;
let sine: any;

export const sketch: P5jsSketch = (p5, parentRef) => {
  p5.setup = () => {
    if (parentRef) {
      parentStyle = window.getComputedStyle(parentRef);
      canvasWidth = parseInt(parentStyle.width);
      canvasHeight = parseInt(parentStyle.width);
      cnv = p5.createCanvas(canvasWidth, canvasHeight).parent(parentRef);

      p5.colorMode(p5.HSB, 359, 100, 100, 100);

      cols = Math.floor(p5.width / scl);
      rows = Math.floor(p5.height / scl);
      fr = p5.createP('');

      flowfield = new Array(cols * rows);

      for (var i = 0; i < numbPart; i++) {
        particles[i] = new Particle(p5);
      }
      p5.background(253);

      setTimeout(p5.stopDrawing, 20000);
    }

    //   audioState = p5.getAudioContext();
    //   audioState.suspend();
    //   cnv.mouseClicked(() => {
    //     audioState.state !== "running" ? audioState.resume() : null;
    //   });
    // etc....
    //   loadAudio();
  };

  p5.windowResized = () => {
    if (parentRef) {
      parentStyle = window.getComputedStyle(parentRef);
      canvasWidth = parseInt(parentStyle.width);
      canvasHeight = parseInt(parentStyle.width);
      p5.resizeCanvas(canvasWidth, canvasHeight);
      // myCanvas1.parent('myContainer1');

      p5.background(253);
      p = 1;
      setTimeout(p5.stopDrawing, 10000);
    }
  };

  p5.stopDrawing = () => {
    p = p * -1;
  };

  p5.draw = () => {
    if (p > 0) {
      var yoff = 0;
      for (var y = 0; y < rows; y++) {
        var xoff = 0;
        for (var x = 0; x < cols; x++) {
          var index = x + y * cols;
          var angle = p5.noise(xoff, yoff, zoff) * angMult + angTurn;
          var v = p5.Vector?.fromAngle(angle);
          v?.setMag(1);
          flowfield[index] = v;
          xoff += inc;
          // stroke(100, 50);
          // push();
          // translate(x * scl, y * scl);
          // rotate(v.heading());
          // strokeWeight(1);
          // line(0, 0, scl, 0);
          // pop();
        }
        yoff += inc;

        zoff += zOffInc;
      }

      for (var i = 0; i < particles.length; i++) {
        particles[i].follow(flowfield);
        particles[i].update();
        particles[i].edges();
        particles[i].show();
      }

      // fr.html(floor(frameRate()));
      hu += colorInc;
      if (hu > 359) {
        hu = 0;
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
      var x = Math.floor(this.pos.x / scl);
      var y = Math.floor(this.pos.y / scl);
      var index = x + y * cols;
      var force = vectors[index];
      this.applyForce(force);
    }

    applyForce(force: p5Types.Vector) {
      this.acc.add(force);
    }

    show() {
      this.p.stroke(hu, sat, brt, alph);
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
