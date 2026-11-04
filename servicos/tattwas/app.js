/* Tattwas Gradarius: tela. Depende de textos.js e calculo.js.
   Tudo roda neste navegador; nada é enviado a servidor. */
(function () {
  'use strict';

  var T = window.TEXTOS, Z = window.Tattwas;
  var $ = function (id) { return document.getElementById(id); };
  var CHAVE_HORAS = 'gradarius-tat-horas';
  var CHAVE_TEMA = 'gradarius-tema';
  var FONTE = "Figtree, system-ui, sans-serif";
  var SERIF = "'Cormorant Garamond', Georgia, serif";
  var C = 220; /* centro do desenho da roda (viewBox 440 x 440) */
  var R_FORA = 170, R_DENTRO = 110;

  /* cor do bloco (claro / escuro) e cor do símbolo desenhado sobre ele */
  var COR = {
    akasa:    { c: '#4a3f8f', e: '#8f84e0' },
    vayu:     { c: '#4fa3c7', e: '#4fa3c7' },
    tejas:    { c: '#c8553d', e: '#e0765f' },
    apas:     { c: '#9db4d6', e: '#9db4d6' },
    prithivi: { c: '#d4a62a', e: '#d4a62a' }
  };

  var estado = { nascer: null, por: null, outro: null, lista: null, timer: null };

  /* ---------- utilidades ---------- */
  function tpl(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function guardar(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function minutoAgora() { var d = new Date(); return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60; }

  function mascara(el) {
    el.addEventListener('input', function () {
      var d = el.value.replace(/\D/g, '').slice(0, 4);
      el.value = d.length > 2 ? d.slice(0, 2) + ':' + d.slice(2) : d;
    });
  }

  /* ---------- tema ---------- */
  function escuro() {
    var t = document.documentElement.getAttribute('data-theme');
    return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function corCss(nome) { return getComputedStyle(document.documentElement).getPropertyValue(nome).trim(); }
  function temaAtual() {
    return { escuro: escuro(), texto: corCss('--text'), suave: corCss('--muted'), linha: corCss('--line'), fundo: corCss('--card'), ouro: corCss('--brass') };
  }
  var TEMA_CLARO = { escuro: false, texto: '#25223f', suave: '#625f80', linha: '#dcd8ec', fundo: '#ffffff', ouro: '#b8934a' };
  function corDe(id, th) { return th.escuro ? COR[id].e : COR[id].c; }
  function atualizarBotaoTema() {
    $('btn-tema').setAttribute('aria-label', escuro() ? T.menu.temaClaro : T.menu.temaEscuro);
  }

  /* cor do símbolo sobre um bloco: escuro sobre fundo claro, claro sobre fundo escuro */
  function corSimbolo(hex) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) > 140 ? '#1e1b3a' : '#f3f1fb';
  }

  /* ---------- símbolos (a forma ajuda quem não distingue cores) ---------- */
  function simbolo(id, cx, cy, s, fill) {
    var f = ' fill="' + fill + '"';
    if (id === 'akasa') return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + s * 0.62 + '" ry="' + s + '"' + f + '/>';
    if (id === 'vayu') return '<circle cx="' + cx + '" cy="' + cy + '" r="' + s * 0.82 + '"' + f + '/>';
    if (id === 'tejas') {
      return '<polygon points="' + cx + ',' + (cy - s) + ' ' + (cx + s * 0.95) + ',' + (cy + s * 0.8) + ' ' + (cx - s * 0.95) + ',' + (cy + s * 0.8) + '"' + f + '/>';
    }
    if (id === 'apas') {
      return '<path d="M' + (cx + s * 0.25) + ',' + (cy - s) + ' A' + s + ',' + s + ' 0 0 0 ' + (cx + s * 0.25) + ',' + (cy + s) +
        ' A' + s * 1.6 + ',' + s * 1.6 + ' 0 0 1 ' + (cx + s * 0.25) + ',' + (cy - s) + ' Z"' + f + '/>';
    }
    return '<rect x="' + (cx - s * 0.78) + '" y="' + (cy - s * 0.78) + '" width="' + s * 1.56 + '" height="' + s * 1.56 + '"' + f + '/>';
  }
  /* símbolo avulso (cartão, legenda, lista): quadradinho com a cor do elemento e a forma por cima */
  function icone(id, th, tamanho) {
    var cor = corDe(id, th);
    return '<svg viewBox="0 0 32 32" width="' + tamanho + '" height="' + tamanho + '" aria-hidden="true"><rect width="32" height="32" rx="7" fill="' + cor + '"/>' +
      simbolo(id, 16, 16, 9, corSimbolo(cor)) + '</svg>';
  }

  /* ---------- roda ---------- */
  function pt(ang, r) {
    var a = ang * Math.PI / 180;
    return (C + r * Math.sin(a)).toFixed(2) + ',' + (C - r * Math.cos(a)).toFixed(2);
  }
  function setor(a0, a1, r0, r1) {
    var g = (a1 - a0) > 180 ? 1 : 0;
    return 'M' + pt(a0, r1) + ' A' + r1 + ',' + r1 + ' 0 ' + g + ' 1 ' + pt(a1, r1) + ' L' + pt(a1, r0) + ' A' + r0 + ',' + r0 + ' 0 ' + g + ' 0 ' + pt(a0, r0) + ' Z';
  }

  function rodaInterna(th, agora) {
    var lista = estado.lista, s = '', i, h;
    var atual = Z.blocoEm(lista, estado.nascer, agora);

    lista.forEach(function (b) {
      var a0 = Z.angulo(b.inicio), a1 = a0 + (b.fim - b.inicio) * 0.25;
      var cor = corDe(b.elemento, th);
      s += '<path d="' + setor(a0, a1, R_DENTRO, R_FORA) + '" fill="' + cor + '" stroke="' + th.fundo + '" stroke-width="0.8"/>';
      if (b.fim - b.inicio >= 12) {
        var m = (a0 + a1) / 2, p = pt(m, (R_DENTRO + R_FORA) / 2).split(',');
        s += simbolo(b.elemento, +p[0], +p[1], 4.4, corSimbolo(cor));
      }
    });

    /* faixa de dia e noite, dentro do anel */
    var nA = Z.angulo(estado.nascer), pA = Z.angulo(estado.por);
    var diaGraus = (estado.por - estado.nascer) * 0.25;
    s += '<path d="' + setor(nA, nA + diaGraus, 96, 104) + '" fill="' + th.ouro + '"/>';
    s += '<path d="' + setor(pA, pA + 360 - diaGraus, 96, 104) + '" fill="' + th.suave + '" opacity="0.55"/>';

    /* horas */
    for (h = 0; h < 24; h++) {
      var ang = Z.angulo(h * 60), principal = h % 6 === 0;
      var a = pt(ang, R_FORA + 3).split(','), b2 = pt(ang, R_FORA + (principal ? 12 : 8)).split(',');
      s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b2[0] + '" y2="' + b2[1] + '" stroke="' + th.suave + '" stroke-width="' + (principal ? 1.6 : 0.8) + '"/>';
    }
    [[6, 1], [12, 1], [18, 1], [0, 1], [3, 0], [9, 0], [15, 0], [21, 0]].forEach(function (x) {
      var hh = x[0], forte = x[1], p = pt(Z.angulo(hh * 60), R_FORA + (forte ? 33 : 27)).split(',');
      s += '<text x="' + p[0] + '" y="' + (+p[1] + 5) + '" text-anchor="middle" font-size="' + (forte ? 15 : 12) + '" font-weight="' + (forte ? 600 : 400) + '" fill="' + (forte ? th.texto : th.suave) + '" font-family="' + FONTE + '">' + (hh === 0 ? 24 : hh) + 'h</text>';
    });

    /* nascer e pôr do sol */
    [[estado.nascer, T.roda.nascer], [estado.por, T.roda.por]].forEach(function (x) {
      var ang2 = Z.angulo(x[0]), p1 = pt(ang2, R_DENTRO - 18).split(','), p2 = pt(ang2, R_FORA + 6).split(',');
      s += '<line x1="' + p1[0] + '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] + '" stroke="' + th.ouro + '" stroke-width="2" stroke-linecap="round"/>';
      var t = pt(ang2, R_DENTRO - 32).split(',');
      s += '<text x="' + t[0] + '" y="' + (+t[1] + 4) + '" text-anchor="middle" font-size="11" fill="' + th.ouro + '" font-weight="600" font-family="' + FONTE + '">' + esc(x[1]) + ' ' + Z.formatar(x[0]) + '</text>';
    });

    /* bloco de agora e ponteiro dourado */
    if (agora !== null && atual) {
      var b = atual.bloco, c0 = Z.angulo(b.inicio), c1 = c0 + (b.fim - b.inicio) * 0.25;
      s += '<path d="' + setor(c0, c1, R_DENTRO - 5, R_FORA + 5) + '" fill="none" stroke="' + th.ouro + '" stroke-width="2.6" stroke-linejoin="round"/>';
      var pa = pt(Z.angulo(agora), R_FORA + 14).split(',');
      s += '<line x1="' + C + '" y1="' + C + '" x2="' + pa[0] + '" y2="' + pa[1] + '" stroke="' + th.ouro + '" stroke-width="2.2" stroke-linecap="round"/>';
      s += '<circle cx="' + C + '" cy="' + C + '" r="5" fill="' + th.ouro + '"/>';
      var nome = T.elementos[b.elemento].nome;
      s += '<text x="' + C + '" y="' + (C + 34) + '" text-anchor="middle" font-size="22" font-weight="600" fill="' + th.texto + '" font-family="' + SERIF + '">' + esc(nome) + '</text>';
      s += '<text x="' + C + '" y="' + (C + 54) + '" text-anchor="middle" font-size="13" fill="' + th.suave + '" font-family="' + FONTE + '">' + Z.formatar(agora) + '</text>';
    }
    return s;
  }

  /* ---------- tela ---------- */
  function preencherTextos() {
    document.title = T.paginaTitulo;
    $('t-voltar').textContent = T.menu.voltar;
    $('t-voltar').href = T.links.voltar;
    $('t-titulo').textContent = T.topo.titulo;
    $('t-destaque').textContent = T.topo.destaque;
    $('t-lead').textContent = T.topo.texto;
    $('l-nascer').textContent = T.formulario.nascer;
    $('l-por').textContent = T.formulario.por;
    ['nascer', 'por', 'outro'].forEach(function (id) { $(id).placeholder = T.formulario.dica; });
    $('t-ajuda').textContent = T.formulario.ajuda;
    $('btn-local').textContent = T.formulario.local;
    $('l-outro-resumo').textContent = T.formulario.outro;
    $('l-outro').textContent = T.formulario.outroRotulo;
    $('l-lembrar').textContent = T.formulario.lembrar;
    $('btn-ver').textContent = T.formulario.botao;
    $('t-priv').textContent = T.formulario.privacidade;
    $('t-roda').textContent = T.secoes.roda;
    $('t-roda-dica').textContent = T.secoes.rodaDica;
    $('btn-salvar').textContent = T.acoes.salvar;
    $('t-proximos').textContent = T.secoes.proximos;
    $('t-todos').textContent = T.secoes.todos;
    $('t-todos-texto').textContent = T.secoes.todosTexto;
    $('t-chamada').textContent = T.chamada.texto;
    $('btn-mapa').textContent = T.chamada.botaoMapa;
    $('btn-mapa').href = T.links.mapa;
    $('btn-consulta').textContent = T.chamada.botaoConsulta;
    $('btn-consulta').href = T.links.consulta;
    $('t-aviso').textContent = T.rodape.aviso;
  }

  function validar() {
    var r = { ok: false };
    ['nascer', 'por', 'outro'].forEach(function (id) { $('erro-' + id).textContent = ''; $(id).removeAttribute('aria-invalid'); });
    function falha(campo, msg) {
      $('erro-' + campo).textContent = msg;
      $(campo).setAttribute('aria-invalid', 'true');
      if (campo === 'outro') $('outro').closest('details').open = true;
      $(campo).focus();
      return r;
    }
    var tn = $('nascer').value.trim(), tp = $('por').value.trim(), to = $('outro').value.trim();
    if (!tn) return falha('nascer', T.erros.nascerVazio);
    var n = Z.lerHora(tn); if (n === null) return falha('nascer', T.erros.invalida);
    if (!tp) return falha('por', T.erros.porVazio);
    var p = Z.lerHora(tp); if (p === null) return falha('por', T.erros.invalida);
    if (!(n < p)) return falha('por', T.erros.ordem);
    var o = null;
    if (to) { o = Z.lerHora(to); if (o === null) return falha('outro', T.erros.outroInvalida); }
    r.ok = true; r.nascer = n; r.por = p; r.outro = o;
    return r;
  }

  function agoraEfetivo() { return estado.outro !== null ? estado.outro : minutoAgora(); }

  function desenharAgora() {
    var th = temaAtual(), ag = agoraEfetivo();
    var r = Z.blocoEm(estado.lista, estado.nascer, ag);
    var b = r.bloco, el = T.elementos[b.elemento], prox = Z.proximo(estado.lista, r.indice);
    var n = Math.ceil(r.faltam - 1e-9);
    var faltam = tpl(T.agora.faltam, {
      n: n <= 1 ? T.agora.minuto : tpl(T.agora.minutos, { n: n }),
      proximo: T.elementos[prox.elemento].nome
    });
    var h = '<p class="rotulo">' + esc(T.agora.titulo) + '</p>' +
      '<p class="hora">' + esc(tpl(estado.outro !== null ? T.agora.emOutro : T.agora.em, { hora: Z.formatar(ag) })) + '</p>' +
      '<div class="el">' + icone(b.elemento, th, 56) + '<div><p class="el-nome">' + esc(el.nome) + '</p><p class="el-sig">' + esc(el.sig) + '</p></div></div>' +
      '<span class="periodo">' + esc(T.periodos[b.periodo]) + '</span>' +
      '<p class="faltam">' + esc(faltam) + '</p>' +
      '<p>' + esc(tpl(T.agora.ate, { inicio: Z.formatar(b.inicio), fim: Z.formatar(b.fim) })) + '</p>';
    if (el.frase) h += '<p class="qualidade">' + esc(el.frase) + '</p>';
    $('agora').innerHTML = h;
    return r;
  }

  function descricaoRoda(ag) {
    return tpl(T.roda.descricao, { agora: Z.formatar(ag) });
  }

  function desenharRoda() {
    var th = temaAtual(), ag = agoraEfetivo();
    $('roda').innerHTML = '<svg viewBox="0 0 440 440" role="img" aria-label="' + esc(descricaoRoda(ag)) + '">' + rodaInterna(th, ag) + '</svg>';
    var lg = '';
    Z.ELEMENTOS.forEach(function (id) {
      lg += '<li>' + icone(id, th, 20) + esc(T.elementos[id].nome) + ' <span class="nota" style="margin:0">(' + esc(T.elementos[id].sig) + ')</span></li>';
    });
    lg += '<li><span class="faixa" style="background:' + th.ouro + '"></span>' + esc(T.roda.legendaDia) + '</li>';
    lg += '<li><span class="faixa" style="background:' + th.suave + ';opacity:.55"></span>' + esc(T.roda.legendaNoite) + '</li>';
    $('legenda').innerHTML = lg;
  }

  function itemLinha(b, th, atual, comTag) {
    return '<li' + (atual ? ' class="atual" aria-current="true"' : '') + '>' + icone(b.elemento, th, 24) +
      '<span class="nome">' + esc(T.elementos[b.elemento].nome) +
      (comTag ? '<span class="tag">' + esc(T.periodos[b.periodo]) + '</span>' : '') + '</span>' +
      '<span class="hora">' + esc(tpl(T.secoes.horario, { inicio: Z.formatar(b.inicio), fim: Z.formatar(b.fim) })) + '</span></li>';
  }

  function desenharListas(indice) {
    var th = temaAtual(), l = estado.lista, a = '', t = '', k;
    for (k = 0; k < Math.min(6, l.length); k++) a += itemLinha(l[(indice + k) % l.length], th, k === 0, true);
    $('proximos').innerHTML = a;
    l.forEach(function (b, i) { t += itemLinha(b, th, i === indice, true); });
    $('todos').innerHTML = t;
  }

  function desenharTudo() {
    var r = desenharAgora();
    desenharRoda();
    desenharListas(r.indice);
  }

  /* ---------- ações ---------- */
  function enviar(ev) {
    if (ev) ev.preventDefault();
    var v = validar();
    if (!v.ok) return;
    estado.nascer = v.nascer; estado.por = v.por; estado.outro = v.outro;
    estado.lista = Z.blocos(v.nascer, v.por);
    if (ev) guardar(CHAVE_HORAS, $('lembrar').checked ? Z.formatar(v.nascer) + '|' + Z.formatar(v.por) : null);
    $('resultado').hidden = false;
    desenharTudo();
    if (!estado.timer) estado.timer = setInterval(function () { if (estado.outro === null && estado.lista) desenharTudo(); }, 30000);
    if (ev) $('agora').scrollIntoView({ block: 'start' });
  }

  function salvarImagem() {
    var th = TEMA_CLARO, ag = agoraEfetivo();
    var W = 520, topo = 74, lado = 40, rodape = 84, H = topo + 440 + rodape;
    var legenda = '', x = 24;
    Z.ELEMENTOS.forEach(function (id) {
      var cor = corDe(id, th), nome = T.elementos[id].nome, y = topo + 450;
      legenda += '<rect x="' + x + '" y="' + y + '" width="16" height="16" rx="4" fill="' + cor + '"/>' + simbolo(id, x + 8, y + 8, 4.6, corSimbolo(cor)) +
        '<text x="' + (x + 22) + '" y="' + (y + 12.5) + '" font-size="11" fill="' + th.suave + '" font-family="' + FONTE + '">' + esc(nome) + '</text>';
      x += 38 + nome.length * 5.6;
    });
    var subt = T.roda.nascer + ' ' + Z.formatar(estado.nascer) + ' · ' + T.roda.por + ' ' + Z.formatar(estado.por) + ' · ' + Z.formatar(ag);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W * 2 + '" height="' + H * 2 + '" viewBox="0 0 ' + W + ' ' + H + '">' +
      '<rect width="' + W + '" height="' + H + '" fill="#ffffff"/>' +
      '<text x="24" y="38" font-size="28" font-weight="600" fill="#1e1b3a" font-family="' + SERIF + '">Tattwas</text>' +
      '<text x="24" y="58" font-size="13" fill="' + th.suave + '" font-family="' + FONTE + '">' + esc(subt) + '</text>' +
      '<g transform="translate(' + lado + ',' + topo + ')">' + rodaInterna(th, ag) + '</g>' + legenda +
      '<text x="24" y="' + (H - 20) + '" font-size="12" fill="' + th.suave + '" font-family="' + FONTE + '">' + esc(T.rodape.aviso) + '</text>' +
      '<text x="' + (W - 24) + '" y="' + (H - 40) + '" text-anchor="end" font-size="16" fill="#1e1b3a" font-family="' + SERIF + '">✦ Gradar<tspan fill="#b8934a">ius</tspan></text>' +
      '</svg>';
    var url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    var img = new Image();
    img.onload = function () {
      var cv = document.createElement('canvas');
      cv.width = W * 2; cv.height = H * 2;
      cv.getContext('2d').drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      cv.toBlob(function (blob) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'tattwas-gradarius.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      }, 'image/png');
    };
    img.src = url;
  }

  /* ---------- localização: nascer e pôr do sol de hoje, calculados no aparelho ---------- */
  function usarLocalizacao() {
    var aviso = $('t-local'), botao = $('btn-local');
    function dizer(msg) { aviso.textContent = msg; }
    if (!navigator.geolocation) { dizer(T.formulario.localFalha); return; }
    botao.disabled = true;
    dizer(T.formulario.localBuscando);
    navigator.geolocation.getCurrentPosition(function (pos) {
      botao.disabled = false;
      var d = new Date();
      var sol = Z.solNascerPor(pos.coords.latitude, pos.coords.longitude,
                               d.getFullYear(), d.getMonth() + 1, d.getDate(), -d.getTimezoneOffset());
      if (!sol) { dizer(T.formulario.localSemSol); return; }
      $('nascer').value = Z.formatar(sol.nascer);
      $('por').value = Z.formatar(sol.por);
      ['nascer', 'por'].forEach(function (id) { $('erro-' + id).textContent = ''; $(id).removeAttribute('aria-invalid'); });
      dizer(T.formulario.localOk + ' ' + T.formulario.localPriv);
    }, function (err) {
      botao.disabled = false;
      dizer(err && err.code === 1 ? T.formulario.localNegado : T.formulario.localFalha);
    }, { timeout: 10000, maximumAge: 3600000 });
  }

  /* ---------- início ---------- */
  function iniciar() {
    preencherTextos();
    ['nascer', 'por', 'outro'].forEach(function (id) { mascara($(id)); });
    atualizarBotaoTema();
    $('form').addEventListener('submit', enviar);
    $('btn-salvar').addEventListener('click', salvarImagem);
    $('btn-local').addEventListener('click', usarLocalizacao);
    $('btn-tema').addEventListener('click', function () {
      var novo = escuro() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', novo);
      guardar(CHAVE_TEMA, novo);
      atualizarBotaoTema();
      if (estado.lista) desenharTudo();
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      atualizarBotaoTema(); if (estado.lista) desenharTudo();
    });
    document.addEventListener('visibilitychange', function () { if (!document.hidden && estado.lista && estado.outro === null) desenharTudo(); });

    var salvo = (ler(CHAVE_HORAS) || '').split('|');
    if (salvo.length === 2 && Z.lerHora(salvo[0]) !== null && Z.lerHora(salvo[1]) !== null) {
      $('nascer').value = salvo[0]; $('por').value = salvo[1]; $('lembrar').checked = true;
      enviar();
      window.scrollTo(0, 0);
    }
  }

  iniciar();
})();
