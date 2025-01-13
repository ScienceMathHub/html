/*
------------------------------------------------------------------------
 Date library

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
