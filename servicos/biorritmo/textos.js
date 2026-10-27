/* Biorritmo Gradarius: TODOS os textos da tela ficam aqui.
   São rascunhos para o Marco reescrever. Edite só o que está entre aspas. */
window.TEXTOS = {
  paginaTitulo: 'Biorritmo | Gradarius',
  paginaDescricao: 'Veja seus ritmos de energia de hoje e das próximas semanas. Gratuito, sem cadastro.',

  menu: { voltar: 'Voltar ao site', temaClaro: 'Tema claro', temaEscuro: 'Tema escuro' },

  topo: {
    titulo: 'Seus ritmos de energia',
    destaque: 'Hoje e nas próximas semanas.',
    texto: 'Informe sua data de nascimento e veja como a energia do corpo, das emoções e da mente se movimenta.'
  },

  formulario: {
    nascimento: 'Data de nascimento',
    nascimentoDica: 'dd/mm/aaaa',
    calendario: 'ou escolha no calendário',
    nome: 'Seu nome (opcional, só aparece na imagem)',
    referencia: 'Ver outro dia (opcional)',
    referenciaDica: 'dd/mm/aaaa, vazio = hoje',
    lembrar: 'Lembrar neste aparelho',
    botao: 'Ver meus ritmos',
    privacidade: 'Seus dados ficam só neste aparelho. Nada é enviado a servidor.'
  },

  erros: {
    vazio: 'Digite sua data de nascimento.',
    invalida: 'Essa data não parece existir. Confira o dia, o mês e o ano.',
    futura: 'A data de nascimento não pode estar no futuro.',
    antiga: 'Use uma data a partir de 1900.',
    referenciaInvalida: 'A data do outro dia não parece existir.',
    referenciaAntes: 'O outro dia precisa ser depois do nascimento.'
  },

  /* Nomes iguais aos da planilha de referência. */
  ciclos: {
    corpo:    { nome: 'Físico' },
    emocoes:  { nome: 'Emocional' },
    mente:    { nome: 'Mental' },
    harmonia: { nome: 'Harmonia' },
    manas:    { nome: 'Manas' },
    budhi:    { nome: 'Budhi' },
    atma:     { nome: 'Átma' }
  },

  /* Cada fase tem uma frase para cada ritmo (frases), baseada no que o ritmo governa.
     Se faltar o ritmo, vale a frase geral (frase). */
  fases: {
    alta: { icone: '▲', rotulo: 'Em alta',
      frase: 'Em alta. Um bom momento para se dedicar ao que é importante para você.',
      frases: {
        corpo:    'Vitalidade em alta. Um bom momento para se movimentar e tomar iniciativas.',
        emocoes:  'Sentimentos em alta. Um bom momento para conversar, criar vínculos e se expressar.',
        mente:    'Mente clara e em alta. Um bom momento para estudar, planejar e decidir.',
        harmonia: 'Equilíbrio em alta. Um bom momento para alinhar corpo, emoções e mente.',
        manas:    'Reflexão em alta. Um bom momento para buscar sentido e olhar o quadro maior.',
        budhi:    'Intuição em alta. Um bom momento para ouvir a sua voz interior.',
        atma:     'Conexão com a essência em alta. Um bom momento para lembrar o que realmente importa.'
      } },
    subindo: { icone: '↗', rotulo: 'Crescendo',
      frase: 'Energia crescendo. Comece com calma.',
      frases: {
        corpo:    'Vitalidade crescendo. Comece com calma, retomando as atividades aos poucos.',
        emocoes:  'Sensibilidade crescendo. Comece com calma, abrindo-se aos poucos às conversas.',
        mente:    'Clareza crescendo. Comece com calma, por tarefas simples.',
        harmonia: 'Equilíbrio voltando. Comece com calma, com pequenos gestos de cuidado.',
        manas:    'Reflexão crescendo. Comece com calma, reservando um momento de silêncio.',
        budhi:    'Intuição despertando. Comece com calma e observe o que surge.',
        atma:     'Conexão com a essência crescendo. Comece com calma, com um momento só seu.'
      } },
    recolhimento: { icone: '↘', rotulo: 'Recolhimento',
      frase: 'Energia em recolhimento. Valorize o descanso e a revisão.',
      frases: {
        corpo:    'Vitalidade em recolhimento. Valorize o descanso e o sono.',
        emocoes:  'Sentimentos em recolhimento. Valorize a quietude e o tempo consigo.',
        mente:    'Mente em recolhimento. Valorize a revisão e o que já foi feito.',
        harmonia: 'Equilíbrio em recolhimento. Valorize pausas e rotinas simples.',
        manas:    'Reflexão em recolhimento. Valorize o silêncio e a contemplação.',
        budhi:    'Intuição em recolhimento. Valorize a quietude para ouvi-la melhor.',
        atma:     'Essência em recolhimento. Valorize a simplicidade e a presença.'
      } },
    baixa: { icone: '▼', rotulo: 'Poupando',
      frase: 'Hora de poupar energia e se cuidar. Esta fase passa e volta a subir.',
      frases: {
        corpo:    'Hora de poupar a vitalidade e se cuidar. Esta fase passa e volta a subir.',
        emocoes:  'Hora de acolher o que sente, com calma. Esta fase passa e volta a subir.',
        mente:    'Hora de simplificar e dar descanso às ideias. Esta fase passa e volta a subir.',
        harmonia: 'Hora de cuidar do equilíbrio com gestos simples. Esta fase passa e volta a subir.',
        manas:    'Hora de silenciar e deixar as respostas amadurecerem. Esta fase passa e volta a subir.',
        budhi:    'Hora de se aquietar e confiar no tempo. Esta fase passa e volta a subir.',
        atma:     'Hora de simplicidade e presença. Esta fase passa e volta a subir.'
      } },
    troca: { icone: '⇄', rotulo: 'Dia de troca', frase: 'Dia de transição. Vá com atenção e gentileza.' }
  },

  secoes: {
    hoje: 'Como estão seus ritmos',
    hojeDe: 'Em {data}',
    grafico: 'Seu gráfico',
    graficoDica: 'Passe o dedo ou o mouse pelo gráfico. Com o teclado, use as setas.',
    profundos: 'Ver ritmos mais profundos',
    profundosTexto: 'Ritmos mais lentos, que falam de harmonia, mente superior, intuição e essência.',
    transicoes: 'Próximos dias de troca',
    transicoesTexto: 'Dias em que o ritmo muda de direção. Um bom momento para ir com atenção e gentileza.',
    transicoesVazio: 'Nenhuma troca nos próximos 30 dias.',
    transicaoHoje: 'hoje',
    transicaoAmanha: 'amanhã',
    transicaoEm: 'em {n} dias'
  },

  grafico: {
    hoje: 'hoje',
    janela: 'Período',
    janelas: { 30: '30 dias', 60: '60 dias', 90: '90 dias' },
    diaSelecionado: 'Dia {data} ({semana})',
    tituloImagem: 'Biorritmo',
    nenhuma: 'Marque pelo menos um ritmo na legenda para vê-lo no gráfico.',
    descricao: 'Gráfico de linhas dos ritmos de energia entre {inicio} e {fim}. Eixo vertical de menos 100 a mais 100 por cento. Hoje: {hoje}.'
  },

  /* Frase-chave: aparece abaixo do título dos medidores e no fim de "Entenda seus ritmos". */
  fraseChave: 'A leitura deve ser usada como uma ferramenta de auto-observação, e não de determinismo.',

  /* Seção "Entenda seus ritmos" (texto explicativo, rascunho para o Marco reescrever). */
  sobre: {
    titulo: 'Entenda seus ritmos',
    abertura: [
      'O universo se move em ciclos. O biorritmo desenha essas ondas a partir do dia em que você nasceu.',
      'É um modelo simbólico, criado no Ocidente no século XX. Não é uma tradição antiga, nem uma medida científica da sua vida. Aqui ele serve como um espelho para observar as marés da sua energia.',
      'Os três ritmos clássicos conversam com os corpos sutis descritos em antigos ensinamentos orientais, como o Vedanta.'
    ],
    ciclos: [
      { id: 'corpo', titulo: 'Físico',
        elo: 'Corpo físico · Annamaya Kosha (no Vedanta)',
        texto: 'Fala da vitalidade e da energia vital, o Prana.',
        alta: 'Na fase alta, o corpo recebe bem o esforço. Um bom momento para se movimentar e tomar iniciativas.',
        baixa: 'Na fase baixa, a energia se recolhe para se renovar. Um bom momento para descansar e respeitar seus limites.' },
      { id: 'emocoes', titulo: 'Emocional',
        elo: 'Corpo emocional · Manomaya Kosha (no Vedanta)',
        texto: 'É a maré dos sentimentos e das sensações.',
        alta: 'Na fase alta, a empatia e a criatividade se expandem. Um bom momento para conversar, criar vínculos e se expressar.',
        baixa: 'Na fase baixa, a sensibilidade pede quietude. Um bom momento para olhar para dentro e observar o que sente, com calma.' },
      { id: 'mente', titulo: 'Mental',
        elo: 'Mente concreta · Vijnanamaya Kosha (no Vedanta)',
        texto: 'Cuida do raciocínio, da organização das ideias e da memória.',
        alta: 'Na fase alta, as ideias ficam claras. Um bom momento para estudar, planejar e decidir.',
        baixa: 'Na fase baixa, a mente solta o controle. Um bom momento para silenciar o excesso de pensamentos e ouvir a intuição (Budhi).' }
    ],
    profundos: {
      titulo: 'Os ritmos mais profundos',
      texto: 'Os quatro ritmos mais lentos falam de dimensões mais sutis: o equilíbrio, a mente superior, a intuição e a essência.',
      ciclos: [
        { id: 'harmonia', titulo: 'Harmonia',
          elo: 'Equilíbrio entre corpo, emoções e mente · Pranamaya Kosha (no Vedanta)',
          texto: 'É o fio de energia vital que une corpo, emoções e mente.',
          alta: 'Na fase alta, tudo tende a fluir com mais leveza. Um bom momento para alinhar corpo, emoções e mente.',
          baixa: 'Na fase baixa, o equilíbrio pede cuidado. Um bom momento para pausas, rotinas simples e respiração tranquila.' },
        { id: 'manas', titulo: 'Manas',
          elo: 'Mente superior · ponte entre a razão e a intuição',
          texto: 'Fala da reflexão profunda, da busca de sentido e do quadro maior da vida.',
          alta: 'Na fase alta, surgem boas perguntas e visões amplas. Um bom momento para refletir sobre rumos e propósitos.',
          baixa: 'Na fase baixa, as respostas pedem tempo. Um bom momento para silenciar e deixar as ideias amadurecerem.' },
        { id: 'budhi', titulo: 'Budhi',
          elo: 'Intuição, o saber interior · Anandamaya Kosha (no Vedanta)',
          texto: 'Fala da intuição, do saber interior que chega sem esforço.',
          alta: 'Na fase alta, a voz interior fica mais nítida. Um bom momento para escutar a si mesmo.',
          baixa: 'Na fase baixa, a intuição pede quietude. Um bom momento para se aquietar e confiar no tempo.' },
        { id: 'atma', titulo: 'Átma',
          elo: 'Essência · Atman, o Eu que está além dos corpos sutis (no Vedanta)',
          texto: 'Fala da sua essência, do que permanece além das mudanças.',
          alta: 'Na fase alta, a conexão com o essencial fica mais perceptível. Um bom momento para lembrar o que realmente importa.',
          baixa: 'Na fase baixa, a essência pede simplicidade. Um bom momento para estar presente, sem pressa.' }
      ]
    },
    livre: {
      titulo: 'Você conduz o seu ritmo',
      texto: [
        'Em muitas tradições espirituais, a consciência desperta conduz a matéria. Um gráfico não é uma sentença.',
        'Uma fase baixa não anuncia nada ruim: é só o momento de recolher. Use o biorritmo como um mapa de energia, para perceber a hora de avançar e a hora de descansar.'
      ]
    }
  },

  medidor: { de: 'de −100% a +100%' },

  acoes: {
    salvar: 'Salvar imagem',
    copiar: 'Copiar link',
    copiado: 'Link copiado.',
    copiarFalhou: 'Não foi possível copiar. Copie o endereço da barra do navegador.',
    incluirData: 'Incluir minha data de nascimento no link',
    incluirDataAviso: 'Quem receber o link verá sua data.'
  },

  chamada: {
    texto: 'O biorritmo mostra o seu ritmo de hoje. O Mapa Numerológico mostra o seu caminho.',
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
