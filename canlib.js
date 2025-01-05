/*
------------------------------------------------------------------------
 Canvas library

 HTML(JavaScript, canvas)

 (c)Ohtani 2024.4 - 2025.1
------------------------------------------------------------------------
*/
'use strict'

//----------------------------------------------------------------------
// canvas
//----------------------------------------------------------------------
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

//----------------------------------------------------------------------
// 描画関数
//----------------------------------------------------------------------
String.prototype.bytes = function ()
{
  return(encodeURIComponent(this).replace(/%../g,"x").length);
}

//----------------------------------------------------------------------
// BASIC
//----------------------------------------------------------------------
class BASIC
{
  constructor()
  {
    this.winX   =   0; //Window座標
    this.winY   =   0;
    this.winW   = 640;
    this.winH   = 400;
    this.posX   =   0; // グラフィックカレント
    this.posY   =   0;
    this.locX   =   0; // テキストカレント
    this.locY   =   0;
    this.locW   =   8; // テキストMサイズ
    this.locH   =  16;
    this.offW   =   0; // テキストSサイズ
    this.offh   =   0;
    this.zoom0  =  45; // 画面拡大基準値
    this.zoom   =  45; // 画面拡大
    this.width0 =   2; // 線幅基準値
    this.width  =   2; // 線幅
    this.lineWidth(0);
    this.zooming(0);
  }
  WinX(x)
  {
    return (x * this.winW / canvas.width) + this.winX;
  }
  WinY(y)
  {
    return (y * this.winH / canvas.height) + this.winY;
  }
  ScrX(x)
  {
    return Math.round((x - this.winX) * canvas.width  / this.winW);
  }
  ScrY(y)
  {
    return Math.round((y - this.winY) * canvas.height / this.winH);
  }
  ScrW(w)
  {
    return Math.round(w * canvas.width  / this.winW);
  }
  ScrH(h)
  {
    return Math.round(h * canvas.height / this.winH);
  }
  WINDOW(x1, y1, x2, y2)
  {
    this.winX = x1;
    this.winY = y1;
    this.winW = x2 - x1;
    this.winH = y2 - y1;
  }
  LOCATEp(x, y)
  {
    if (x !== '') this.locX = this.ScrX(x);
    if (y !== '') this.locY = this.ScrY(y);
  }
  LOCATE(x, y)
  {
    if (x !== '') this.locX = x * this.locW;
    if (y !== '') this.locY = y * this.locH;
  }
  TAB(x, y)
  {
    if (x !== '') this.locX += x * this.locW;
    if (y !== '') this.locY += y * this.locH;
  }
  CR()
  {
    this.locX = 0;
    this.locY += this.locH;
  }
  CRn(n)
  {
    this.locX = 0;
    this.locY += this.locH * n;
  }
  CLS(c)
  {
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.LOCATE(0, 0);
  }
  FONT(zoom, offs)
  {
    let h;

    zoom = Math.round(this.zoom * zoom / 40 * 8);
    this.locW = zoom;
    h    = zoom * 2;
    offs = Math.round(this.zoom * offs / 40 * 8);
    this.offH = offs * 2;
    offs = Math.round(this.zoom        / 40 * 8);
    this.locH = offs * 2;
    ctx.font = h + "px 'ＭＳ ゴシック'";
//    ctx.font = h + "px 'sans-serif'";
//    ctx.font = h + "px '游ゴシック'";
//    ctx.font = h + "px '游明朝'";
    this.locW = ctx.measureText('あ').width / 2;
  }
  COLOR(c)
  {
    ctx.fillStyle   = c;
    ctx.strokeStyle = c;
  }
  SYMBOL(x, y, text, c)
  {
    let x1, y1;

    x1 = this.ScrX(x);
    y1 = this.ScrY(y);
    ctx.fillStyle   = c;
    ctx.strokeStyle = c;
    ctx.fillText(text, x1, y1);
  }
  PRINT(text)
  {
    let s, n, i, w, x, m, a;

    s = String(text);
    n = s.length;
    for (i = 0; i < n; i++)
    {
      a = s.substring(i, i+1);
      w = this.locW * 2;
      if (a.match(/[ -~]/)) w = this.locW;
      if (a.match(/[ｧ-ﾝ]/)) w = this.locW;
      m = ctx.measureText(a).width;
      x = (w - m) / 2;
      ctx.fillText(a, this.locX + x, this.locY + this.offH - 1);
      this.locX += w;
    }
  }
  PRINTe(s)
  {
    let i, n, num, a, p;

    s = String(s);
    p = 0;
    num = 0;
    n = s.length;
    for (i = 0; i < n; i++)
    {
      a = s.substring(i, i+1);
      if (a == 'θ')
      {
        this.PRINT(a);
        this.locX -= this.locW / 2;
        continue;
      }
      if (a == '^')
      {
        i++;
        a = s.substring(i, i+1);
        this.FONT(0.7, -0.3);
        this.PRINT(a); p++;
        this.FONT(1, 0);
        continue;
      }
      if (a == '_')
      {
        i++;
        a = s.substring(i, i+1);
        this.FONT(0.7, 0.1);
        this.PRINT(a); p++;
        this.FONT(1, 0);
        continue;
      }
      if (num && (a == 'e' || a == 'E'))
      {
        this.PRINT("×10");
        this.FONT(0.7, -0.4);
        i++;
        a = s.substring(i, i+1);
        if      (a == '+') { i++;                     }
        else if (a == '-') { i++; this.PRINT(a); p++; }
        for (;i < n; i++)
        {
          a = s.substring(i, i+1);
          if (!('0' <= a && a <= '9')) { i--; break; }
          this.PRINT(a); p++;
        }
        num = 0;
        this.FONT(1, 0);
        continue;
      }
      num = ('0' <= a && a <= '9')? 1 : 0;
      this.PRINT(a);
    }
    this.FONT(1, 0);
    return p;	/* 0.7の数 */
  }
/*
  PRINTe(s)
  {
    let i, n, pow, num, a, p;

    s = String(s);
    p = 0;
    num = pow = 0;
    n = s.length;
    for (i = 0; i < n; i++)
    {
      a = s.substring(i, i+1);
      if (a == 'θ')
      {
        this.PRINT(a);
        this.locX -= this.locW / 2;
        continue;
      }
      if (a == '^')
      {
        i++;
        a = s.substring(i, i+1);
        this.FONT(0.7, -0.3);
        this.PRINT(a);
        this.FONT(1, 0);
        continue;
      }
      if (a == '_')
      {
        i++;
        a = s.substring(i, i+1);
        this.FONT(0.6, 0.1);
        this.PRINT(a);
        this.FONT(1, 0);
        continue;
      }
      if (num && (a == 'e' || a == 'E'))
      {
        pow = 1;
        this.PRINT("×10");
        this.FONT(0.7, -0.4);
        continue;
      }
      num = ('0' <= a && a <= '9' || a == '-' || a== '+')? 1 : 0;
      if (pow && !num)
      {
        pow = 0;
        this.FONT(1, 0);
      }
      if (pow)
      {
        if (a != '+') { this.PRINT(a); p++; }
        continue;
      }
      this.PRINT(a);
    }
    this.FONT(1, 0);
    return p;
  }
*/
  POINT(x, y)
  {
    this.posX = this.ScrX(x);
    this.posY = this.ScrY(y);
  }
  LINE(x1, y1, x2, y2, c)
  {
    ctx.strokeStyle = c;
    ctx.beginPath();
    this.posX = this.ScrX(x1);
    this.posY = this.ScrY(y1);
    ctx.moveTo(this.posX, this.posY);
    this.posX = this.ScrX(x2);
    this.posY = this.ScrY(y2);
    ctx.lineTo(this.posX, this.posY);
    ctx.stroke();
    ctx.closePath();
  }
  LINE2(x2, y2, c)
  {
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.moveTo(this.posX, this.posY);
    this.posX = this.ScrX(x2);
    this.posY = this.ScrY(y2);
    ctx.lineTo(this.posX, this.posY);
    ctx.stroke();
    ctx.closePath();
  }
  LINEB(x1, y1, x2, y2, c)
  {
    this.LINE(x1, y1, x1, y2, c);
    this.LINE(x2, y1, x2, y2, c);
    this.LINE(x1, y1, x2, y1, c);
    this.LINE(x1, y2, x2, y2, c);
  }
/*
  LINEB(x1, y1, x2, y2, c)
  {
    let x, y, w, h;

    x = this.ScrX(x1);
    y = this.ScrY(y1);
    this.posX = this.ScrX(x2);
    this.posY = this.ScrY(y2);
    w = this.posX - x + 1;
    h = this.posY - y + 1;
    ctx.strokeStyle = c;
    ctx.strokeRect(x, y, w, h);
  }
*/
  LINEBF(x1, y1, x2, y2, c)
  {
    let x, y, w, h;

    x = this.ScrX(x1);
    y = this.ScrY(y1);
    this.posX = this.ScrX(x2);
    this.posY = this.ScrY(y2);
    w = this.posX - x + 1;
    h = this.posY - y + 1;
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  }
  CIRCLERF(x, y, r0, c)
  {
    let x0, y0;

    this.posX = x0 = this.ScrX(x);
    this.posY = y0 = this.ScrY(y);

    ctx.beginPath();
    ctx.arc(x0, y0, r0, 0, Math.PI * 2, true);
    ctx.fillStyle = c; // ctx.strokeStyle = c;
    ctx.fill();        // ctx.stroke();
  }
  // window func
  zooming(sign)
  {
    if (sign == 0) { this.zoom = this.zoom0; }
    else
    {
      this.zoom += sign * 5;
      if      (this.zoom <  20) this.zoom =  20;
      else if (this.zoom > 120) this.zoom = 120;
    }
    canvas.width  = 16 * this.zoom;
    canvas.height =  9 * this.zoom;
    ctx.lineWidth = this.width;
    this.FONT(1, 0);
  }
  lineWidth(times)
  {
    if (times == 1) { this.width = this.width0; }
    else
    {
      this.width *= times;
      if      (this.width < 1) this.width = 1;
      else if (this.width > 8) this.width = 8;
    }
    ctx.lineWidth = this.width;
  }
  // math func (precision)
  precision(a)
  {
    let s, i;

    s = a.toPrecision(12);
    s = s.replace(/[+-]/g, "");
    if (!(/^\d*\./.test(s)))
    { // 10の0を消す、1.0の0は消さない
      s = s.replace(/0+$/g, "");
    }
    s = s.replace(/\./g, "");
    s = s.replace(/^0+/g, "");
    s = s.replace(/[eE]\d+/g, "");

    return s.length;
  }
  precision0(a)
  {
    let s, i;

    s = a.toPrecision(12);
    s = s.replace(/[+-]/g, "");
    s = s.replace(/[eE]\d+/g, "");
    if (/^\d*\./.test(s))
    { // 1.0の0を消す、10の0は消さない
      s = s.replace(/0+$/g, "");
    }
    s = s.replace(/\./g, "");
    s = s.replace(/^0+/g, "");

    return s.length;
  }
}
