/* Tattwas Gradarius: funções de cálculo (puras, sem DOM).
   Usadas pelo app.js e pelo testes.html. Aritmética simples de horário, sem astronomia.
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

  var API = {
    DIA: DIA, BLOCO: BLOCO, ELEMENTOS: ELEMENTOS, lerHora: lerHora, formatar: formatar,
    blocos: blocos, blocoEm: blocoEm, proximo: proximo, angulo: angulo
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else raiz.Tattwas = API;
})(this);
