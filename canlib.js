/*
------------------------------------------------------------------------
 Canvas library

 HTML(JavaScript, canvas)

 (c)Ohtani 2024.4
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
// public variable
//----------------------------------------------------------------------
var WinX, WinY, WinW, WinH; // Window座標
var PosX, PosY;   // グラフィックカレント
var LocX, LocY;   // テキストカレント
var LocW, LocH;   // テキストMサイズ
var OffW, OffH;   // テキストSサイズ
var Zoom;         // 拡大率×(16,9)
var Width;        // 線幅
var Zoom0  = 40;  // 拡大率×(16,9)
var Width0 = 2;   // 線幅初期値

//----------------------------------------------------------------------
// 描画関数
//----------------------------------------------------------------------
function winX(x)
{
  return (x * WinW / canvas.width) + WinX;
}

function winY(y)
{
  return (y * WinH / canvas.height) + WinY;
}

function scrX(x)
{
  return Math.round((x - WinX) * canvas.width  / WinW);
}

function scrY(y)
{
  return Math.round((y - WinY) * canvas.height / WinH);
}

function scrW(w)
{
  return Math.round(w * canvas.width  / WinW);
}

function scrH(h)
{
  return Math.round(h * canvas.height / WinH);
}

function WINDOW(x1, y1, x2, y2)
{
  WinX = x1;
  WinY = y1;
  WinW = x2 - x1 + 1;
  WinH = y2 - y1 + 1;
}

function LOCATE(x, y)
{
  LocX = x * LocW;
  LocY = y * LocH;
}

function TAB(x, y)
{
  LocX += x * LocW;
  LocY += y * LocH;
}

function CR()
{
  LocX = 0;
  LocY += LocH;
}

function CRn(n)
{
  LocX = 0;
  LocY += LocH * n;
}

function CLS(c)
{
  ctx.fillStyle = c;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  LOCATE(0, 0);
}

function COLOR(c)
{
  ctx.fillStyle   = c;
  ctx.strokeStyle = c;
}

String.prototype.bytes = function ()
{
  return(encodeURIComponent(this).replace(/%../g,"x").length);
}

function FONT(zoom, offs)
{
  var h;

  zoom = Math.round(Zoom * zoom / 40 * 8);
  LocW = zoom;
  h    = zoom * 2;
  offs = Math.round(Zoom * offs / 40 * 8);
  OffH = offs * 2;
  offs = Math.round(Zoom        / 40 * 8);
  LocH = offs * 2;
  ctx.font = h + "px 'ＭＳ ゴシック'";  
}

function PRINT(text)
{
  var len, b;

  text += '';
  ctx.fillText(text, LocX, LocY + OffH  - 1);
  LocX += ctx.measureText(text).width;
/*
  b     = text.bytes();
  len   = text.length;
  b    -= len;
  b     = b / 2;
  len  += b;
  ctx.fillText(text, LocX, LocY + OffH  - 1);
  LocX += len * LocW;
*/
}

function SYMBOL(x, y, text, c)
{
  var x1, y1;

  x1 = scrX(x);
  y1 = scrY(y);
  ctx.fillStyle   = c;
  ctx.strokeStyle = c;
  ctx.fillText(text, x1, y1);
}

function POINT(x, y)
{
  PosX = scrX(x);
  PosY = scrY(y);
}

function LINE(x1, y1, x2, y2, c)
{
  ctx.strokeStyle = c;
  ctx.beginPath();
  PosX = scrX(x1);
  PosY = scrY(y1);
  ctx.moveTo(PosX, PosY);
  PosX = scrX(x2);
  PosY = scrY(y2);
  ctx.lineTo(PosX, PosY);
  ctx.stroke();
  ctx.closePath();
}

function LINE2(x2, y2, c)
{
  ctx.strokeStyle = c;
  ctx.beginPath();
  ctx.moveTo(PosX, PosY);
  PosX = scrX(x2);
  PosY = scrY(y2);
  ctx.lineTo(PosX, PosY);
  ctx.stroke();
  ctx.closePath();
}

function LINEB(x1, y1, x2, y2, c)
{
  LINE(x1, y1, x1, y2, c);
  LINE(x2, y1, x2, y2, c);
  LINE(x1, y1, x2, y1, c);
  LINE(x1, y2, x2, y2, c);
}
/*
function LINEB(x1, y1, x2, y2, c)
{
  var x, y, w, h;

  x = scrX(x1);
  y = scrY(y1);
  PosX = scrX(x2);
  PosY = scrY(y2);
  w = PosX - x + 1;
  h = PosY - y + 1;
  ctx.strokeStyle = c;
  ctx.strokeRect(x, y, w, h);
}
*/

function LINEBF(x1, y1, x2, y2, c)
{
  var x, y, w, h;

  x = scrX(x1);
  y = scrY(y1);
  PosX = scrX(x2);
  PosY = scrY(y2);
  w = PosX - x + 1;
  h = PosY - y + 1;
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}

function CIRCLERF(x, y, r0, c)
{
  var x0, y0;

  PosX = x0 = scrX(x);
  PosY = y0 = scrY(y);

  ctx.beginPath();
  ctx.arc(x0, y0, r0, 0, Math.PI * 2, true);
  ctx.fillStyle = c; // ctx.strokeStyle = c;
  ctx.fill();        // ctx.stroke();
}

//----------------------------------------------------------------------
// Line width
//----------------------------------------------------------------------
function lineWidth(times)
{
  if (times == 1) { Width = Width0; }
  else
  {
    Width *= times;
    if      (Width <  1) Width =  1;
    else if (Width > 16) Width = 16;
  }
}

//----------------------------------------------------------------------
// Zoom
//----------------------------------------------------------------------
function zooming(sign)
{
  if (sign == 0) { Zoom = Zoom0; }
  else
  {
    Zoom += sign * 5;
    if      (Zoom <  20) Zoom =  20;
    else if (Zoom > 120) Zoom = 120;
  }
  canvas.width  = 16 * Zoom;
  canvas.height =  9 * Zoom;

  FONT(1, 0);
}

//----------------------------------------------------------------------
// 指数
//----------------------------------------------------------------------
function PRINTe(s)
{
  var i, n, pow, num, a, p;

  s = String(s);
  p = 0;
  num = pow = 0;
  n = s.length;
  for (i = 0; i < n; i++)
  {
    a = s.substring(i, i+1);
    if (a == 'θ')
    {
      PRINT(a);
      LocX -= LocW / 2;
      continue;
    }
    if (a == '^')
    {
      i++;
      a = s.substring(i, i+1);
      FONT(0.7, -0.3);
      PRINT(a);
      FONT(1, 0);
      continue;
    }
    if (a == '_')
    {
      i++;
      a = s.substring(i, i+1);
      FONT(0.6, 0.2);
      PRINT(a);
      FONT(1, 0);
      continue;
    }
    if (num && (a == 'e' || a == 'E'))
    {
      pow = 1;
      PRINT("x10");
      FONT(0.7, -0.4);
      continue;
    }
    num = ('0' <= a && a <= '9' || a == '-' || a== '+')? 1 : 0;
    if (pow && !num)
    {
      pow = 0;
      FONT(1, 0);
    }
    if (pow)
    {
      if (a != '+') { PRINT(a); p++; }
      continue;
    }
    PRINT(a);
  }
  FONT(1, 0);
  return p;
}

//----------------------------------------------------------------------
// 有効数字
//----------------------------------------------------------------------
function precision(a)
{
  var s, i;

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

function precision0(a)
{
  var s, i;

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

//----------------------------------------------------------------------
