/* Tattwas Gradarius: funções de cálculo (puras, sem DOM).
   Usadas pelo app.js e pelo testes.html. Aritmética simples de horário; só `solNascerPor` usa astronomia (para o botão de localização).
   Horários são minutos desde a meia-noite (0 a 1439). */
(function (raiz) {
  'use strict';

  var DIA = 1440;
  var BLOCO = 24;          /* minutos de cada elemento */
  var ELEMENTOS = ['akasa', 'vayu', 'tejas', 'apas', 'prithivi']; /* ordem fixa */

  /* "hh:mm" (ou "hhmm") -> minutos. Devolve null se inválido. */
  function lerHora(texto) {
    var t = String(texto || '').trim(), m;
    if ((m = /^(\d{1,2})[:h.](\d{2})$/.exec(t)) || (m = /^(\d{2})(\d{2})$/.exec(t))) {
      var h = +m[1], mi = +m[2];
      if (h < 24 && mi < 60) return h * 60 + mi;
    }
    return null;
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function mod(n, m) { return ((n % m) + m) % m; }

  /* minutos -> "hh:mm" (dá a volta na meia-noite). */
  function formatar(min) {
    var m = mod(Math.floor(min), DIA);
    return pad(Math.floor(m / 60)) + ':' + pad(m % 60);
  }

  /* Blocos do dia inteiro, a partir do nascer do sol.
     Dia: do nascer ao pôr. Noite: do pôr ao próximo nascer (mesmo horário).
     Cada período recomeça em Âkâza e segue de 24 em 24 minutos; o último bloco é cortado no limite.
     Cada bloco: { inicio, fim, elemento, periodo } com minutos ABSOLUTOS contados a partir da meia-noite
     do dia do nascer (podem passar de 1440). Devolve null se o nascer não for antes do pôr. */
  function blocos(nascer, por) {
    if (nascer === null || por === null || !(nascer < por)) return null;
    var lista = [];
    function periodo(de, ate, nome) {
      for (var k = 0, ini = de; ini < ate; k++, ini += BLOCO) {
        lista.push({ inicio: ini, fim: Math.min(ini + BLOCO, ate), elemento: ELEMENTOS[k % 5], periodo: nome });
      }
    }
    periodo(nascer, por, 'dia');
    periodo(por, nascer + DIA, 'noite');
    return lista;
  }

  /* Bloco que contém o horário (minutos do dia, pode ter fração). A fronteira exata pertence ao bloco seguinte.
     Devolve { bloco, indice, faltam } (faltam em minutos, fração). */
  function blocoEm(lista, nascer, minuto) {
    var abs = nascer + mod(minuto - nascer, DIA);
    for (var i = 0; i < lista.length; i++) {
      if (abs >= lista[i].inicio && abs < lista[i].fim) {
        return { bloco: lista[i], indice: i, faltam: lista[i].fim - abs };
      }
    }
    return null;
  }

  /* Próximo bloco depois do índice (volta ao primeiro depois do último). */
  function proximo(lista, indice) { return lista[(indice + 1) % lista.length]; }

  /* Ângulo (graus, sentido horário a partir do topo) de um horário.
     6h no topo, 12h à direita, 18h embaixo, 24h à esquerda. */
  function angulo(minuto) { return mod((minuto - 360) / DIA * 360, 360); }

  /* Nascer e pôr do sol (algoritmo da NOAA, erro de ~1 a 2 min) para latitude/longitude em graus
     (leste positivo), na data local {ano, mes (1-12), dia} e com o deslocamento do fuso em minutos
     (leste positivo, ex.: Brasília = -180). Devolve { nascer, por } em minutos do dia local,
     ou null se o sol não nascer ou não se puser nesse dia. */
  function solNascerPor(lat, lon, ano, mes, dia, fuso) {
    var R = Math.PI / 180, D = 180 / Math.PI;
    var jd = Date.UTC(ano, mes - 1, dia, 12) / 86400000 + 2440587.5;
    var T = (jd - 2451545) / 36525;
    var L0 = mod(280.46646 + T * (36000.76983 + T * 0.0003032), 360);
    var M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
    var e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
    var C = Math.sin(M * R) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
            Math.sin(2 * M * R) * (0.019993 - 0.000101 * T) + Math.sin(3 * M * R) * 0.000289;
    var omega = 125.04 - 1934.136 * T;
    var lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega * R);
    var eps = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60 +
              0.00256 * Math.cos(omega * R);
    var decl = Math.asin(Math.sin(eps * R) * Math.sin(lambda * R));
    var y = Math.pow(Math.tan(eps * R / 2), 2);
    var eq = 4 * D * (y * Math.sin(2 * L0 * R) - 2 * e * Math.sin(M * R) +
             4 * e * y * Math.sin(M * R) * Math.cos(2 * L0 * R) - 0.5 * y * y * Math.sin(4 * L0 * R) -
             1.25 * e * e * Math.sin(2 * M * R));
    var c = Math.cos(90.833 * R) / (Math.cos(lat * R) * Math.cos(decl)) - Math.tan(lat * R) * Math.tan(decl);
    if (c < -1 || c > 1) return null;
    var ha = D * Math.acos(c);
    var meioDia = 720 - 4 * lon - eq + fuso;
    var n = mod(meioDia - 4 * ha, DIA), p = mod(meioDia + 4 * ha, DIA);
    return n < p ? { nascer: n, por: p } : null;
  }

  var API = {
    DIA: DIA, BLOCO: BLOCO, ELEMENTOS: ELEMENTOS, lerHora: lerHora, formatar: formatar,
    blocos: blocos, blocoEm: blocoEm, proximo: proximo, angulo: angulo, solNascerPor: solNascerPor
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else raiz.Tattwas = API;
})(this);
