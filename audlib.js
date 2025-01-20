/*
------------------------------------------------------------------------
 Audio library

 HTML(JavaScript)

 (c)Ohtani 2025.1
------------------------------------------------------------------------
*/
'use strict'

//----------------------------------------------------------------------
// Audio
//----------------------------------------------------------------------
class AUDIO
{
  constructor()
  {
    this.Aun    = 128;
    this.Aup    = new Array(this.Aun);
    this.Auw    = 0;
    this.Aur    = 0;
    this.Aui    = 0;
    this.Rate   = 48000;
    this.Volume = 1;
    this.Base   = 1;
    this.Sec    = 1;
    this.Octa   = 4;
    this.Kn     = 21;
    this.Kfreq =
    [ // 平均律
      261.626, 277.183, 293.665, 311.127, 329.628, 349.228,
      369.994, 391.995, 415.305, 440.000, 466.164, 493.883, 523.251,
      // 純正律
      264    , 297    , 330    , 352    ,
      396    , 440    , 495    , 528
      // ピタゴラス音階
//      260.7  , 293.3  , 330    , 347.7  ,
//      391.1  , 440    , 495    , 521.5
    ];
    this.AuBd = new Array(this.Kn);
    this.AuOn = new Array(this.Kn);
    this.AuCt = 0;
    this.Freq = 0;
    for (let i = 0; i < this.Kn; i++) { this.AuBd[i] = 0; }
    this.Temp = '';
  }
  getCount()
  {
    return this.Aui + this.AuCt;
  }
  getRate()
  {
    return this.Rate;
  }
  getFreq()
  {
    return this.Freq;
  }
  setVolume(v)
  {
    this.Volume = v;
  }
  setBase(hz)
  {
    this.Base = hz;
  }
  setSec(s)
  {
    this.Sec = s;
  }
  setOcta(oct)
  {
    this.Octa = oct;
  }
  webAudio(freq, func)
  {
    let buffer, au, audioctx, vol, fact, rate;

    this.Freq = freq;
    audioctx = new (window.AudioContext || window.webkitAudioContext)();
    this.Rate = rate = audioctx.sampleRate;
//    const gNode = audioctx.createGain(); gNode.gain.value = 0.5;

    buffer = audioctx.createBuffer(2, rate * this.Sec, rate);

    vol  = this.Volume * 0.5;

    fact =  this.Sec / buffer.length;
    for (let ch = 0; ch < buffer.numberOfChannels; ch++)
    {
      let arr = buffer.getChannelData(ch);

      for (var i = 0; i < buffer.length; i++)
      {
        let t = i * freq * fact / this.Base;

        arr[i] = func(t) * vol;
      }
    }
    au = audioctx.createBufferSource();
    au.buffer = buffer;
    au.connect(audioctx.destination);
//    au.connect(gNode).connect(audioctx.destination);
    return [audioctx, au];
  }
  pop()
  {
    let a;

    if (this.Aui <= 0) return 0;
    this.Aur = (this.Aur + 1) % this.Aun;
    a = this.Aup[this.Aur];
    a[1].disconnect();
    a[1].buffer = null;
    a[0].close();
    this.Aui--;
    return 1;
  }
  push(a)
  {
    if (this.Aui >= this.Aun) { this.pop() };
    this.Auw = (this.Auw + 1) % this.Aun;
    this.Aup[this.Auw] = a;
    this.Aui++;
  }
  #keyboardInit()
  {
    let au;

    for (let i = 0; i < this.Kn; i++)
    {
      this.AuOn[i] = 0;
      au = this.AuBd[i];
      if (au != 0)
      {
        au[1].disconnect();
        au[1].buffer = null;
        au[0].close();
        this.AuBd[i] = 0;
      }
    }
    this.AuCt = 0;
  }
  stop()
  {
    while (this.pop());
    this.#keyboardInit();
  }
  audioOn(freq, func)
  {
    let au;

    au = this.webAudio(freq, func);
    au[1].loop = true; //false;
    au[1].start(0);
    this.push(au);
  }
  keyboard(on, key, func, bank)
  {
    let au = this.AuBd[key];

    if (on)
    {
      let i;

      if (this.AuOn[key] != 0) return;
      this.AuCt++;
      i = bank * 10 + this.Octa;
      if (au != 0 && this.AuOn[key] == i)
      {
        au[0].resume();
      }
      else
      {
        let freq;

        if (au != 0)
        {
          au[1].disconnect();
          au[1].buffer = null;
          au[0].close();
        }
        freq  = Math.pow(2, this.Octa - 4);
        freq *= this.Kfreq[key];  
        au = this.webAudio(freq, func);
        au[1].loop = true;
        au[1].start(0);
        this.AuBd[key] = au;
      }
      this.AuOn[key] = i;
      return;
    }
    if (this.AuOn[key] == 0 || au == 0) return;
    this.AuOn[key] = 0;
    this.AuCt--;
//    au[0].close(); this.AuBd[key] = 0;
    au[0].suspend();
  }
}
