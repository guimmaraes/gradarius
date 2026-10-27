/* Biorritmo Gradarius: funções de cálculo (puras, sem DOM).
   Usadas pelo app.js e pelo testes.html. Tudo roda no navegador. */
(function (raiz) {
  'use strict';

  var DIA_MS = 86400000;

  /* Ciclos: T em dias. cor = tema claro, corEscuro = tema escuro.
     traco = padrão de linha (SVG stroke-dasharray) para não depender só da cor. */
  var CICLOS = [
    { id: 'corpo',    T: 23, profundo: false, cor: '#c8553d', corEscuro: '#e0765f', traco: '' },
    { id: 'emocoes',  T: 28, profundo: false, cor: '#4a56a6', corEscuro: '#8e9bf0', traco: '9 5' },
    { id: 'mente',    T: 33, profundo: false, cor: '#5c9c6e', corEscuro: '#7fc592', traco: '2 4' },
    { id: 'harmonia', T: 38, profundo: true,  cor: '#d46a92', corEscuro: '#e88db0', traco: '14 4 2 4' },
    { id: 'manas',    T: 43, profundo: true,  cor: '#7b5aa6', corEscuro: '#a98ad6', traco: '6 3' },
    { id: 'budhi',    T: 48, profundo: true,  cor: '#b8934a', corEscuro: '#d4b06a', traco: '1 3' },
    { id: 'atma',     T: 53, profundo: true,  cor: '#4fa3c7', corEscuro: '#6cc0e6', traco: '12 3 2 3 2 3' }
  ];

  /* Data como objeto {a, m, d} (ano, mês 1-12, dia). */
  function data(a, m, d) { return { a: a, m: m, d: d }; }

  /* UTC ao meio-dia: evita erro de horário de verão. */
  function utc(dt) { return Date.UTC(dt.a, dt.m - 1, dt.d, 12, 0, 0); }

  function dataReal(a, m, d) {
    if (!isFinite(a) || !isFinite(m) || !isFinite(d)) return false;
    if (m < 1 || m > 12 || d < 1) return false;
    var t = new Date(Date.UTC(a, m - 1, d, 12));
    return t.getUTCFullYear() === a && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
  }

  /* Aceita "dd/mm/aaaa" ou "aaaa-mm-dd". Devolve {a,m,d} ou null. */
  function lerData(texto) {
    var t = String(texto || '').trim(), r;
    if ((r = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t))) r = data(+r[3], +r[2], +r[1]);
    else if ((r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t))) r = data(+r[1], +r[2], +r[3]);
    else return null;
    return dataReal(r.a, r.m, r.d) ? r : null;
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function formatar(dt) { return pad(dt.d) + '/' + pad(dt.m) + '/' + dt.a; }
  function formatarIso(dt) { return dt.a + '-' + pad(dt.m) + '-' + pad(dt.d); }
  function formatarCurto(dt) { return pad(dt.d) + '/' + pad(dt.m); }

  function somarDias(dt, k) {
    var t = new Date(utc(dt) + k * DIA_MS);
    return data(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
  }

  /* Dias inteiros entre duas datas de calendário (ref - nasc). */
  function diasEntre(nasc, ref) { return Math.round((utc(ref) - utc(nasc)) / DIA_MS); }

  function comparar(x, y) { return utc(x) - utc(y); }

  /* Valor do ciclo (-1 a 1) para d dias vividos. */
  function valor(d, T) { return Math.sin(2 * Math.PI * d / T); }

  function porcento(d, T) {
    var p = Math.round(valor(d, T) * 100);
    return p === 0 ? 0 : p; /* evita -0 */
  }

  /* O ciclo cruza o zero no intervalo (d-1, d]? Meio ciclo = T/2 dias. */
  function ehTroca(d, T) {
    var meio = T / 2;
    return Math.floor(d / meio) !== Math.floor((d - 1) / meio);
  }

  /* Fase do dia: 'troca' | 'alta' | 'subindo' | 'recolhimento' | 'baixa'. */
  function fase(d, T) {
    if (ehTroca(d, T)) return 'troca';
    var v = valor(d, T);
    var subindo = Math.cos(2 * Math.PI * d / T) > 0;
    if (v > 0.5) return 'alta';
    if (v < -0.5) return 'baixa';
    if (v >= 0) return subindo ? 'subindo' : 'recolhimento';
    /* entre -50% e 0: descendo = recolhimento; subindo = energia voltando */
    return subindo ? 'subindo' : 'recolhimento';
  }

  /* Próximos dias de troca: lista de deslocamentos k (1..limite) a partir de d. */
  function proximasTrocas(d, T, limite) {
    var r = [];
    for (var k = 1; k <= limite; k++) if (ehTroca(d + k, T)) r.push(k);
    return r;
  }

  /* Série de porcentagens exatas (sem arredondar) de -passado a +futuro. */
  function serie(d, T, passado, futuro) {
    var r = [];
    for (var k = -passado; k <= futuro; k++) r.push(valor(d + k, T) * 100);
    return r;
  }

  var API = {
    CICLOS: CICLOS, data: data, dataReal: dataReal, lerData: lerData,
    formatar: formatar, formatarIso: formatarIso, formatarCurto: formatarCurto,
    somarDias: somarDias, diasEntre: diasEntre, comparar: comparar,
    valor: valor, porcento: porcento, ehTroca: ehTroca, fase: fase,
    proximasTrocas: proximasTrocas, serie: serie
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else raiz.Biorritmo = API;
})(this);
