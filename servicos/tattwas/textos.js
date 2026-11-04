/* Tattwas Gradarius: textos da tela ficam aqui.
   Só textos de funcionamento (rótulos, avisos, botões). As frases sobre a qualidade de cada elemento
   ainda NÃO foram escritas: ficam vazias em "elementos" e a tela as omite enquanto estiverem vazias. */
window.TEXTOS = {
  paginaTitulo: 'Tattwas | Gradarius',

  menu: { voltar: 'Voltar ao site', temaClaro: 'Tema claro', temaEscuro: 'Tema escuro' },

  topo: {
    titulo: 'Os cinco elementos do dia',
    destaque: 'A sequência dos Tattwas.',
    texto: 'Veja o elemento de agora. Use a sua localização ou digite os horários do sol.'
  },

  formulario: {
    nascer: 'Hora do nascer do sol',
    por: 'Hora do pôr do sol',
    dica: 'hh:mm',
    ajuda: 'Consulte no celular ou em um almanaque.',
    ou: 'ou digite os horários',
    local: 'Usar minha localização',
    localBuscando: 'Buscando a localização…',
    localOk: 'Horários de hoje para a sua localização. Você pode ajustar.',
    localNegado: 'Sem permissão para a localização. Digite os horários.',
    localFalha: 'Não foi possível obter a localização. Digite os horários.',
    localSemSol: 'Neste local o sol não nasce ou não se põe hoje. Digite os horários.',
    localPriv: 'A localização é usada só para o cálculo, neste aparelho. Não é enviada nem guardada.',
    outro: 'Ver outro horário (opcional)',
    outroRotulo: 'Hora (hh:mm), vazio = agora',
    lembrar: 'Lembrar neste aparelho',
    botao: 'Ver os elementos',
    privacidade: 'Seus dados ficam só neste aparelho. Nada é enviado a servidor.'
  },

  erros: {
    nascerVazio: 'Digite a hora do nascer do sol.',
    porVazio: 'Digite a hora do pôr do sol.',
    invalida: 'Use o formato hh:mm, por exemplo 06:30.',
    ordem: 'O nascer do sol precisa ser antes do pôr do sol.',
    outroInvalida: 'Use o formato hh:mm, por exemplo 14:30.'
  },

  /* Nome, significado e frase de cada elemento. A frase (qualidade) fica vazia por enquanto. */
  elementos: {
    akasa:    { nome: 'Âkâza',    sig: 'éter',  frase: '' },
    vayu:     { nome: 'Vâyu',     sig: 'ar',    frase: '' },
    tejas:    { nome: 'Tejas',    sig: 'fogo',  frase: '' },
    apas:     { nome: 'Âpas',     sig: 'água',  frase: '' },
    prithivi: { nome: 'Prithîvî', sig: 'terra', frase: '' }
  },

  periodos: { dia: 'Dia', noite: 'Noite' },

  agora: {
    titulo: 'Agora',
    em: 'Às {hora}',
    emOutro: 'Às {hora} (horário escolhido)',
    faltam: 'Faltam {n} para {proximo}.',
    minuto: '1 minuto',
    minutos: '{n} minutos',
    ate: 'O bloco vai das {inicio} às {fim}.'
  },

  secoes: {
    roda: 'A roda do dia',
    rodaDica: 'Seis horas no topo, meio-dia à direita, dezoito horas embaixo e meia-noite à esquerda.',
    proximos: 'Próximos blocos',
    todos: 'Ver todos os horários',
    todosTexto: 'Cada elemento dura 24 minutos. Ao nascer do sol e ao pôr do sol a sequência recomeça em Âkâza.',
    horario: '{inicio} às {fim}'
  },

  roda: {
    legendaDia: 'Dia (do nascer ao pôr do sol)',
    legendaNoite: 'Noite (do pôr ao nascer do sol)',
    nascer: 'nascer',
    por: 'pôr',
    descricao: 'Roda de 24 horas com os blocos de 24 minutos de cada elemento. Seis horas no topo, doze à direita, dezoito embaixo e vinte e quatro à esquerda. Agora: {agora}.'
  },

  acoes: { salvar: 'Salvar imagem' },

  chamada: {
    texto: 'Os Tattwas mostram o ritmo do seu dia. O Mapa Numerológico mostra o seu caminho.',
    botaoMapa: 'Conheça mais sobre o Mapa Numerológico',
    botaoConsulta: 'Agende uma consulta de Tarot'
  },

  /* Destino dos botões da chamada. Ajuste quando as páginas existirem. */
  links: {
    voltar: '../../index.html',
    mapa: '../../index.html#mapa-numerologico',
    consulta: '../../index.html#contato'
  },

  rodape: {
    aviso: 'Uma ferramenta de autoconhecimento. Não substitui orientação médica ou psicológica.',
    marca: 'Gradarius'
  }
};
