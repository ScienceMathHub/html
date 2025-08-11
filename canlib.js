/*
------------------------------------------------------------------------
 Canvas library (with Mouse library)

 HTML(JavaScript, canvas)

 (c)Ohtani 2024.4 - 2025.7
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
    this.WinX   =   0; //Window座標
    this.WinY   =   0;
    this.WinW   = 640;
    this.WinH   = 400;
    this.PosX   =   0; // グラフィックカレント
    this.PosY   =   0;
    this.LocX   =   0; // テキストカレント
    this.LocY   =   0;
    this.LocW   =   8; // テキストMサイズ
    this.LocH   =  16;
    this.OffW   =   0; // テキストSサイズ
    this.OffH   =   0;
    this.Zoom0  =  45; // 画面拡大基準値
    this.Zoom   =  45; // 画面拡大
    this.Width0 =   2; // 線幅基準値
    this.Width  =   2; // 線幅
    this.lineWidth(0); // 線幅制御
    this.zooming(0)  ; // 拡大縮小
    this.FONT(1, 0)  ; // 拡大,オフセット
    this.c = '#fff'  ; // PRINT COLOR
  }
  winX(x)
  {
    return (x * this.WinW / canvas.width) + this.WinX;
  }
  winY(y)
  {
    return (y * this.WinH / canvas.height) + this.WinY;
  }
  scrX(x)
  {
    return (x - this.WinX) * canvas.width  / this.WinW;
  }
  scrY(y)
  {
    return (y - this.WinY) * canvas.height / this.WinH;
  }
  winW(w)
  {
    return w * this.WinW / canvas.width;
  }
  winH(h)
  {
    return h * this.WinH / canvas.height;
  }
  scrW(w)
  {
    return w * canvas.width  / this.WinW;
  }
  scrH(h)
  {
    return h * canvas.height / this.WinH;
  }
  WINDOW(x1, y1, x2, y2)
  {
    this.WinX = x1;
    this.WinY = y1;
    this.WinW = x2 - x1;
    this.WinH = y2 - y1;
  }
  LOCATEp(x, y)
  {
    if (x !== '') this.LocX = this.scrX(x);
    if (y !== '') this.LocY = this.scrY(y);
  }
  LOCATE(x, y)
  {
    if (x !== '') this.LocX = x * this.LocW;
    if (y !== '') this.LocY = y * this.LocH;
  }
  TAB(x, y)
  {
    if (x !== '') this.LocX += x * this.LocW;
    if (y !== '') this.LocY += y * this.LocH;
  }
  CR()
  {
    this.LocX = 0;
    this.LocY += this.LocH;
  }
  CRn(n)
  {
    this.LocX = 0;
    this.LocY += this.LocH * n;
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

    zoom = Math.round(this.Zoom * zoom / 40 * 8);
    offs = Math.round(this.Zoom * offs / 40 * 8);
    this.OffH = offs * 2;
    offs = Math.round(this.Zoom        / 40 * 8);
    this.LocH = offs * 2;
    h    = zoom * 2;
    ctx.font = h + "px 'ＭＳ ゴシック'";
//    ctx.font = h + "px 'sans-serif'";
//    ctx.font = h + "px '游ゴシック'";
//    ctx.font = h + "px '游明朝'";
    this.LocW = ctx.measureText('あ').width / 2;
  }
  COLOR(c)
  {
    ctx.fillStyle   = c;
    ctx.strokeStyle = c;
    this.c = c;
  }
  SYMBOL(x, y, text, c)
  {
    let x1, y1;

    x1 = this.scrX(x);
    y1 = this.scrY(y);
    ctx.fillStyle   = c;
    ctx.strokeStyle = c;
    ctx.fillText(text, x1, y1);
  }
  PRINT(text)
  {
    let s, n, i, w, x, y, m, a, c;

    c = this.c;
    ctx.fillStyle   = c;
    ctx.strokeStyle = c;

    s = String(text);
    n = s.length;
    for (i = 0; i < n; i++)
    {
      a = s.substring(i, i+1);
      w = this.LocW * 2;
      if (a.match(/[ -~]/)) w = this.LocW;
      if (a.match(/[ｧ-ﾝ]/)) w = this.LocW;
      m = ctx.measureText(a).width;
      x = (w - m) / 2;
      y = this.LocH - 1 + this.OffH;
      ctx.fillText(a, this.LocX + x, this.LocY + y);
      this.LocX += w;
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
        this.LocX -= this.LocW * 0.5;
        continue;
      }
      if (a == '^')
      {
        i++;
        a = s.substring(i, i+1);
        if (a == "'")
        {
          this.LocX += this.LocW * 0.3;
          continue;
        }
        if (a == "`")
        {
          this.LocX -= this.LocW * 0.3;
          continue;
        }
        this.FONT(0.7, -0.3);
        this.PRINT(a); p++;
        this.FONT(1, 0);
        continue;
      }
      if (a == '_')
      {
        i++;
        a = s.substring(i, i+1);
        if (a == "'")
        {
          this.LocX += this.LocW * 0.5;
          continue;
        }
        if (a == "`")
        {
          this.LocX -= this.LocW * 0.5;
          continue;
        }
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
  POINT(x, y)
  {
    this.PosX = this.scrX(x);
    this.PosY = this.scrY(y);
  }
  LINE(x1, y1, x2, y2, c)
  {
    ctx.strokeStyle = c;
    ctx.beginPath();
    this.PosX = this.scrX(x1);
    this.PosY = this.scrY(y1);
    ctx.moveTo(this.PosX, this.PosY);
    this.PosX = this.scrX(x2);
    this.PosY = this.scrY(y2);
    ctx.lineTo(this.PosX, this.PosY);
    ctx.stroke();
    ctx.closePath();
  }
  LINE2(x2, y2, c)
  {
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.moveTo(this.PosX, this.PosY);
    this.PosX = this.scrX(x2);
    this.PosY = this.scrY(y2);
    ctx.lineTo(this.PosX, this.PosY);
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
  LINEBF(x1, y1, x2, y2, c)
  {
    let x, y, w, h;

    x = this.scrX(x1);
    y = this.scrY(y1);
    this.PosX = this.scrX(x2);
    this.PosY = this.scrY(y2);
    w = this.PosX - x + 1;
    h = this.PosY - y + 1;
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
    this.LINEB(x1, y1, x2, y2, c)
  }
  ARC(x, y, r, c, t0, t1, dir = true)
  {
    let x0, y0, r0;
    this.PosX = x0 = this.scrX(x);
    this.PosY = y0 = this.scrY(y);
    r0 = Math.abs(this.scrH(r));
    ctx.beginPath();
    ctx.arc(x0, y0, r0, -t0, -t1, dir);
    ctx.strokeStyle = c;
    ctx.stroke();
  }
  ARCF(x, y, r, c, t0, t1, dir = true)
  {
    let x0, y0, r0;

    this.PosX = x0 = this.scrX(x);
    this.PosY = y0 = this.scrY(y);
    r0 = Math.abs(this.scrH(r));

    ctx.beginPath();
    ctx.arc(x0, y0, r0, -t0, -t1, dir);
    ctx.fillStyle = c; // ctx.strokeStyle = c;
    ctx.fill();        // ctx.stroke();
  }
  CIRCLE(x, y, r, c, t0 = 0, t1 = Math.PI*2, dir = true)
  {
    let x0, y0, r0;

    this.PosX = x0 = this.scrX(x);
    this.PosY = y0 = this.scrY(y);
    r0 = Math.abs(this.scrH(r));

    ctx.beginPath();
    ctx.arc(x0, y0, r0, -t0, -t1, dir);
    ctx.strokeStyle = c;
    ctx.stroke();
  }
  CIRCLEF(x, y, r, c, t0 = 0, t1 = Math.PI*2, dir = true)
  {
    let x0, y0, r0;

    this.PosX = x0 = this.scrX(x);
    this.PosY = y0 = this.scrY(y);
    r0 = Math.abs(this.scrH(r));

    ctx.beginPath();
    ctx.arc(x0, y0, r0, -t0, -t1, dir);
    ctx.fillStyle = c; // ctx.strokeStyle = c;
    ctx.fill();        // ctx.stroke();
  }
  // window func
  zooming(sign)
  {
    if (sign == 0) { this.Zoom = this.Zoom0; }
    else
    {
      this.Zoom += sign * 5;
      if      (this.Zoom <  20) this.Zoom =  20;
      else if (this.Zoom > 120) this.Zoom = 120;
    }
    canvas.width  = 16 * this.Zoom;
    canvas.height = 10 * this.Zoom;
    ctx.lineWidth = this.Width;
    this.FONT(1, 0);
  }
  lineWidth(times)
  {
    if (times == 1) { this.Width = this.Width0; }
    else
    {
      this.Width *= times;
      if      (this.Width < 1) this.Width = 1;
      else if (this.Width > 8) this.Width = 8;
    }
    ctx.lineWidth = this.Width;
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

//----------------------------------------------------------------------
// MOUSE
//----------------------------------------------------------------------
let MOUSEmosX      =    0;  // Down座標x
let MOUSEmosY      =    0;  // Down座標y
let MOUSEmosD      =    0;  // Down
let MOUSEmosW      =    0;  // Double
let MOUSEmosDnFunc = null;  // return {true:false} func(x, y, touch)
let MOUSEmosMvFunc = null;
let MOUSEmosUpFunc = null;
class MOUSE
{
  constructor()
  {
    this.OfsX      =    0;
    this.OfsY      =    0;
    MOUSEmosX      =    0;
    MOUSEmosY      =    0;
    MOUSEmosD      =    0;
    MOUSEmosDnFunc = null;  // return {true:false} func(x, y, touch)
    MOUSEmosMvFunc = null;
    MOUSEmosUpFunc = null;
  }
  add()
  {
    if(document.addEventListener)
    {
      document.addEventListener("mousedown" , this.mouseDn,
        {passive:false});
      document.addEventListener("mousemove" , this.mouseMv,
        {passive:false});
      document.addEventListener("mouseup"   , this.mouseUp);

      document.addEventListener("touchstart", this.touchDn,
        {passive:false});
      document.addEventListener("touchmove" , this.touchMv,
        {passive:false});
      document.addEventListener("touchend"  , this.touchUp);
    }
    else if(document.attachEvent)
    {
      document.attachEvent("onmousedown" , this.mouseDn,
        {passive:false});
      document.attachEvent("onmousemove" , this.mouseMv,
        {passive:false});
      document.attachEvent("onmouseup"   , this.mouseUp);

      document.attachEvent("ontouchstart", this.touchDn,
        {passive:false});
      document.attachEvent("ontouchmove" , this.touchMv, 
        {passive:false});
      document.attachEvent("ontouchend"  , this.touchUp);
    }
  }
  remove()
  {
    if(document.removeEventListener)
    {
      document.removeEventListener("mousedown" , this.mouseDn,
        {passive:false});
      document.removeEventListener("mousemove" , this.mouseMv,
        {passive:false});
      document.removeEventListener("mouseup"   , this.mouseUp);

      document.removeEventListener("touchstart", this.touchDn,
        {passive:false});
      document.removeEventListener("touchmove" , this.touchMv,
        {passive:false});
      document.removeEventListener("touchend"  , this.mouseUp);
    }
    else if(document.detachEvent)
    {
      document.detachEvent("onmousedown" , this.mouseDn,
        {passive:false});
      document.detachEvent("onmousemove" , this.mouseMv,
        {passive:false});
      document.detachEvent("onmouseup"   , this.mouseUp);

      document.detachEvent("ontouchstart", this.touchDn,
        {passive:false});
      document.detachEvent("ontouchmove" , this.touchMv, 
        {passive:false});
      document.detachEvent("ontouchend"  , this.mouseUp);
    }
  }
  mosDnFunc(func)
  {
    MOUSEmosDnFunc = func;
  }
  mosMvFunc(func)
  {
    MOUSEmosMvFunc = func;
  }
  mosUpFunc(func)
  {
    this.mosUpFunc = func;
  }
  // private
  mouseDn(event)
  {
    let x = event.clientX;
    let y = event.clientY;
    let rect = canvas.getBoundingClientRect();
//    let w = rect.right - rect.left;
//    let h = rect.bottom - rect.top;

    x -= rect.left;
    y -= rect.top;

//    if (x < 0 || x > w || y < 0)
    if (x < 0 || y < 0)
    {
      if (MOUSEmosW)
      {
        event.preventDefault();
        MOUSEmosW = 0;
        return;
      }
      MOUSEmosW++;
      setTimeout(function () { MOUSEmosW = 0; }, 500);
      return;
    }

    MOUSEmosW = 0;
    MOUSEmosX = x;
    MOUSEmosY = y;
    if (MOUSEmosDnFunc)
    {
      if (MOUSEmosDnFunc(x, y, 0))
      { MOUSEmosD = 1; event.preventDefault(); }
    }
  }
  touchDn(event)
  {
    let x = event.changedTouches[0].pageX;
    let y = event.changedTouches[0].pageY;
    let rect = canvas.getBoundingClientRect();
//    let w = rect.right - rect.left;
//    let h = rect.bottom - rect.top;

    x -= rect.left;
    y -= rect.top;
 
//    if (x < 0 || x > w || y < 0)
    if (x < 0 || y < 0)
    {
      if (MOUSEmosW)
      {
        event.preventDefault();
        MOUSEmosW = 0;
        return;
      }
      MOUSEmosW++;
      setTimeout(function () { MOUSEmosW = 0; }, 500);
      return;
    }

    MOUSEmosW = 0;
    MOUSEmosX = x;
    MOUSEmosY = y;

    if (MOUSEmosDnFunc)
    {
      if (MOUSEmosDnFunc(x, y, 1))
      { MOUSEmosD = 1; event.preventDefault(); }
    }
  }
  mouseMv(event)
  {
    if (!MOUSEmosD) return;
    event.preventDefault();

    let x = event.clientX;
    let y = event.clientY;
    let rect = canvas.getBoundingClientRect();

    x -= rect.left;
    y -= rect.top;

    if (MOUSEmosMvFunc)
    {
      MOUSEmosMvFunc(x, y, 0);
    }
  }
  touchMv(event)
  {
    if (!MOUSEmosD) return;
    event.preventDefault();

    let x = event.changedTouches[0].pageX;
    let y = event.changedTouches[0].pageY;
    let rect = canvas.getBoundingClientRect();

    x -= rect.left;
    y -= rect.top;

    if (MOUSEmosMvFunc)
    {
      MOUSEmosMvFunc(x, y, 1);
    }
  }
  mouseUp(event)
  {
    let x = event.clientX;
    let y = event.clientY;
    let rect = canvas.getBoundingClientRect();

    x -= rect.left;
    y -= rect.top;

    MOUSEmosD = 0;
    if (MOUSEmosUpFunc)
    {
      MOUSEmosUpFunc(x, y, 0);
    }
  }
  touchUp(event)
  {
    let x = event.changedTouches[0].pageX;
    let y = event.changedTouches[0].pageY;
    let rect = canvas.getBoundingClientRect();

    x -= rect.left;
    y -= rect.top;

    MOUSEmosD = 0;
    if (MOUSEmosUpFunc)
    {
      MOUSEmosUpFunc(x, y, 1);
    }
  }
  // public
  ofsX(x)
  {
    if (x !== '')  this.OfsX = x;
    return this.OfsX;
  }
  ofsY(y)
  {
    if (y !== '')  this.OfsY = y;
    return this.OfsY;
  }
}
