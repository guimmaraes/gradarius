/* Biorritmo Gradarius: tela. Depende de textos.js e calculo.js.
   Tudo roda neste navegador; nada é enviado a servidor. */
(function () {
  'use strict';

  var T = window.TEXTOS, B = window.Biorritmo;
  var $ = function (id) { return document.getElementById(id); };
  var PASSADO = { 30: 10, 60: 20, 90: 30 };
  var CH = { L: 720, A: 380, ml: 46, mr: 14, mt: 28, mb: 34 };
  var CHAVE_NASC = 'gradarius-bio-nasc';
  var CHAVE_TEMA = 'gradarius-tema';
  var FONTE = "Figtree, system-ui, sans-serif";
  var SERIF = "'Cormorant Garamond', Georgia, serif";

  var estado = { nasc: null, ref: null, hoje: null, janela: 30, sel: 0, ocultos: {} };

  /* ---------- utilidades ---------- */
  function tpl(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function guardar(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function sinal(p) { return (p > 0 ? '+' : p < 0 ? '−' : '') + Math.abs(p) + '%'; }
  function semana(dt) {
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' })
      .format(new Date(Date.UTC(dt.a, dt.m - 1, dt.d, 12))).replace('.', '');
  }
  function hojeLocal() { var n = new Date(); return B.data(n.getFullYear(), n.getMonth() + 1, n.getDate()); }

  function mascara(el) {
    el.addEventListener('input', function () {
      var d = el.value.replace(/\D/g, '').slice(0, 8), r = d;
      if (d.length > 4) r = d.slice(0, 2) + '/' + d.slice(2, 4) + '/' + d.slice(4);
      else if (d.length > 2) r = d.slice(0, 2) + '/' + d.slice(2);
      el.value = r;
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

  function atualizarBotaoTema() {
    var b = $('btn-tema');
    b.setAttribute('aria-label', escuro() ? T.menu.temaClaro : T.menu.temaEscuro);
  }

  /* ---------- seção "Entenda seus ritmos" ---------- */
  function desenharSobre() {
    var S = T.sobre, h = '<h2>' + esc(S.titulo) + '</h2>';
    S.abertura.forEach(function (p) { h += '<p class="sub">' + esc(p) + '</p>'; });
    function cartao(c) {
      return '<article class="cartao"><h3>' + esc(c.titulo) + '</h3><p class="elo">' + esc(c.elo) + '</p><p>' + esc(c.texto) + '</p>' +
        '<p><b>' + esc(c.alta) + '</b></p><p>' + esc(c.baixa) + '</p></article>';
    }
    S.ciclos.forEach(function (c) { h += cartao(c); });
    h += '<h3 class="livre">' + esc(S.profundos.titulo) + '</h3><p class="sub">' + esc(S.profundos.texto) + '</p>';
    S.profundos.ciclos.forEach(function (c) { h += cartao(c); });
    h += '<h3 class="livre">' + esc(S.livre.titulo) + '</h3>';
    S.livre.texto.forEach(function (p) { h += '<p class="sub">' + esc(p) + '</p>'; });
    h += '<p class="destaque">' + esc(T.fraseChave) + '</p>';
    $('sobre').innerHTML = h;
  }

  /* ---------- textos fixos ---------- */
  function preencherTextos() {
    document.title = T.paginaTitulo;
    $('t-voltar').textContent = T.menu.voltar;
    $('t-voltar').href = T.links.voltar;
    $('t-titulo').textContent = T.topo.titulo;
    $('t-destaque').textContent = T.topo.destaque;
    $('t-lead').textContent = T.topo.texto;
    $('l-nasc').textContent = T.formulario.nascimento;
    $('nasc').placeholder = T.formulario.nascimentoDica;
    $('nasc-cal').setAttribute('aria-label', T.formulario.calendario);
    $('t-ou').textContent = T.formulario.ou;
    $('l-nome').textContent = T.formulario.nome;
    $('l-ref-resumo').textContent = T.formulario.referencia;
    $('l-ref').textContent = T.formulario.referenciaDica;
    $('ref').placeholder = 'dd/mm/aaaa';
    $('l-lembrar').textContent = T.formulario.lembrar;
    $('btn-ver').textContent = T.formulario.botao;
    $('t-priv').textContent = T.formulario.privacidade;
    $('t-hoje').textContent = T.secoes.hoje;
    $('t-prof').textContent = T.secoes.profundos;
    $('t-prof-texto').textContent = T.secoes.profundosTexto;
    $('t-graf').textContent = T.secoes.grafico;
    $('t-graf-dica').textContent = T.secoes.graficoDica;
    $('btn-salvar').textContent = T.acoes.salvar;
    $('btn-copiar').textContent = T.acoes.copiar;
    $('l-inc-data').textContent = T.acoes.incluirData;
    $('t-trans').textContent = T.secoes.transicoes;
    $('t-trans-texto').textContent = T.secoes.transicoesTexto;
    $('t-chamada').textContent = T.chamada.texto;
    $('btn-mapa').textContent = T.chamada.botaoMapa;
    $('btn-mapa').href = T.links.mapa;
    $('btn-consulta').textContent = T.chamada.botaoConsulta;
    $('btn-consulta').href = T.links.consulta;
    $('t-aviso').textContent = T.rodape.aviso;
    $('t-frase').textContent = T.fraseChave;
    desenharSobre();
    $('janelas').setAttribute('aria-label', T.grafico.janela);
    var j = '';
    [30, 60, 90].forEach(function (n) {
      j += '<button type="button" data-j="' + n + '" aria-pressed="' + (n === estado.janela) + '">' + esc(T.grafico.janelas[n]) + '</button>';
    });
    $('janelas').innerHTML = j;
  }

  /* ---------- validação ---------- */
  function validar() {
    var r = { ok: false }, hoje = hojeLocal();
    var txt = $('nasc').value.trim(), refTxt = $('ref').value.trim();
    $('erro-nasc').textContent = ''; $('erro-ref').textContent = '';
    $('nasc').removeAttribute('aria-invalid'); $('ref').removeAttribute('aria-invalid');

    function falha(campo, msg) {
      $('erro-' + campo).textContent = msg;
      $(campo).setAttribute('aria-invalid', 'true');
      if (campo === 'ref') $('ref').closest('details').open = true;
      $(campo).focus();
      return r;
    }
    if (!txt) return falha('nasc', T.erros.vazio);
    var n = B.lerData(txt);
    if (!n) return falha('nasc', T.erros.invalida);
    if (n.a < 1900) return falha('nasc', T.erros.antiga);
    if (B.comparar(n, hoje) > 0) return falha('nasc', T.erros.futura);

    var ref = hoje;
    if (refTxt) {
      ref = B.lerData(refTxt);
      if (!ref) return falha('ref', T.erros.referenciaInvalida);
      if (B.comparar(ref, n) < 0) return falha('ref', T.erros.referenciaAntes);
    }
    r.ok = true; r.nasc = n; r.ref = ref; r.hoje = hoje;
    return r;
  }

  /* ---------- gráfico (SVG desenhado à mão) ---------- */
  /* disponíveis: os sete ritmos, sempre. A seção "mais profundos" só afeta os medidores e as trocas. */
  function ciclosDisponiveis() { return B.CICLOS; }
  function ciclosTroca() {
    var prof = $('profundos').open;
    return B.CICLOS.filter(function (c) { return !c.profundo || prof; });
  }
  /* visíveis: os disponíveis que o visitante não desmarcou no filtro */
  function ciclosVisiveis() {
    return ciclosDisponiveis().filter(function (c) { return !estado.ocultos[c.id]; });
  }
  function corDe(c, th) { return th.escuro ? c.corEscuro : c.cor; }

  function interno(th, ciclos, sel) {
    var passado = PASSADO[estado.janela], total = estado.janela;
    var futuro = total - passado;
    var pw = CH.L - CH.ml - CH.mr, ph = CH.A - CH.mt - CH.mb;
    var d0 = B.diasEntre(estado.nasc, estado.ref);
    function X(k) { return CH.ml + (k + passado) / total * pw; }
    function Y(p) { return CH.mt + (100 - p) / 200 * ph; }
    var s = '', k, p;

    for (p = -100; p <= 100; p += 50) {
      s += '<line x1="' + CH.ml + '" x2="' + (CH.L - CH.mr) + '" y1="' + Y(p) + '" y2="' + Y(p) + '" stroke="' + th.linha + '" stroke-width="' + (p === 0 ? 1 : 0.6) + '"/>';
      s += '<text x="' + (CH.ml - 8) + '" y="' + (Y(p) + 4) + '" text-anchor="end" font-size="12" fill="' + th.suave + '" font-family="' + FONTE + '">' + (p > 0 ? '+' : p < 0 ? '−' : '') + Math.abs(p) + '%</text>';
    }
    var passo = total === 30 ? 5 : total === 60 ? 10 : 15;
    for (k = -passado; k <= futuro; k++) {
      if (k % passo !== 0) continue;
      s += '<line x1="' + X(k) + '" x2="' + X(k) + '" y1="' + CH.mt + '" y2="' + (CH.A - CH.mb) + '" stroke="' + th.linha + '" stroke-width="0.6" stroke-dasharray="1 4"/>';
      s += '<text x="' + X(k) + '" y="' + (CH.A - CH.mb + 18) + '" text-anchor="middle" font-size="12" fill="' + th.suave + '" font-family="' + FONTE + '">' + B.formatarCurto(B.somarDias(estado.ref, k)) + '</text>';
    }
    /* hoje (dia de referência) */
    s += '<line x1="' + X(0) + '" x2="' + X(0) + '" y1="' + (CH.mt - 6) + '" y2="' + (CH.A - CH.mb) + '" stroke="' + th.ouro + '" stroke-width="' + 1.2 + '"/>';
    s += '<text x="' + X(0) + '" y="' + (CH.mt - 12) + '" text-anchor="middle" font-size="13" font-weight="600" fill="' + th.ouro + '" font-family="' + FONTE + '">' + esc(T.grafico.hoje) + '</text>';

    ciclos.forEach(function (c) {
      /* um ponto a cada quarto de dia, para a curva sair suave */
      var pts = [];
      for (var q = -passado * 4; q <= futuro * 4; q++) {
        pts.push(X(q / 4).toFixed(1) + ',' + Y(B.valor(d0 + q / 4, c.T) * 100).toFixed(1));
      }
      pts = pts.join(' ');
      s += '<polyline points="' + pts + '" fill="none" stroke="' + corDe(c, th) + '" stroke-width="' + 1.5 + '" stroke-linejoin="round" stroke-linecap="round"' + (c.traco ? ' stroke-dasharray="' + c.traco + '"' : '') + '/>';
    });

    if (sel !== null && sel !== undefined) {
      s += '<line x1="' + X(sel) + '" x2="' + X(sel) + '" y1="' + CH.mt + '" y2="' + (CH.A - CH.mb) + '" stroke="' + th.texto + '" stroke-width="0.8" opacity=".6"/>';
      ciclos.forEach(function (c) {
        s += '<circle cx="' + X(sel) + '" cy="' + Y(B.valor(d0 + sel, c.T) * 100) + '" r="3.5" fill="' + th.fundo + '" stroke="' + corDe(c, th) + '" stroke-width="1.5"/>';
      });
    }
    return s;
  }

  function descricaoGrafico() {
    var passado = PASSADO[estado.janela], futuro = estado.janela - passado;
    return tpl(T.grafico.descricao, {
      inicio: B.formatar(B.somarDias(estado.ref, -passado)),
      fim: B.formatar(B.somarDias(estado.ref, futuro)),
      hoje: B.formatar(estado.ref)
    });
  }

  function desenharGrafico() {
    /* em tela estreita o desenho é menos largo, para os rótulos não ficarem minúsculos */
    CH.L = $('grafico').clientWidth && $('grafico').clientWidth < 560 ? 420 : 720;
    var th = temaAtual(), ciclos = ciclosVisiveis();
    $('grafico').innerHTML = '<svg viewBox="0 0 ' + CH.L + ' ' + CH.A + '" role="img" aria-label="' + esc(descricaoGrafico()) + '">' + interno(th, ciclos, estado.sel) + '</svg>';
    $('grafico').setAttribute('aria-label', descricaoGrafico());
    desenharLeitura(ciclos);
  }

  /* Legenda = filtro: cada linha tem uma caixa para mostrar ou esconder. */
  function desenharLegenda() {
    var th = temaAtual(), lg = '';
    ciclosDisponiveis().forEach(function (c) {
      lg += '<li><label><input type="checkbox" data-c="' + c.id + '"' + (estado.ocultos[c.id] ? '' : ' checked') + '>' +
        '<svg viewBox="0 0 36 10" aria-hidden="true"><line x1="2" x2="34" y1="5" y2="5" stroke="' + corDe(c, th) + '" stroke-width="1.6" stroke-linecap="round"' + (c.traco ? ' stroke-dasharray="' + c.traco + '"' : '') + '/></svg>' +
        '<span>' + esc(T.ciclos[c.id].nome) + '</span></label></li>';
    });
    $('legenda').innerHTML = lg;
  }

  function desenharLeitura(ciclos) {
    var d0 = B.diasEntre(estado.nasc, estado.ref), dt = B.somarDias(estado.ref, estado.sel);
    var h = '<b>' + esc(tpl(T.grafico.diaSelecionado, { data: B.formatar(dt), semana: semana(dt) })) + '</b>: ';
    if (!ciclos.length) { $('leitura').textContent = T.grafico.nenhuma; return; }
    h += ciclos.map(function (c) { return esc(T.ciclos[c.id].nome) + ' ' + sinal(B.porcento(d0 + estado.sel, c.T)); }).join(' · ');
    $('leitura').innerHTML = h;
  }

  function selecionarPorPonteiro(ev) {
    var svg = $('grafico').querySelector('svg');
    if (!svg) return;
    var r = svg.getBoundingClientRect();
    var x = (ev.clientX - r.left) / r.width * CH.L;
    var passado = PASSADO[estado.janela], total = estado.janela;
    var k = Math.round((x - CH.ml) / (CH.L - CH.ml - CH.mr) * total) - passado;
    mover(k);
  }
  function mover(k) {
    var passado = PASSADO[estado.janela], futuro = estado.janela - passado;
    k = Math.max(-passado, Math.min(futuro, k));
    if (k !== estado.sel) { estado.sel = k; desenharGrafico(); }
  }

  /* ---------- medidores e transições ---------- */
  function medidorHtml(c, d) {
    var p = B.porcento(d, c.T), f = B.fase(d, c.T), tf = T.fases[f];
    var th = temaAtual(), cor = corDe(c, th);
    var esq = p >= 0 ? 50 : 50 + p / 2, larg = Math.abs(p) / 2;
    return '<article class="cartao medidor">' +
      '<h3>' + esc(T.ciclos[c.id].nome) + '</h3>' +
      '<p class="num">' + sinal(p) + '</p>' +
      '<div class="barra" role="meter" aria-valuemin="-100" aria-valuemax="100" aria-valuenow="' + p + '" aria-valuetext="' + sinal(p) + ', ' + esc(tf.rotulo) + '" aria-label="' + esc(T.ciclos[c.id].nome) + '">' +
      '<i style="left:' + esq + '%;width:' + larg + '%;background:' + cor + '"></i></div>' +
      '<div class="escala" aria-hidden="true"><span>−100%</span><span>0</span><span>+100%</span></div>' +
      '<p class="fase"><span class="ic" aria-hidden="true">' + tf.icone + '</span>' + esc(tf.rotulo) + '</p>' +
      '<p class="frase">' + esc((tf.frases && tf.frases[c.id]) || tf.frase) + '</p></article>';
  }

  function desenharMedidores() {
    var d = B.diasEntre(estado.nasc, estado.ref), a = '', b = '';
    B.CICLOS.forEach(function (c) { if (c.profundo) b += medidorHtml(c, d); else a += medidorHtml(c, d); });
    $('medidores').innerHTML = a;
    $('medidores-prof').innerHTML = b;
    $('t-hoje-de').textContent = tpl(T.secoes.hojeDe, { data: B.formatar(estado.ref) });
  }

  function desenharTransicoes() {
    var d = B.diasEntre(estado.nasc, estado.ref), itens = [];
    ciclosTroca().forEach(function (c) {
      B.proximasTrocas(d, c.T, 30).forEach(function (k) { itens.push({ k: k, c: c }); });
    });
    itens.sort(function (x, y) { return x.k - y.k; });
    if (!itens.length) { $('transicoes').innerHTML = '<li>' + esc(T.secoes.transicoesVazio) + '</li>'; return; }
    $('transicoes').innerHTML = itens.map(function (it) {
      var dt = B.somarDias(estado.ref, it.k);
      var quando = it.k === 1 ? T.secoes.transicaoAmanha : tpl(T.secoes.transicaoEm, { n: it.k });
      return '<li><span>' + esc(T.ciclos[it.c.id].nome) + '</span><span class="quando"><b>' + B.formatarCurto(dt) + '</b> (' + esc(semana(dt)) + '), ' + esc(quando) + '</span></li>';
    }).join('');
  }

  function desenharTudo() {
    desenharMedidores();
    desenharLegenda();
    desenharGrafico();
    desenharTransicoes();
  }

  /* ---------- ações ---------- */
  function enviar(ev) {
    if (ev) ev.preventDefault();
    var v = validar();
    if (!v.ok) return;
    estado.nasc = v.nasc; estado.ref = v.ref; estado.hoje = v.hoje; estado.sel = 0;
    if (ev) guardar(CHAVE_NASC, $('lembrar').checked ? B.formatarIso(v.nasc) : null);
    $('nasc-cal').value = B.formatarIso(v.nasc);
    $('resultado').hidden = false;
    desenharTudo();
    $('t-hoje').scrollIntoView({ block: 'start' });
  }

  function mensagem(t) { $('msg').textContent = t; }

  /* Legenda discreta da imagem: amostra da linha (com o traço) + nome, em fila que quebra de linha. */
  function legendaImagem(th, ciclos, y0) {
    var x = 24, y = y0 + 12, svg = '';
    ciclos.forEach(function (c) {
      var nome = T.ciclos[c.id].nome, larg = 34 + nome.length * 5.4 + 16;
      if (x + larg > CH.L - 24 && x > 24) { x = 24; y += 18; }
      svg += '<line x1="' + x + '" x2="' + (x + 24) + '" y1="' + (y - 3.5) + '" y2="' + (y - 3.5) + '" stroke="' + corDe(c, th) + '" stroke-width="1.4" stroke-linecap="round"' + (c.traco ? ' stroke-dasharray="' + c.traco + '"' : '') + '/>' +
        '<text x="' + (x + 30) + '" y="' + y + '" font-size="10.5" fill="' + th.suave + '" font-family="' + FONTE + '">' + esc(nome) + '</text>';
      x += larg;
    });
    return { svg: svg, altura: y - y0 + 6 };
  }

  function salvarImagem() {
    var th = TEMA_CLARO, ciclos = ciclosVisiveis();
    var nome = $('nome').value.trim();
    var larguraTela = CH.L;
    CH.L = 720; /* a imagem sempre usa o desenho largo */
    var W = CH.L, topo = 60, rodape = 38;
    var leg = legendaImagem(th, ciclos, topo + CH.A + 6);
    var H = topo + CH.A + 6 + leg.altura + rodape;
    var titulo = T.grafico.tituloImagem + (nome ? ' · ' + nome : '');
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W * 2 + '" height="' + H * 2 + '" viewBox="0 0 ' + W + ' ' + H + '">' +
      '<rect width="' + W + '" height="' + H + '" fill="#ffffff"/>' +
      '<text x="24" y="32" font-size="26" font-weight="600" fill="#1e1b3a" font-family="' + SERIF + '">' + esc(titulo) + '</text>' +
      '<text x="24" y="50" font-size="13" fill="' + th.suave + '" font-family="' + FONTE + '">' + esc(B.formatar(estado.ref)) + '</text>' +
      '<g transform="translate(0,' + topo + ')">' + interno(th, ciclos, null) + '</g>' + leg.svg +
      '<text x="24" y="' + (H - 12) + '" font-size="13" fill="' + th.suave + '" font-family="' + FONTE + '">' + esc(T.rodape.aviso) + '</text>' +
      '<text x="' + (W - 24) + '" y="' + (H - 12) + '" text-anchor="end" font-size="16" fill="#1e1b3a" font-family="' + SERIF + '">✦ Gradar<tspan fill="#b8934a">ius</tspan></text>' +
      '</svg>';
    CH.L = larguraTela;
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
        a.download = 'biorritmo-gradarius.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      }, 'image/png');
    };
    img.src = url;
  }

  function copiarLink() {
    var base = location.href.split('#')[0], hash = '#j=' + estado.janela;
    if ($('inc-data').checked) hash += '&n=' + B.formatarIso(estado.nasc);
    var url = base + hash;
    function ok() { mensagem(T.acoes.copiado + ($('inc-data').checked ? ' ' + T.acoes.incluirDataAviso : '')); }
    function falha() { mensagem(T.acoes.copiarFalhou); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, falha);
    else falha();
  }

  /* ---------- início ---------- */
  function iniciar() {
    preencherTextos();
    mascara($('nasc')); mascara($('ref'));
    atualizarBotaoTema();
    $('nasc-cal').max = B.formatarIso(hojeLocal());

    $('form').addEventListener('submit', enviar);
    $('nasc-cal').addEventListener('change', function () {
      var d = B.lerData(this.value);
      if (d) $('nasc').value = B.formatar(d);
    });
    $('btn-tema').addEventListener('click', function () {
      var novo = escuro() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', novo);
      guardar(CHAVE_TEMA, novo);
      atualizarBotaoTema();
      if (estado.nasc) desenharTudo();
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      atualizarBotaoTema(); if (estado.nasc) desenharTudo();
    });
    $('janelas').addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b) return;
      estado.janela = +b.getAttribute('data-j'); estado.sel = 0;
      Array.prototype.forEach.call($('janelas').children, function (x) { x.setAttribute('aria-pressed', x === b); });
      desenharGrafico();
    });
    var g = $('grafico');
    g.addEventListener('pointermove', selecionarPorPonteiro);
    g.addEventListener('pointerdown', selecionarPorPonteiro);
    g.addEventListener('keydown', function (ev) {
      var m = { ArrowLeft: -1, ArrowRight: 1 }[ev.key];
      if (m) { ev.preventDefault(); mover(estado.sel + m); }
      else if (ev.key === 'Home') { ev.preventDefault(); mover(0); }
    });
    $('profundos').addEventListener('toggle', function () { if (estado.nasc) desenharTransicoes(); });
    $('legenda').addEventListener('change', function (ev) {
      var c = ev.target.getAttribute('data-c'); if (!c) return;
      estado.ocultos[c] = !ev.target.checked;
      desenharGrafico();
    });
    $('btn-salvar').addEventListener('click', salvarImagem);
    $('btn-copiar').addEventListener('click', copiarLink);

    /* data vinda do link (#n=aaaa-mm-dd&j=30) ou lembrada neste aparelho */
    var h = {};
    location.hash.replace(/^#/, '').split('&').forEach(function (par) { var p = par.split('='); if (p[0]) h[p[0]] = p[1]; });
    if (PASSADO[h.j]) estado.janela = +h.j;
    preencherTextos();
    var nasc = B.lerData(h.n) || B.lerData(ler(CHAVE_NASC));
    if (nasc) {
      $('nasc').value = B.formatar(nasc);
      $('lembrar').checked = !h.n && !!ler(CHAVE_NASC);
      enviar();
      window.scrollTo(0, 0);
    }
  }

  iniciar();
})();
