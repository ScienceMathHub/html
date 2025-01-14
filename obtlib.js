/*
------------------------------------------------------------------------
 Orbit library (with DATE & MATRIX library)

 HTML(JavaScript)

 (c)Ohtani 2025.1
------------------------------------------------------------------------
*/
'use strict'

//----------------------------------------------------------------------
// Julius days
//----------------------------------------------------------------------
class DATE
{
  constructor()
  {
  }
  Using(num, p, u, z, d)
  { // p = ' ' or ''
    let s, a, n, i, k, sz, sd, sp;

    s = num.toFixed(d);
    a = s.substring(0, 1);
    i = 0;
    if (a == '-') { sp = '-'; i++; }
    else          { sp = p;        }
    
    n = s.length;
    k = s.indexOf('.', 0);
    if (k < 0) k = n;
    sz = s.substring(i, k);
    k++;
    sd = (k < n)?  '.' + s.substring(k, n) : '';
    
    n = z - sz.length;
    if (u != '0') sz = sp + sz;
    while (--n >= 0) sz = u + sz;
    if (u == '0') sz = sp + sz;
    return sz;
  }
  DateNow()
  {
    let yy, mm, dd, now;

    now = new Date();
    yy  = now.getFullYear();
    mm  = now.getMonth() + 1;
    dd  = now.getDate();
    return { y:yy, m:mm, d:dd };
  }
  TimeNow()
  {
    let hh, mm, ss, ms, now;

    now = new Date();
    hh  = now.getHours();
    mm  = now.getMinutes();
    ss  = now.getSeconds();
    ms  = now.getMilliseconds() / 1000;
    ss  += ms;
    return { h:hh, m:mm, s:ss };
  }
  DateStr(d, ly)
  {
    let s = this.Using(d.y, ' ', ' ', ly, 0) + '.';
    s    += this.Using(d.m, '' , '0', 2 , 0) + '.';
    s    += this.Using(d.d, '' , '0', 2 , 0);
    return s;
  }
  TimeStr(t, ls)
  {
    let s = this.Using(t.h, '', '0', 2, 0 ) + ':';
    s    += this.Using(t.m, '', '0', 2, 0 ) + "'";
    s    += this.Using(t.s, '', '0', 2, ls);
    return s;
  }
  JD(d)
  {
    let jy, jm, jd;
    let yy = d.y;
    let mm = d.m;
    let dd = d.d;

    if (mm <= 2) { jm = mm + 13; jy = yy - 1; }
    else         { jm = mm +  1; jy = yy    ; }
    jd  = Math.floor(jy * 365.25) + Math.floor(jm * 30.601);
    jd += dd + 1721117.5 - 122 - 1;
    if (jd >= 2299160.5)
    { jd += -Math.floor(jy / 100) + Math.floor(jy / 400) + 12 - 10; }
    return jd;
  }
  Date(jd)
  {
    let yy, mm, dd, jy;

    dd = jd + 0.5;
    jy = Math.floor(dd);
    dd -= jy;
    if (jy >= 2299161)
    {
      jy -= 12 - 10;
      yy = (jy - 1721118 + 1) / 365.2425;
      jy += Math.floor(yy / 100) - Math.floor(yy / 400);
    }
    jy -= 31 + 28;
    yy = Math.floor((jy - 0.001) / 365.25)
    jy += -Math.floor(yy * 365.25) + 122
    mm = Math.floor(jy / 30.601);
    dd += jy - Math.floor(mm * 30.601);
    if (mm > 13) { mm-= 13; yy++; } else { mm--; }
    yy -= 4712;
    return { y:yy, m:mm, d:dd };
  }
  Week(jd)
  {
    jd += 1.5;
    while (jd < 0) jd += 7 * 53 * 1000;
    jd = jd % 7;
    return jd;
  }
  WeekJP(week)
  {
    const weeks = [ "日", "月", "火", "水", "木", "金", "土" ]

    return weeks[week % 7];
  }
  EraStr(name, last, r, y, b)
  {
    r = y - r + 1;
    if      (r == 1) r = name + "元"  + last;
    else if (r >  1) r = name +    r  + last;
    else if (b)      r = b    + (1-r) + last;
    else             r = b;
    return r;
  }
  Tsec(t)
  {
    return t.h*3600 + t.m*60 + t.s;
  }
  Time(s)
  {
    let h, m;

    h = s;
    s = h % 60; h = Math.floor(h / 60);
    m = h % 60; h = Math.floor(h / 60);
    return { h:h, m:m, s:s }
  }
}

//----------------------------------------------------------------------
// Matrix
//----------------------------------------------------------------------
class MATRIX
{
  constructor()
  {
    this.M = [];
    this.Mode = 0; // 0:model 1:view
    this.identity();
    this.Temp0 = 0; // debug
  }
  // vector q = Mp
  product(M, p)
  {
    let x, y, z;

    x = M[0] * p.x + M[4] * p.y + M[ 8] * p.z + M[12];
    y = M[1] * p.x + M[5] * p.y + M[ 9] * p.z + M[13];
    z = M[2] * p.x + M[6] * p.y + M[10] * p.z + M[14];
    return { x:x, y:y, z:z };
  }
  mode(m)
  { // 1:view 0:model
    this.Mode = m;
  }
  identity()
  {
    this.M[0] = 1; this.M[4] = 0; this.M[ 8] = 0; this.M[12] = 0;
    this.M[1] = 0; this.M[5] = 1; this.M[ 9] = 0; this.M[13] = 0;
    this.M[2] = 0; this.M[6] = 0; this.M[10] = 1; this.M[14] = 0;
    this.M[3] = 0; this.M[7] = 0; this.M[11] = 0; this.M[15] = 1;
  }
  load(A)
  {
    for (let i=0; i < 15; i++)
    {
      this.M[i] = A[i];
    }
  }
  get(A)
  {
    for (let i=0; i < 15; i++)
    {
      A[i] = this.M[i];
    }
  }
  mult(A)
  {
    let x, y, m1, m2, m3, m4;

    if (this.Mode)
    { // M = AM
      for (x = 0; x < 16; x += 4)
      {
        m1 = this.M[x  ]; m2 = this.M[x+1];
        m3 = this.M[x+2]; m4 = this.M[x+3];
        for (y = 0; y < 4; y++)
        {
          this.M[x+y] = A[y]*m1 + A[y+4]*m2 + A[y+8]*m3 + A[y+12]*m4;
        }
      }
    }
    else
    { // M = MA
      for (y = 0; y < 4; y++)
      {
        m1 = this.M[y  ]; m2 = this.M[y+4];
        m3 = this.M[y+8]; m4 = this.M[y+12];
        for (x = 0; x < 16; x += 4)
        {
          this.M[x+y] = m1*A[x] + m2*A[x+1] + m3*A[x+2] + m4*A[x+3];
        }
      }
    }
  }
  translate(x, y, z)
  {
    let A = [];

    A[0] = 1; A[4] = 0; A[ 8] = 0; A[12] = x;
    A[1] = 0; A[5] = 1; A[ 9] = 0; A[13] = y;
    A[2] = 0; A[6] = 0; A[10] = 1; A[14] = z;
    A[3] = 0; A[7] = 0; A[11] = 0; A[15] = 1;
    this.mult(A);
  }
  rotate(d, x, y, z)
  {
    let A = [];
    let rr, n1, n2, n3, tt, ss, nn;

    rr = Math.sqrt(x*x + y*y + z*z);
    n1 = x / rr;
    n2 = y / rr;
    n3 = z / rr;
    tt = d * Math.PI / 180;
    ss = Math.cos(tt);
    rr = 1.0 - ss;
    A[ 0] = n1 * n1 * rr + ss;
    A[ 5] = n2 * n2 * rr + ss;
    A[10] = n3 * n3 * rr + ss;
    ss = Math.sin(tt);
    tt = n1 * n2 * rr; nn = n3 * ss; A[4] = tt - nn; A[1] = tt + nn;
    tt = n1 * n3 * rr; nn = n2 * ss; A[2] = tt - nn; A[8] = tt + nn;
    tt = n2 * n3 * rr; nn = n1 * ss; A[9] = tt - nn; A[6] = tt + nn;
    A[12] = A[13] = A[14] = 0; A[15] = 1;
    A[ 3] = A[ 7] = A[11] = 0;
    this.mult(A);
  }
}

//----------------------------------------------------------------------
// Orbit
//----------------------------------------------------------------------
class ORBIT extends MATRIX
{
  constructor()
  {
    super();
    this.GM    = 270; // 昇交点を上にする
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
    let d;

    M = this.fmod(M, Math.PI*2);
    d = Math.abs( (3 / (2*Math.sqrt(2)) ) * M );
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

    M = this.fmod(M, Math.PI*2);
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
    super.rotate(this.GM       , 0, 0, 1); // kの昇交点を上にする
    super.get(this.Mat0[i]);
    super.get(this.Mat[i]);
    super.mode(0); // model mode
  }
  setDs(ds)
  { // 元期 [ jd, … }
    this.Jos = ds;
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
    this.Oo[i]   = this.toRad(orbit[5]);
    this.O[i]    = this.toRad(orbit[6]);
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
  orbitOoi(i, f)
  {
    let q = this.Q[i];
    let e = this.E[i];
    let o = this.Oo[i];
    let l = q * (1 + e);
    let r = l / (1 + e * Math.cos(f-o));
    let x = r * Math.cos(f);
    let y = r * Math.sin(f);
    let p = { x:x, y:y, z:0 };
    p = super.product(this.Mat[i], p);
    return p;
  }
  orbitMi(i, M)
  {
    let q = this.Q[i];
    let e = this.E[i];
    let o = this.Oo[i];
    let f = this.#orbitF(M, e);
    let l = q * (1 + e);
    let r = l / (1 + e * Math.cos(f));
    let x = r * Math.cos(f + o);
    let y = r * Math.sin(f + o);
    let p = { x:x, y:y, z:0 };
    p = super.product(this.Mat[i], p);
    return p;
  }
  orbitJDi(i, jd)
  {
    let t  = jd - this.Jo[i];
    let M = this.Mo[i] + this.N[i] * t;

    return this.orbitMi(i, M);
  }
}
