/*
------------------------------------------------------------------------
 Orbit library (with MATRIX)

 HTML(JavaScript)

 (c)Ohtani 2025.1
------------------------------------------------------------------------
*/
'use strict'

//----------------------------------------------------------------------
// Orbit
//----------------------------------------------------------------------
class ORBIT extends MATRIX
{
  constructor()
  {
    super();
    this.GM    = 270; // 平均春分点の方向(画面下)
    this.Count =   0; // count
    this.N     =  []; // 平均運動
    this.Q     =  []; // 近点距離
    this.Mat0  =  []; // 行列0
    this.Mat   =  []; // 視点行列
    this.C     =  []; // colot(惑星)
    this.Jo    =  []; // 元期(JD)
    this.A     =  []; // 長半径a
    this.E     =  []; // 離心率e
    this.I     =  []; // 傾斜角i
    this.Oo    =  []; // Ω+ω
    this.O     =  []; // Ω
    this.Mo    =  []; // 元期(平均近点角)Mo
    this.P     =  []; // 周期P
    this.Name  =  []; // 名称
    this.Temp  =   0; // debug
  }
  orbits()
  {
    return this.Count;
  }
  color(i)
  {
    return this.C[i];
  }
  name(i)
  {
    return this.Name[i];
  }
  toRad(d)
  {
    return d * Math.PI / 180;
  }
  toDeg(t)
  {
    return t * 180 / Math.PI;
  }
  fmod(x, y)
  {
    return x - Math.floor(x / y) * y;
  }
  //--------------------------------------------------------------------
  // 離心近点角 tan( u(f)/2 ) = √((1 - e)/(1 + e))tan(f/2)
  // 平均近点角      M(u)     = u - esin(u)  [ e < 0 ]
  //                            (ケプラー方程式)
  //--------------------------------------------------------------------
  #orbitM0(f, e)
  {
    let u;

    u = ((1-e) / (1+e)) * Math.tan(f / 2);
    u = Math.atan( Math.sqrt(u) ) * 2;
    return u - e * Math.sin(u);
  }
  //--------------------------------------------------------------------
  // 離心近点角 u(f) = θ√(2q)
  //            θ(f) = u/√(2q) = tan(f/2)
  // 平均近点角 M(u) = u^3/6 + qu  [ e = 1 ]
  //            M'(θ) = M/q^(3/2) = (θ^3 / 3 + θ)√2
  //--------------------------------------------------------------------
  #orbitM1(f)
  {
    let t;

    t = Math.tan(f / 2);
    return (t*t*t / 3 + t) * Math.sqrt(2);
  }
  //--------------------------------------------------------------------
  // 離心近点角 tanh( u(f)/2 ) = √((e-1)/(e+1))tan(f/2)
  // 平均近点角 M(u) M = esinh(u) - u  [ e > 1]
  //--------------------------------------------------------------------
  #orbitM2(f, e)
  {
    let u;

    u = ((e-1) / (e+1)) * Math.tan(f / 2);
    u = Math.atanh( Math.sqrt(u) ) * 2;
    return e * Math.sinh(u) - u;
  }
  #orbitM(f, e)
  {
    if (e < 1) return this.#orbitM0(f, e);
    if (e > 1) return this.#orbitM2(f, e);
    return this.#orbitM1(f);
  }
  //--------------------------------------------------------------------
  // 離心近点角 u(M)  M = u - e*sin(u)
  // 真近点角   f(u)  tan(f) = √(1 - e^2) * sin(u) / (cos(u) - e)
  //--------------------------------------------------------------------
  #orbitF0(M, e)
  {
    let u, d;

    M = this.fmod(M, Math.PI*2);
    u = M + e * Math.sin(M);
    do
    {
      let f2 = e * Math.sin(u);
      let f  = u - f2 - M;
      let f1 = 1 - e * Math.cos(u);

      d  = f / (f1 - 0.5 * f2 * f / f1); // Halley
//      d  = f / f1;                       // Newton
      u -= d;
    } while (Math.abs(d) > 1e-12);
    d = Math.sqrt(1 - e*e) * Math.sin(u);
    return Math.atan2(d, Math.cos(u) - e);
  }
  //--------------------------------------------------------------------
  // 離心近点角 M(u) = u^3/6 + qu  [ e = 1 ]
  //            M'(θ) = M/q^(3/2) = (θ^3 / 3 + θ)√2
  // 真近点角   u(f) = θ√(2q)
  //            θ(f) = u/√(2q) = tan(f/2)
  //--------------------------------------------------------------------
  #orbitF1(M)
  {
    let d = Math.abs( (3 / (2*Math.sqrt(2)) ) * M );

    d = Math.pow(Math.sqrt(d*d + 1) + d, 1/3);
    d = Math.atan(d - 1/d) * 2;
    return (M < 0.0)? -d : d;
  }
  //--------------------------------------------------------------------
  // 離心近点角 M(u) M = esinh(u) - u  [ e > 1]
  // 真近点角   tanh( u(f)/2 ) = √((e-1)/(e+1))tan(f/2)
  //--------------------------------------------------------------------
  #orbitF2(M, e)
  {
    let u, d;

    u = e * Math.sinh(M) - M;
    do
    {
      let f2 = e * Math.sinh(u);
      let f  = f2 - u - M;
      let f1 = e * Math.cosh(u) - 1;

      d  = f / (f1 - 0.5 * f2 * f / f1); // Halley
//      d  = f / f1;                       // Newton
      u -= d;
    } while (Math.abs(d) > 1e-12);

    d = ( Math.sqrt(e*e - 1) / (e - 1) ) * Math.tanh(u/2);
    return Math.atan(d) * 2.0;
  }
  #orbitF(M, e)
  {
    if (e < 1) { return this.#orbitF0(M, e); }
    if (e > 1) { return this.#orbitF2(M, e); }
    return this.#orbitF1(M);
  }
  setDs(ds)
  { // 元期 [ jd, … }
    this.Jos = ds;
  }
  #orbitInclinationi(i)
  {
    let t   = this.I[i];
    let o   = this.O[i];
    let x   = Math.cos(o);
    let y   = Math.sin(o);
    let z   = 0;

    super.mode(0); // model mode
    super.identity();
    super.rotate(this.toDeg(t), x, y, z); // iを傾ける
    super.get(this.Mat0[i]);
    super.get(this.Mat[i]);
    super.mode(0); // model mode
  }
  orbitPlanei(i, k)
  {
    let t   = this.I[k];
    let o   = this.O[k];
    let x   = Math.cos(o);
    let y   = Math.sin(o);
    let z   = 0;

    super.mode(1); // model mode
    super.load(this.Mat0[i]);
    super.rotate(this.toDeg(-t), x, y, z); // kの黄道面真上から見る
    super.get(this.Mat0[i]);
    super.get(this.Mat[i]);
    super.mode(0); // model mode
  }
  // c ,d, a(q)  , e     , i    , Ω+ω , Ω,   , Mo    ,  P      , name
  setOrbiti(i, orbit, jds)
  {
    let n, d, p;

    if (i >= this.Count) this.Count = i + 1;

    this.C[i]    = orbit[0];
    d            = orbit[1];
    this.Jo[i]   = jds[d];
    this.A[i]    = orbit[2];
    this.E[i]    = orbit[3];
    this.I[i]    = this.toRad(orbit[4]);
    this.Oo[i]   = this.toRad(orbit[5] + this.GM);
    this.O[i]    = this.toRad(orbit[6] + this.GM);
    this.Mo[i]   = this.toRad(orbit[7]);
    this.P[i]    = p = orbit[8];
    this.Name[i] = orbit[9];
    if (p > 0)	// 惑星
    {
      this.Q[i] = this.A[i] * (1 - this.E[i]);
      n = Math.PI*2 / p;
    }
    else if (p == 0)  // 小惑星
    {
      this.Q[i] = this.A[i] * (1 - this.E[i]);
      n = Math.PI*2 / Math.pow(this.A[i], 3/2);
    }
    else  // 彗星
    {
      this.Q[i] = this.A[i];
      n = Math.PI*2;
      if (this.E[i] == 1)
      {
        n /= Math.pow(this.Q[i], 3/2);
      }
      else
      {
        this.A[i] = this.Q[i] / Math.abs(1 - this.E[i]);
        n /= Math.pow(this.A[i], 3/2);
      }
    }
    this.N[i] = n / 365.25;  // ユリウス年を日に変換
    this.Mat0[i] = [];
    this.Mat[i] = [];
    this.#orbitInclinationi(i);
  }
  orbitRotatei(i, deg, x, y, z)
  {
    super.mode(1); // model mode
    super.load(this.Mat0[i]);
    super.rotate(deg, x, y, z);
    super.get(this.Mat[i]);
    super.mode(0); // model mode
  }
  #orbitMxy0i(i, M)
  {
    let q = this.Q[i];
    let e = this.E[i];
    let o = this.Oo[i];
    let f = this.#orbitF(M, e);
    let l = q * (1 + e);
    let r = l / (1 + e * Math.cos(f));
    let x = r * Math.cos(f + o);
    let y = r * Math.sin(f + o);
    return { x:x, y:y, z:0 };
  }
  orbitMi(i, dM)
  {
    let p;
    let M = this.Mo[i] + dM;

    M = this.fmod(M, Math.PI*2);
    p = this.#orbitMxy0i(i, M);
    p = super.product(this.Mat[i], p);
    return p;
  }
  orbitJDi(i, jd)
  {
    let t  = jd - this.Jo[i];
    let dM = this.N[i] * t;

    return this.orbitMi(i, dM);
  }
}
