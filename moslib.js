/*
------------------------------------------------------------------------
 Mouse Touch library

 HTML(JavaScript)

 (c)Ohtani 2025.1
------------------------------------------------------------------------
*/
'use strict'

//----------------------------------------------------------------------
// MOUSE
//----------------------------------------------------------------------
let MOUSEmosX      =    0;
let MOUSEmosY      =    0;
let MOUSEmosD      =    0;
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
    let x, y;

    if (!MOUSEmosD) return;
    event.preventDefault();

    x = event.clientX;
    y = event.clientY;
    if (MOUSEmosMvFunc)
    {
      MOUSEmosMvFunc(x, y, 0);
    }
  }
  touchMv(event)
  {
    let x, y;

    if (!MOUSEmosD) return;
    event.preventDefault();

    x = event.changedTouches[0].pageX;
    y = event.changedTouches[0].pageY;
    if (MOUSEmosMvFunc)
    {
      MOUSEmosMvFunc(x, y, 1);
    }
  }
  mouseUp(event)
  {
    let x = event.clientX;
    let y = event.clientY;

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
