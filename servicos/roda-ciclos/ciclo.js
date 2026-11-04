/* Roda dos Ciclos: cálculo no navegador (porte de ciclo_base.py e ciclo_anual.py).
   H. Spencer Lewis, Self Mastery and Fate with the Cycles of Life (AMORC, 1929).
   Tudo roda no aparelho: nada é enviado a servidor. Usa só dia e mês de nascimento.
   Datas em ISO 'AAAA-MM-DD', calculadas em UTC (sem efeito de horário de verão).
   Funciona no navegador (window.Ciclos) e no Node (module.exports), para os testes. */
(function (root) {
  'use strict';

  /* ---------- núcleo comum (ciclo_base.py) ---------- */
  const OFFSETS = [0, 52, 104, 156, 208, 260, 312];
  const MARGEM_DIAS = 2;
  const SECOES = ['favoravel', 'desfavoravel', 'cuidados'];
  const NOTA = 'Nos 2 primeiros e 2 últimos dias de cada período há influência mista do período vizinho: ' +
    'evite decisões definitivas nesses dias. As datas são aproximadas (±1 dia).';
  const FONTE = 'Inspirado em H. Spencer Lewis, Self Mastery and Fate with the Cycles of Life (AMORC, copyright 1929). ' +
    'Texto de referência: https://archive.org/stream/selfmasteryfatew00lewi/selfmasteryfatew00lewi_djvu.txt';
  const DIA_MS = 86400000;

  const bissexto = a => (a % 4 === 0 && a % 100 !== 0) || a % 400 === 0;
  const diasNoMes = (a, m) => [31, bissexto(a) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
  const utc = (a, m, d) => Date.UTC(a, m - 1, d);
  const paraIso = ms => new Date(ms).toISOString().slice(0, 10);
  const deIso = iso => { const [a, m, d] = iso.split('-').map(Number); return utc(a, m, d); };
  const pad = n => String(n).padStart(2, '0');

  /* 29/02 em ano não bissexto vale 28/02 */
  function aniversario(ano, dia, mes) {
    return (dia === 29 && mes === 2 && !bissexto(ano)) ? utc(ano, 2, 28) : utc(ano, mes, dia);
  }

  /* Usa dados/<prefixo>_pN_estilo.json; senão a tradução dados/<prefixo>_pN.json.
     `carregador(nome)` devolve o JSON (fetch no navegador, fs no Node) ou lança erro. */
  async function carregarTextos(prefixo, periodo, carregador) {
    for (const nome of [`${prefixo}_p${periodo}_estilo.json`, `${prefixo}_p${periodo}.json`]) {
      try {
        const d = await carregador(nome);
        if ('texto' in d) return { texto: d.texto, fonte: null };
        const t = {};
        for (const k of SECOES) { if (!(k in d)) throw new Error('chave ausente'); t[k] = d[k]; }
        t.fonte = d.fonte !== undefined ? d.fonte : null;
        return t;
      } catch (e) { continue; }
    }
    return null;
  }

  /* Os 7 períodos do ciclo que começa em `anoInicio`. */
  function calendario(dia, mes, anoInicio, titulos) {
    const ini = aniversario(anoInicio, dia, mes);
    const fimCiclo = aniversario(anoInicio + 1, dia, mes) - DIA_MS;
    return OFFSETS.map((off, i) => {
      const pIni = ini + off * DIA_MS;
      const pFim = i < 6 ? ini + (OFFSETS[i + 1] - 1) * DIA_MS : fimCiclo;
      return { periodo: i + 1, titulo: titulos[i + 1], inicio: paraIso(pIni), fim: paraIso(pFim),
               dias: Math.round((pFim - pIni) / DIA_MS) + 1 };
    });
  }

  /* Posição de `dataRef` (ISO) no ciclo de 7 períodos que se renova em dia/mes.
     Devolve `textos: null`; use `comTextos` para preencher. */
  function calcular(dia, mes, dataRef, titulos, chaveOrigem) {
    if (!Number.isInteger(dia) || !Number.isInteger(mes) || mes < 1 || mes > 12 || dia < 1 || dia > diasNoMes(2000, mes)) {
      return { erro: `Data inválida: ${pad(dia)}/${pad(mes)}.` };
    }
    const ref = deIso(dataRef);
    const anoRef = new Date(ref).getUTCFullYear();
    const anoIni = aniversario(anoRef, dia, mes) <= ref ? anoRef : anoRef - 1;
    const cal = calendario(dia, mes, anoIni, titulos);
    const atual = cal.find(p => p.inicio <= dataRef && dataRef <= p.fim);
    const n = atual.periodo;
    const diaNo = Math.round((ref - deIso(atual.inicio)) / DIA_MS) + 1;
    const restantes = atual.dias - diaNo;
    const inicioMista = diaNo <= MARGEM_DIAS;
    const fimMista = restantes < MARGEM_DIAS;
    const res = {
      [chaveOrigem]: `${pad(dia)}/${pad(mes)}`,
      data_referencia: dataRef,
      ciclo_inicio: cal[0].inicio,
      ciclo_fim: cal[6].fim,
      dia_do_ciclo: Math.round((ref - deIso(cal[0].inicio)) / DIA_MS) + 1,
      periodo: n,
      titulo: atual.titulo,
      inicio: atual.inicio,
      fim: atual.fim,
      dia_no_periodo: diaNo,
      dias_do_periodo: atual.dias,
      dias_restantes: restantes,
      fase_mista: inicioMista || fimMista,
      calendario: cal,
      nota: NOTA,
      textos: null
    };
    if (inicioMista) res.combina_com = { periodo: n === 1 ? 7 : n - 1 };
    else if (fimMista) res.combina_com = { periodo: n === 7 ? 1 : n + 1 };
    return res;
  }

  /* Preenche res.textos (assíncrono) e devolve o mesmo objeto. */
  async function comTextos(res, prefixo, carregador) {
    if (!res.erro) res.textos = await carregarTextos(prefixo, res.periodo, carregador);
    return res;
  }

  /* ---------- Ciclo Anual Pessoal (ciclo_anual.py) ---------- */
  const ANUAL = {
    prefixo: 'ciclo_anual',
    titulos: {
      1: 'Promoção e prestígio',
      2: 'Mudanças rápidas e viagens curtas',
      3: 'Energia e ação',
      4: 'Mente, ideias e cuidado com enganos',
      5: 'Sucesso e expansão',
      6: 'Lazer e relações',
      7: 'Ruptura e reconstrução'
    }
  };
  const calcularCicloAnual = (dia, mes, dataRef) => calcular(dia, mes, dataRef, ANUAL.titulos, 'nascimento');

  /* ---------- Ciclo da Saúde (ciclo_saude.py); na página aparece como "Vitalidade do Corpo" ---------- */
  const SAUDE = {
    prefixo: 'ciclo_saude',
    aviso: 'Aviso: conteúdo histórico e simbólico; não substitui avaliação médica. Em caso de sintomas, procure um profissional.',
    titulos: {
      1: 'Vitalidade no auge',
      2: 'Alterações leves e passageiras',
      3: 'Acidentes e inflamações',
      4: 'Calma para os nervos',
      5: 'Boa disposição e cuidado com excessos',
      6: 'Moderação: pele, garganta e rins',
      7: 'Período de cautela e descanso'
    }
  };
  function calcularCicloSaude(dia, mes, dataRef) {
    const res = calcular(dia, mes, dataRef, SAUDE.titulos, 'nascimento');
    if (!res.erro) res.aviso = SAUDE.aviso;
    return res;
  }

  /* ---------- Ciclo de Negócios (ciclo_negocios.py); entra só com a data de fundação ---------- */
  const NEGOCIOS = {
    prefixo: 'ciclo_negocios',
    titulos: {
      1: 'Prestígio e boa vontade do público',
      2: 'Ajustes temporários e amizades comerciais',
      3: 'Construção e energia máxima',
      4: 'Grande divulgação e contratos',
      5: 'Crescimento e êxito financeiro',
      6: 'Descanso, luxo e alianças',
      7: 'Reconstrução e conservação'
    }
  };
  const calcularCicloNegocios = (dia, mes, dataRef) => calcular(dia, mes, dataRef, NEGOCIOS.titulos, 'fundacao');

  /* ---------- Ciclo da Alma (ciclo_alma.py): ano solar, só dia e mês de nascimento ---------- */
  const ALMA_DESCRICOES = {
    1: 'Elevados ideais, busca por nobreza, liderança ou belas artes.',
    2: 'Determinação, persistência e busca de harmonia.',
    3: 'Aventura, liderança e amor ao prestígio público.',
    4: 'Erudição, intuição, busca pelo equilíbrio e expressão artística.',
    5: 'Agressividade construtiva, energia, misticismo e espiritualidade.',
    6: 'Capacidade analítica, apreciação estética, crítica construtiva e pesquisa.',
    7: 'Seriedade, fidelidade ao trabalho, misticismo e dupla personalidade.'
  };
  /* início de cada polaridade [mês, dia, período, polaridade], em ordem de calendário */
  const ALMA_INICIOS = [
    [1, 2, 6, 'B'], [1, 28, 7, 'A'], [2, 23, 7, 'B'],
    [3, 22, 1, 'A'], [4, 17, 1, 'B'], [5, 13, 2, 'A'], [6, 8, 2, 'B'],
    [7, 4, 3, 'A'], [7, 31, 3, 'B'], [8, 25, 4, 'A'], [9, 20, 4, 'B'],
    [10, 16, 5, 'A'], [11, 11, 5, 'B'], [12, 7, 6, 'A']
  ];
  const ALMA_FIM_PERIODO = { 1: [5, 12], 2: [7, 3], 3: [8, 24], 4: [10, 15], 5: [12, 6], 6: [1, 27], 7: [3, 21] };
  const ALMA_INICIO_PERIODO = { 1: [3, 22], 2: [5, 13], 3: [7, 4], 4: [8, 25], 5: [10, 16], 6: [12, 7], 7: [1, 28] };
  const ALMA_SECOES = ['perfil', 'vocacao', 'saude', 'afinidades'];
  const fmtMD = md => `${pad(md[1])}/${pad(md[0])}`;
  const mdIgualOuAntes = (a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] <= b[1]);   // (mês, dia) a <= b

  /* dias desde 22/03 (anos de referência sem 29/02; 29/02 conta como 28/02) */
  function almaDiaDoCiclo(mes, dia) {
    const ano = mdIgualOuAntes([3, 22], [mes, dia]) ? 2002 : 2003;
    if (mes === 2 && dia === 29) dia = 28;
    return Math.round((utc(ano, mes, dia) - utc(2002, 3, 22)) / DIA_MS);
  }
  function almaFimPol(idx) {            // véspera do início da próxima polaridade
    const [m, d] = ALMA_INICIOS[(idx + 1) % ALMA_INICIOS.length];
    const f = new Date(utc(2003, m, d) - DIA_MS);
    return fmtMD([f.getUTCMonth() + 1, f.getUTCDate()]);
  }
  function calendarioAlma() {           // os 14 segmentos, a partir de 22/03
    const ordem = ALMA_INICIOS.slice(3).concat(ALMA_INICIOS.slice(0, 3));
    return ordem.map(([m, d, per, pol], i) => {
      const [nm, nd] = ordem[(i + 1) % ordem.length];
      const dias = (((almaDiaDoCiclo(nm, nd) - almaDiaDoCiclo(m, d)) % 365) + 365) % 365;
      const fim = new Date(utc(2003, nm, nd) - DIA_MS);
      return { periodo: per, polaridade: pol, inicio: fmtMD([m, d]),
               fim: fmtMD([fim.getUTCMonth() + 1, fim.getUTCDate()]), dias };
    });
  }
  async function almaTextos(periodo, pol, carregador) {
    for (const nome of [`ciclo_alma_p${periodo}_estilo.json`, `ciclo_alma_p${periodo}.json`]) {
      try {
        const d = await carregador(nome);
        if (!d.polaridades) throw new Error('sem polaridades');
        const polTxt = d.polaridades[pol] !== undefined ? d.polaridades[pol] : null;
        if ('texto' in d) return { secoes: { texto: d.texto }, polaridade: polTxt, fonte: null };
        const secoes = {};
        for (const k of ALMA_SECOES) { if (!(k in d)) throw new Error('chave ausente'); secoes[k] = d[k]; }
        return { secoes, polaridade: polTxt, fonte: d.fonte !== undefined ? d.fonte : null };
      } catch (e) { continue; }
    }
    return null;
  }
  /* Devolve `textos: null`; use `comTextosAlma` para preencher. */
  function calcularCicloAlma(dia, mes) {
    if (!Number.isInteger(dia) || !Number.isInteger(mes) || mes < 1 || mes > 12 || dia < 1 || dia > diasNoMes(2000, mes)) {
      return { erro: `Data inválida: ${pad(dia)}/${pad(mes)}.` };
    }
    const alvo = [mes, dia];
    let atual = ALMA_INICIOS[ALMA_INICIOS.length - 1];   // antes de 02/01 vale a última da lista
    for (const ini of ALMA_INICIOS) if (mdIgualOuAntes([ini[0], ini[1]], alvo)) atual = ini;
    const idx = ALMA_INICIOS.indexOf(atual);
    const fronteira = atual[0] === mes && atual[1] === dia;
    const periodo = atual[2], pol = atual[3];
    const ini = almaDiaDoCiclo(...ALMA_INICIO_PERIODO[periodo]);
    const fim = almaDiaDoCiclo(...ALMA_FIM_PERIODO[periodo]);
    const res = {
      data: `${pad(dia)}/${pad(mes)}`,
      periodo, polaridade: pol,
      resumo: ALMA_DESCRICOES[periodo],
      fronteira,
      periodo_inicio: fmtMD(ALMA_INICIO_PERIODO[periodo]),
      periodo_fim: fmtMD(ALMA_FIM_PERIODO[periodo]),
      polaridade_inicio: fmtMD([atual[0], atual[1]]),
      polaridade_fim: almaFimPol(idx),
      dia_no_periodo: almaDiaDoCiclo(mes, dia) - ini + 1,
      dias_do_periodo: fim - ini + 1,
      textos: null,
      dia_do_ciclo: almaDiaDoCiclo(mes, dia) + 1,
      dias_do_ciclo: 365,
      calendario: calendarioAlma()
    };
    if (fronteira) {
      const ant = ALMA_INICIOS[(idx + ALMA_INICIOS.length - 1) % ALMA_INICIOS.length];
      res.combina_com = { periodo: ant[2], polaridade: ant[3] };
    }
    return res;
  }
  async function comTextosAlma(res, carregador) {
    if (!res.erro) res.textos = await almaTextos(res.periodo, res.polaridade, carregador);
    return res;
  }

  /* ---------- Ciclo Diário de 24 h (ciclo_diario.py) ---------- */
  const DIARIO_INICIOS_MIN = [0, 205, 411, 617, 822, 1028, 1234];
  const DIARIO_MARGEM_MIN = 5;
  const DIAS_SEMANA = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
  /* weekday: 0=Segunda ... 6=Domingo (como no Python) */
  const MATRIZ_LETRAS = { 6: 'GABCDEF', 0: 'CDEFGAB', 1: 'FGABCDE', 2: 'BCDEFGA', 3: 'EFGABCD', 4: 'ABCDEFG', 5: 'DEFGABC' };
  const hhmm = min => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

  /* Momento = hora do relógio local, 'AAAA-MM-DD HH:MM'; vira ms em "UTC de parede" (sem fuso nem horário de verão). */
  function momentoParaMs(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(iso);
    if (!m) return null;
    return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  }
  const msParts = ms => { const d = new Date(ms); return { wd: (d.getUTCDay() + 6) % 7, min: d.getUTCHours() * 60 + d.getUTCMinutes() }; };
  function diarioPeriodoLetra(ms) {     // (período, letra) pelo relógio, sem margem
    const { wd, min } = msParts(ms);
    let per = 1;
    DIARIO_INICIOS_MIN.forEach((ini, i) => { if (ini <= min) per = i + 1; });
    return [per, MATRIZ_LETRAS[wd][per - 1]];
  }
  function calendarioDoDia(wd) {
    return DIARIO_INICIOS_MIN.map((ini, i) => {
      const fim = i < 6 ? DIARIO_INICIOS_MIN[i + 1] : 1440;
      return { periodo: i + 1, letra: MATRIZ_LETRAS[wd][i], inicio: hhmm(ini),
               fim: fim === 1440 ? '24:00' : hhmm(fim), minutos: fim - ini };
    });
  }
  async function diarioTextos(letra, carregador) {
    for (const nome of [`ciclo_diario_${letra}_estilo.json`, `ciclo_diario_${letra}.json`]) {
      try {
        const d = await carregador(nome);
        if ('texto' in d) return { texto: d.texto, fonte: null };
        const t = {};
        for (const k of SECOES) { if (!(k in d)) throw new Error('chave ausente'); t[k] = d[k]; }
        t.fonte = d.fonte !== undefined ? d.fonte : null;
        return t;
      } catch (e) { continue; }
    }
    return null;
  }
  /* Devolve `textos: null`; use `comTextosDiario` para preencher. */
  function calcularCicloDiario(momentoIso) {
    const ms = momentoParaMs(momentoIso);
    if (ms === null) return { erro: 'Momento inválido. Use AAAA-MM-DD HH:MM.' };
    const { wd, min: atualMin } = msParts(ms);
    const [periodo, letra] = diarioPeriodoLetra(ms);
    const ini = DIARIO_INICIOS_MIN[periodo - 1];
    const fim = periodo < 7 ? DIARIO_INICIOS_MIN[periodo] : 1440;
    const antes = diarioPeriodoLetra(ms - DIARIO_MARGEM_MIN * 60000);
    const depois = diarioPeriodoLetra(ms + DIARIO_MARGEM_MIN * 60000);
    const transicao = antes[0] !== depois[0] || antes[1] !== depois[1];
    const res = {
      dia_semana: DIAS_SEMANA[wd],
      horario: hhmm(atualMin),
      periodo, letra,
      inicio: hhmm(ini),
      fim: fim < 1440 ? hhmm(fim) : '24:00',
      minutos_restantes: fim - atualMin,
      transicao,
      textos: null,
      minuto_do_dia: atualMin,
      calendario: calendarioDoDia(wd)
    };
    if (transicao) {
      const difere = antes[0] !== periodo || antes[1] !== letra;
      res.combina_com = difere ? { periodo: antes[0], letra: antes[1] } : { periodo: depois[0], letra: depois[1] };
    }
    return res;
  }
  async function comTextosDiario(res, carregador) {
    if (!res.erro) res.textos = await diarioTextos(res.letra, carregador);
    return res;
  }

  /* ---------- Motor único (autodominio.py: calcular_tudo) ---------- */
  /* `momentoIso` = 'AAAA-MM-DD HH:MM' (hora do relógio local); `fundacao` = [dia, mes] ou null (opcional). */
  async function calcularTudo(dia, mes, momentoIso, fundacao, carregador) {
    const alma = await comTextosAlma(calcularCicloAlma(dia, mes), carregador);
    if (alma.erro) return { erro: alma.erro };
    const dataRef = momentoIso.slice(0, 10);
    const res = {
      consulta: { nascimento: `${pad(dia)}/${pad(mes)}`, momento: momentoIso.slice(0, 16).replace('T', ' ') },
      alma,
      diario: await comTextosDiario(calcularCicloDiario(momentoIso), carregador),
      anual: await comTextos(calcularCicloAnual(dia, mes, dataRef), ANUAL.prefixo, carregador),
      saude: await comTextos(calcularCicloSaude(dia, mes, dataRef), SAUDE.prefixo, carregador)
    };
    if (res.diario.erro) return { erro: res.diario.erro };
    if (fundacao) {
      const neg = await comTextos(calcularCicloNegocios(fundacao[0], fundacao[1], dataRef), NEGOCIOS.prefixo, carregador);
      if (neg.erro) return { erro: neg.erro };
      res.consulta.fundacao = `${pad(fundacao[0])}/${pad(fundacao[1])}`;
      res.negocios = neg;
    }
    return res;
  }

  const API = { FONTE, NOTA, OFFSETS, aniversario, calendario, calcular, carregarTextos, comTextos,
                ANUAL, calcularCicloAnual, calcularTudo, calcularCicloAlma, comTextosAlma, calcularCicloDiario, comTextosDiario, SAUDE, calcularCicloSaude, NEGOCIOS, calcularCicloNegocios, _util: { paraIso, deIso, bissexto, diasNoMes, pad, utc } };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.Ciclos = API;
})(typeof window !== 'undefined' ? window : globalThis);
