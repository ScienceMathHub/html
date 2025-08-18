/*
------------------------------------------------------------------------
 Ray tracing library

 HTML(JavaScript)

 (c)Ohtani 2025.8
------------------------------------------------------------------------
*/
'use strict'

//----------------------------------------------------------------------
// RAY
//----------------------------------------------------------------------
class RAYTRACE0
{
  constructor()
  {
    this.Q     = this.Mode  = this.Am    = this.Level = this.SnMax = 0;
    this.Sn    = this.SP    = this.Sr    = this.SD    = 0
    this.Ss    = this.Sh    = this.Sl    = this.Sc    = this.Se    = 0
    this.SD0   = this.Ss0   = this.Sh0   = 0;
    this.Sl0   = this.Sc0   = this.Se0   = 0;
    this.SpMax = this.Sp    = this.Stack = 0;
    this.RES   = 0;
    this.linef = null;
  }
  func(f)
  {
    this.linef = f;
  }
  init()
  {
    let A;

    this.Q     = [0, 0, 0, 0, 0, 0, 0, 0];  // Current 複合四元数
    this.Mode  = 0;     // Quata mode (0:Model mode 1:View mode)

    this.Am    = 0.3;   // 環境光
    this.Level = 6;     // Level

    this.SnMax = 10;    // 球の最大数
    this.Sn    = 0;     // 球の個数
    this.SP    = new Array(this.SnMax); // 頂点座標
    for (let i = 0; i < this.SnMax; i++) { this.SP[i] = [0, 0, 0]; }
    this.Sr = new Array(this.SnMax);  // radius
    this.SD = new Array(this.SnMax);  // diffuse(RGB)
    for (let i = 0; i < this.SnMax; i++) { this.SD[i] = [1, 1, 1]; }
    this.Ss = new Array(this.SnMax);  // specular
    this.Sh = new Array(this.SnMax);  // shininess
    this.Sl = new Array(this.SnMax);  // reflect
    this.Sc = new Array(this.SnMax);  // clarity
    this.Se = new Array(this.SnMax);  // refract

    this.SD0 = [1, 1, 1];
    this.Ss0 = 1;
    this.Sh0 = 1;
    this.Sl0 = 0;
    this.Sc0 = 0;
    this.Se0 = 1;

    this.SpMax = 10;
    this.Sp    = 0;

    this.Stack = new Array(this.SpMax); // Push Q
    for (let i = 0; i < this.SpMax; i++)
    {
      const Q = [0, 0, 0, 0, 0, 0, 0, 0];
      this.Stack[i] = Q;
    }

    A    = 1;
    this.RES  = [640/A, 400/A, A];  //  x dots , y dots, dot size
  }
  //----------------------------------------------------------------------
  // 視点位置ベクトルV0から、視線単位ベクトルE方向の視線と
  // 原点中心で半径rの球との交点までの距離t0を求める
  //
  // |P|=r  … 球   , tt + 2(V･E)t + V･V - rr = 0
  // P=V+Et … 視線 , t = -(V･E)±sqr{(V･E)^2 - V･V + rr}
  //
  // inp V0,E,r  V0は球が原点の時の視点Vの値
  // out t0
  //----------------------------------------------------------------------
  distance_sphere(V, E, r)
  {
    let b, d, t;

    b = V[0]*E[0] + V[1]*E[1] + V[2]*E[2];          // b = V･E
    d = V[0]*V[0] + V[1]*V[1] + V[2]*V[2] - r*r;    // d = V･V - rr
    d = b*b - d;                                    // d判別式
    if (d < 0) return -1.0;                         // 交点なし
    d = Math.sqrt(d);
    t = -b - d;                         // 視線と球の近い方の交点距離
    if (t < 0) t = -b + d;              // 視線と球の遠い方の交点距離
    return t;
  }
  //----------------------------------------------------------------------
  // 視点位置ベクトルVから、視線単位ベクトルE方向の視線と球との交点との
  // 距離tの内で一番近い前方のtと球番号siを求める
  //
  // inp V,E,SP,sr,sn
  // out _t,si
  //----------------------------------------------------------------------
  distance(_t, V, E)
  {
    let V0 = [0, 0, 0];
    let t0, t, si, c;

    t = -1.0;
    si = -1;
    for (c = 0; c < this.Sn; c++)
    {
      V0[0] = V[0] - this.SP[c][0];
      V0[1] = V[1] - this.SP[c][1];
      V0[2] = V[2] - this.SP[c][2];
      t0    = this.distance_sphere(V0, E, this.Sr[c]);
      if (t0 >= 0)
      {
        if (t0 < t || t < 0) { t = t0; si = c; }
      }
    }
    _t[0] = t;
    return si;
  }
  //----------------------------------------------------------------------
  // 点を描く
  //
  // inp CL,x0,y0,ix,iy,iz
  //----------------------------------------------------------------------
  draws(CL, x0, y0, ix, iy, iz)
  {
    let c, i, x, y;

    if (CL[3] < 0.0) return;
    c  = '#';
    i = Math.floor(CL[0]*255);
    if (i > 255) i = 255; else if (i < 0) i = 0;
    c += ('00' + i.toString(16)).substr(-2);    // R
    i = Math.floor(CL[1]*255);
    if (i > 255) i = 255; else if (i < 0) i = 0;
    c += ('00' + i.toString(16)).substr(-2);    // G
    i = Math.floor(CL[2]*255);
    if (i > 255) i = 255; else if (i < 0) i = 0;
    c += ('00' + i.toString(16)).substr(-2);    // B
    x = ix*iz + x0;
    y = iy*iz + y0;
    this.linef(x, y, x + iz, y + iz, c);
  }
  //----------------------------------------------------------------------
  // 反射(specular)ベクトルを求める
  //
  // inp E,N (|N|=1  )
  // out S   (|S|=|E|)
  //----------------------------------------------------------------------
  vector_specular(_S, E, N)
  {
    let a;

    a  = -2.0 * (E[0]*N[0] + E[1]*N[1] + E[2]*N[2]);
    _S[0] = E[0] + N[0] * a;
    _S[1] = E[1] + N[1] * a;
    _S[2] = E[2] + N[2] * a;
  }
  //----------------------------------------------------------------------
  // 屈折ベクトルRと反射率k(k=1全反射)を求める
  //
  // inp E,N,n2    (|N|=1, n2≠0)
  // out _R,k      (|R|=|E|)
  //----------------------------------------------------------------------
  vector_refract(_R, E, N, n2)
  {
    let a, b, c, d, f, k, n;

    c = -E[0]*N[0] - E[1]*N[1] - E[2]*N[2];	// c = cosθ = -E・N
    n = n2;					// n = n2/n1
    f = 1.0;
    if (c < 0.0)
    {
      c = -c; n = 1.0/n; f = -1.0;	// 内から外
    }
    a = n*n - (1.0 - c*c);		// a = nn-(1-cc)
    if (a < 0.0) return 1.0;		// a < 0ならk=1(全反射)
    b = Math.sqrt(a);			// b = √(a)
    k = (    b - c) / (    b + c);	// k = (  b-c)/(  b+c)
    d = (n*n*c - b) / (n*n*c + b);	// d = (nnc-b)/(nnc+b)
    k = (k*k + d*d) / 2.0;		// k = 1/2(kk+dd)
    a = (b - c) * f;			// 内から外は負
    _R[0] = (E[0] - N[0] * a) / n;
    _R[1] = (E[1] - N[1] * a) / n;
    _R[2] = (E[2] - N[2] * a) / n;	// 屈折R=(1/n){E-N{b-c}]
    return k;
  }
  //----------------------------------------------------------------------
  // 視線と球の交点の色cl、陰影と陰(0≦rgb≦1)を求める
  //
  // inp CL,V,E,t,si
  // out _CL, _P, _N
  //----------------------------------------------------------------------
  shade_si(_CL, _P, _N, V, E, t, si)
  {
    let V0 = [0, 0, 0];
    let E0 = [0, 0, 0];
    let S  = [0, 0, 0];
    let _t = [0];
    let a, b, t0, t1;

    _CL[0] = this.SD[si][0];
    _CL[1] = this.SD[si][1];
    _CL[2] = this.SD[si][2];
    if (si == 0) return;                                    // light
    V0[0] = V[0] - this.SP[si][0];
    V0[1] = V[1] - this.SP[si][1];
    V0[2] = V[2] - this.SP[si][2];
    _P[0] = V0[0] + E[0] * t;
    _P[1] = V0[1] + E[1] * t;
    _P[2] = V0[2] + E[2] * t;
    b = Math.sqrt(_P[0]*_P[0] +_P[1]*_P[1] +_P[2]*_P[2]);   // P = V0+Et
    if (b != 0.0) b = 1.0/b; else b = 0.0;
    _N[0] = _P[0] * b;                                  // N = P/|P|
    _N[1] = _P[1] * b;
    _N[2] = _P[2] * b;
    this.vector_specular(S, E, _N);
    _P[0] += this.SP[si][0];                            // P = (元の座標)
    _P[1] += this.SP[si][1];
    _P[2] += this.SP[si][2];
    E0[0]  = this.SP[0][0] - _P[0];                     // 光源方向
    E0[1]  = this.SP[0][1] - _P[1];
    E0[2]  = this.SP[0][2] - _P[2];
    b  = Math.sqrt(E0[0]*E0[0] + E0[1]*E0[1] + E0[2]*E0[2]);
    t1 = b - this.Sr[0];                    // 光源表面までの距離
    if (b != 0.0) b = 1.0/b; else b = 0.0;
    E0[0] *= b;
    E0[1] *= b;
    E0[2] *= b;                             // E0 = L(光源方向)
    b   = 0.1;//1.0e-8;                     // 少し手前
    t1 -= b * 2.0;                          // 光源表面までより短く

    V0[0] = _P[0] + E0[0] * b;              // 点Pと重ならないよう
    V0[1] = _P[1] + E0[1] * b;              // V0を少し光源に寄せる 	
    V0[2] = _P[2] + E0[2] * b;
    this.distance(_t, V0, E0);
    t0 = _t[0];

    b = E0[0]*_N[0] + E0[1]*_N[1] + E0[2]*_N[2]; // b = L・N
    if (b < 0.0) b = 0.0;
    a = E0[0]* S[0] + E0[1]* S[1] + E0[2]* S[2]; // a = L・S specular
    if (a < 0.0) a = 0.0;
    a = a ** this.Sh[si];                        // shininess
    a = a *  this.Ss[si];
    if (0.0 < t0 && t0 < t1) { b = 0.0; a = 0.0; }   // 陰
    if (b < this.Am) b = this.Am;                    // ambient
    _CL[0] = _CL[0] * b + a;
    _CL[1] = _CL[1] * b + a;
    _CL[2] = _CL[2] * b + a;
  }
  //----------------------------------------------------------------------
  //視線と球の交点の色cl、陰影と陰(0≦rgb≦1)を求める
  //
  // inp V,E,slc,li
  // out _CL
  //----------------------------------------------------------------------
  shade(_CL, V, E, slc, li)
  {
    let CL0 = [0, 0, 0, 0];
    let P   = [0, 0, 0];
    let S   = [0, 0, 0];
    let V0  = [0, 0, 0];
    let N   = [0, 0, 0];
    let _t  = [0];
    let t, sl1, sc1, k, b, si;

    _CL[0] = 0.0; _CL[1] = 0.0; _CL[2] = 0.0; _CL[3] = -1.0;

    // 光slcが小さすぎるか、追跡回数が大きすぎる時、追跡終了
    if (slc < 1.0/255.0 || li > this.Level) return;
    li++;	// Level
    si = this.distance(_t, V, E);
    t = _t[0];
    if (t < 0.0) return;
    this.shade_si(CL0, P, N, V, E, t, si);
    _CL[0] = CL0[0] * slc;
    _CL[1] = CL0[1] * slc;
    _CL[2] = CL0[2] * slc;
    _CL[3] = 1.0;

    sl1 = this.Sl[si];
    sc1 = Math.sqrt(this.Sc[si]);

    if (sl1 + sc1 <= 0.0) return;
    if (sc1 > 0.0)
    {
      k = this.vector_refract(S, E, N, this.Se[si]);
      sl1 += sc1 * k;
      if (k < 1.0)
      {
        b = 0.1;//1.0e-8;		// 少し手前
        V0[0] = P[0] + S[0] * b;
        V0[1] = P[1] + S[1] * b;
        V0[2] = P[2] + S[2] * b;
        slc *= sc1 * (1.0 - k);
        this.shade(CL0, V0, S, slc, li);
        if (CL0[3] >= 0.0)
        {
          _CL[0] += CL0[0]; _CL[1] += CL0[1]; _CL[2] += CL0[2];
        }
        sl1 = this.Sl[si] + this.Sc[si] * k;
      }
    }
    if (sl1 > 0.0)
    {
      this.vector_specular(S, E, N);
      b = 0.1;//1.0e-8;		// 少し手前
      V0[0] = P[0] + S[0] * b;
      V0[1] = P[1] + S[1] * b;
      V0[2] = P[2] + S[2] * b;
      slc *= sl1;
      this.shade(CL0, V0, S, slc, li);
      if (CL0[3] >= 0.0)
      {
        _CL[0] += CL0[0]; _CL[1] += CL0[1]; _CL[2] += CL0[2];
      }
    }
  }
  //----------------------------------------------------------------------
  // スクリーンVXYZからの視点位置ベクトルVと視線単位ベクトルEの生成
  // VXYZ(0),(1),(2)=screen幅/2,高/2,視点screen間距離
  //
  // V(0) = VXYZ(0)*x , V(1) = VXYZ(1)*y , V(2) = 0 (-1≦x,y≦1)
  // E(0) = V(0)/|E|  , E(1) = V(1)/|E|  , E(2) = -VXYZ(2)/|E|
  //
  // inp VXYZ,x,y
  // out _V,_E
  //----------------------------------------------------------------------
  ray_view(_V, _E, VXYZ, x, y)
  {
    let a;

    _V[0]  = VXYZ[0] * x; _V[1]  = VXYZ[1] * y; _V[2]  =  0.0    ;
    _E[0]  = _V[0]      ; _E[1]  = _V[1]      ; _E[2]  = -VXYZ[2];
    a = Math.sqrt(_E[0]*_E[0] + _E[1]*_E[1] + _E[2]*_E[2]);
    _E[0] /= a          ; _E[1] /= a          ; _E[2] /= a       ;
  }
  //----------------------------------------------------------------------
  // 解像度RESのx,y(-1≦x,y≦1)方向視線で球をトレース
  // RES(0),(1),(2)=x,yのドット数,ドットサイズ
  // 球x,y,z,r,c=中心x,y,z,半径,色    x,y,z座標の正方向=右,上,後ろ
  //
  // inp VX,YZ,sx,sy,sz,sr,sc
  //----------------------------------------------------------------------
  ray_trace(VXYZ)
  {
    let V  = [0, 0, 0];
    let E  = [0, 0, 0];
    let CL = [0, 0, 0, 0];
    let iw, ih, ix, iy, iz, si;
    let x0, y0, x, y;

    iw = this.RES[0]; ih = this.RES[1]; iz = this.RES[2];
    x0 = (640 - iw*iz) / 2; y0 = (400 - ih*iz) / 2;
    // (x, y, w, h) = (x0, y0, iw*iz, ih*iz)
    iw--; ih--;
    for (iy = 0; iy <= ih; iy++)
    {
      y = 1 - 2 * iy / ih;
      for (ix = 0; ix <= iw; ix++)
      {
        x = 2 * ix / iw - 1;
        this.ray_view(V, E, VXYZ, x, y);
        this.shade(CL, V, E, 1, 0);
        this.draws(CL, x0, y0, ix, iy, iz);
      }
    }
  }
  //----------------------------------------------------------------------
  // Trace
  //----------------------------------------------------------------------
  trace(x, y, z)
  {
    let VXYZ = [x, y, z];	// Screen幅/2, 高/2, Screen-視点距離

    this.ray_trace(VXYZ);
  }
  //----------------------------------------------------------------------
  // 四元数の積
  //
  // inp q1=(w1, x1, y1, z1),q2=(w2, x2, y2, z2)
  // out _q=(w0, x0, y0, z0) = (w1, x1, y1, z1)(w2, x2, y2, z2)
  //----------------------------------------------------------------------
  Multqq(_q, q1, q2)
  {
    let w, x, y, z;

    w = q1[0]*q2[0] - q1[1]*q2[1] - q1[2]*q2[2] - q1[3]*q2[3];
    x = q1[0]*q2[1] + q1[1]*q2[0] + q1[2]*q2[3] - q1[3]*q2[2];
    y = q1[0]*q2[2] + q1[2]*q2[0] + q1[3]*q2[1] - q1[1]*q2[3];
    z = q1[0]*q2[3] + q1[3]*q2[0] + q1[1]*q2[2] - q1[2]*q2[1];
    _q[0] = w; _q[1] = x; _q[2] = y; _q[3] = z;
  }
  //----------------------------------------------------------------------
  // 複合四元数とベクトルの積
  //
  // inp Q,p
  // out _p1 (_p1 = RpR~ + T)  R~ = Rの共役
  //----------------------------------------------------------------------
  Product(_p1, p)
  {
    let q1, q2;

    q1 = [0, p[0], p[1], p[2]];
    q2 = [this.Q[0], -this.Q[1], -this.Q[2], -this.Q[3]];
    this.Multqq(q1, q1, q2);      //---    p Qr~
    this.Multqq(q1, this.Q , q1); //--- Qr p Qr~
    _p1[0] = q1[1] + this.Q[5];
    _p1[1] = q1[2] + this.Q[6];
    _p1[2] = q1[3] + this.Q[7];   //--- p'= Qr p Qr~ + Qt
  }
  //----------------------------------------------------------------------
  // 複合四元数の積(Q = QA model mode , Q = AQ view mode)
  //
  // inp A
  // out Q (Qr=QrAr, Qt=Qt + QrAtQr~) (Qr=ArQr , Qt=At + ArQtAr~)
  //----------------------------------------------------------------------
  Mult(A)
  {
    let q;

    if (this.Mode)
    { //--- Q = AQ
      q = [A[0], -A[1], -A[2], -A[3]];
      this.Multqq(q, this.Q.slice(4), q); //---   QtAr~
      this.Multqq(q,      A         , q); //--- ArQtAr~
      this.Q[4] = A[4] + q[0];
      this.Q[5] = A[5] + q[1];
      this.Q[6] = A[6] + q[2];
      this.Q[7] = A[7] + q[3]; //--- Qt = At + ArQtAr~
      this.Multqq(this.Q, A, this.Q);    //--- Qr = ArQr
    }
    else
    { //--- Q = QA
      q = [this.Q[0], -this.Q[1], -this.Q[2], -this.Q[3]];
      this.Multqq(q,      A.slice(4), q); //---   AtQr~
      this.Multqq(q, this.Q         , q); //--- QrAtQr~
      this.Q[4] += q[0];
      this.Q[5] += q[1];
      this.Q[6] += q[2];
      this.Q[7] += q[3];    //--- Qt = Qt + QrAtQr~
      this.Multqq(this.Q, this.Q, A); //--- Qr = QrAr
    }
  }
  //----------------------------------------------------------------------
  // 単位複合四元数
  //
  // out Q
  //----------------------------------------------------------------------
  Identity()
  {
    this.Q = [1, 0, 0, 0, 0, 0, 0, 0];
  }
  //----------------------------------------------------------------------
  // 並進複合四元数
  //
  // inp x, y, z
  // out Q
  //----------------------------------------------------------------------
  Translate(x, y, z)
  {
    let A = [1, 0, 0, 0, 0, x, y, z];

    this.Mult(A);
  }
  //----------------------------------------------------------------------
  // 回転複合四元数
  //
  // inp d, x, y, z
  // out Q
  //----------------------------------------------------------------------
  Rotate(d, x, y, z)
  {
    let A, t;

    t = d * Math.PI / 360; //--- t(rad) = d(ﾟ)/2
    t = Math.sin(t) / Math.sqrt(x*x + y*y + z*z);
    A = [Math.cos(t), x * t, y * t, z * t, 0, 0, 0, 0];
    this.Mult(A);
  }
  //----------------------------------------------------------------------
  // Push Q
  //----------------------------------------------------------------------
  Push()
  {
    if (this.Sp >= this.SpMax) return;
    for (let i = 0; i < 8; i++) { this.Stack[this.Sp][i] = this.Q[i]; }
//    this.Stack[this.Sp] = this.Q;
    this.Sp++;
  }
  //----------------------------------------------------------------------
  // Pop Q
  //----------------------------------------------------------------------
  Pop()
  {
    if (this.Sp <= 0) return;
    this.Sp--;
    for (let i = 0; i < 8; i++) { this.Q[i] = this.Stack[this.Sp][i]; }
//    this.Q = this.Stack[this.Sp];
  }
  //----------------------------------------------------------------------
  // Diffuse
  //----------------------------------------------------------------------
  Diffuse(r, g, b)
  {
    this.SD0 = [r, g, b];
  }
  //----------------------------------------------------------------------
  // 鏡面反射係数
  //----------------------------------------------------------------------
  Specular(w)
  {
    this.Ss0 = w;
  }
  //----------------------------------------------------------------------
  // 輝き
  //----------------------------------------------------------------------
  Shininess(h)
  {
    this.Sh0 = h;
  }
  //----------------------------------------------------------------------
  // 完全鏡面反射係数
  //----------------------------------------------------------------------
  Reflect(r)
  {
    this.Sl0 = r;
  }
  //----------------------------------------------------------------------
  // 透明度
  //----------------------------------------------------------------------
  Clarity(c)
  {
    this.Sc0 = c;
  }
  //----------------------------------------------------------------------
  // 屈折率
  //----------------------------------------------------------------------
  Refract(n)
  {
    this.Se0 = n;
  }
  //----------------------------------------------------------------------
  // Sphere
  //----------------------------------------------------------------------
  Sphere(r)
  {
    let p = [0, 0, 0];

    if (this.Sn >= this.SnMax) return;

    this.SD[this.Sn] = this.SD0;
    this.Product(p, p);
    this.SP[this.Sn] = p;
    this.Sr[this.Sn] = r;
    this.Ss[this.Sn] = this.Ss0;
    this.Sh[this.Sn] = this.Sh0;
    this.Sl[this.Sn] = this.Sl0;
    this.Sc[this.Sn] = this.Sc0;
    this.Se[this.Sn] = this.Se0;
    this.Sn++;
  }
}
