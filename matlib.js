/*
------------------------------------------------------------------------
 Matrix library

 HTML(JavaScript)

 (c)Ohtani 2025.1
------------------------------------------------------------------------
*/
'use strict'

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
