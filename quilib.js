/*
------------------------------------------------------------------------
 Quiz library

 HTML(JavaScript, canvas)

 (c)Ohtani 2025.8
------------------------------------------------------------------------
*/
'use strict'

//----------------------------------------------------------------------
// QUIZ
//----------------------------------------------------------------------
class QUIZ
{
  constructor()
  {
    this.lev = this.cou = this.num = this.ans = this.yn = this.qui = 0;
    this.sta = 0;
    this.d   = [0, 0];
    this.are = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
  }
  init()
  {
    this.lev  = 1;      // 難易度
    this.cou  = 1;      // 問題数
    this.num  = 0;      // 問題番号
    this.ans  = 0;      // 解答番号(1-4)
    this.yn   = 0;      // 解答番号(1-2)
    this.d    = [0, 0]; // 角度θ[°]
    this.qui  = 0;      // Quiz
    this.sta  = 0;      // State 0:通常 1:正解 2:残念
    this.are = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
  }
  setarea(a)
  {
    this.are = a;
    return a.length;
  }
  area(n)
  {
    let len = this.are.length;

    if (1 <= n && n <= len) return this.are[n-1];
    return len;
  }
  state(n)
  {
    if (n != -1) this.sta = n;
    return this.sta;
  }
  level(n)
  {
    if (n != -1) this.lev = n;
    return this.lev;
  }
  count(n)
  {
    if (n != -1) this.cou = n;
    return this.cou;
  }
  number(n)
  {
    if (n != -1) this.num = n;
    return this.num;
  }
  answer(n)
  {
    if (this.sta < 2)
    {
      if (n != -1) this.ans = n;
    }
    return this.ans;
  }
  yesno(n)
  {
    if (n != -1) this.yn = n;
    return this.yn;
  }
  quiz(q)
  {
    if (q !== null) this.qui = q;
    return this.qui;
  }
  #fix(x)
  {
    let a;

    a = x.toFixed(1);
    return Number(a);
  }
  rad(d)
  {
    return d * Math.PI / 180;
  }
  deg(t)
  {
    return t * 180 / Math.PI;
  }
  setd(d, n)
  {
    while (d <    0) d += 360;
    while (d >= 360) d -= 360;
    d = this.#fix(d);
    this.d[n] = d;
    return this.d[n];
  }
  getd(n)
  {
    return this.d[n];
  }
  //--------------------------------------------------------------------
  // question
  //--------------------------------------------------------------------
  #shuffle(quiz)
  {
    const s =
    [
      [1, 2, 3, 4], [1, 2, 4, 3],
      [1, 3, 2, 4], [1, 3, 4, 2],
      [1, 4, 2, 3], [1, 4, 3, 2],
      [2, 1, 3, 4], [2, 1, 4, 3],
      [2, 3, 1, 4], [2, 3, 4, 1],
      [2, 4, 1, 3], [2, 4, 3, 1],
      [3, 1, 2, 4], [3, 1, 4, 2],
      [3, 2, 1, 4], [3, 2, 4, 1],
      [3, 4, 1, 2], [3, 4, 2, 1],
      [4, 1, 2, 3], [4, 1, 3, 2],
      [4, 2, 1, 3], [4, 2, 3, 1],
      [4, 3, 1, 2], [4, 3, 2, 1]
    ];
    let q, i;

    q = [ 0, 1, 2, 3, 4, 5 ];
    i = Math.floor(Math.random() * s.length);
    i = s[i];
    q[  0 ] =   quiz[0]   ;
    q[i[0]] =   quiz[1]   ;
    q[i[1]] =   quiz[2]   ;
    q[i[2]] =   quiz[3]   ;
    q[i[3]] =   quiz[4]   ;
    q[  5 ] = i[quiz[5]-1];
    return q;
  }
  question(lev, cou, quiz0)
  {
    let quiz, i;

    quiz = quiz0[lev - 1];
    quiz = quiz[cou - 1];
    i = Math.floor(Math.random() * quiz.length);
    this.number(i+1);
    quiz = quiz[i];

    return this.#shuffle(quiz)
  }
}
