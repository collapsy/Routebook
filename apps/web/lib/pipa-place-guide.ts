export type PipaPlaceGuideSource = {
  label: string;
  url: string;
};

export type PipaPlacePracticalGuide = {
  goodFor: string;
  suggestedDuration: string;
  bestWindow: string;
  access: string;
  checks: readonly [string, ...string[]];
  sources: readonly PipaPlaceGuideSource[];
  reviewedAt: "2026-08-16";
};

const cityTourismSource: PipaPlaceGuideSource = {
  label: "Prefeitura de Tibau do Sul — Turismo e Lazer",
  url: "https://tibaudosul.rn.gov.br/o-municipio/turismo-e-lazer/",
};

const nationalTourismSource: PipaPlaceGuideSource = {
  label: "Visit Brasil — Pipa",
  url: "https://visitbrasil.com/location/pipa-pt/",
};

const destinationSources = [cityTourismSource, nationalTourismSource] as const;
const reviewedAt = "2026-08-16" as const;

const pipaPlaceGuides = {
  "praia-do-amor": {
    goodFor: "Falésias, banho de mar com atenção às condições e uma caminhada costeira curta.",
    suggestedDuration: "2 a 4 horas, como orientação de planejamento.",
    bestWindow: "Manhã ou começo da tarde, depois de conferir maré e condições do mar.",
    access: "Acesso por escadaria na falésia ou pela areia quando a maré permite.",
    checks: [
      "Confira a tábua de marés antes de usar o caminho pela areia.",
      "Considere o retorno pela escadaria se a maré subir durante a visita.",
    ],
    sources: destinationSources,
    reviewedAt,
  },
  "baia-dos-golfinhos": {
    goodFor:
      "Caminhada de praia, paisagem natural e possibilidade não garantida de observar golfinhos.",
    suggestedDuration: "2 a 3 horas, além do tempo de caminhada de ida e volta.",
    bestWindow: "Somente numa janela de maré compatível com acesso e retorno pela areia.",
    access: "O acesso usual é caminhando pela faixa de areia a partir das praias vizinhas.",
    checks: [
      "Planeje ida e retorno pela tábua de marés; o acesso pode ficar interrompido.",
      "A presença de golfinhos é natural e não pode ser prometida.",
    ],
    sources: destinationSources,
    reviewedAt,
  },
  "chapadao-de-pipa": {
    goodFor: "Vista panorâmica das falésias, fotografia e uma parada curta entre praias.",
    suggestedDuration: "30 a 60 minutos.",
    bestWindow: "Início da manhã ou fim da tarde, evitando o sol mais forte.",
    access: "Acesso terrestre; confirme o ponto de chegada e estacionamento antes de sair.",
    checks: [
      "Mantenha distância segura da borda das falésias.",
      "Leve proteção solar e água, pois a área é exposta.",
    ],
    sources: destinationSources,
    reviewedAt,
  },
  "centro-gastronomico-de-pipa": {
    goodFor: "Comparar restaurantes e decidir a refeição caminhando pelo centro.",
    suggestedDuration: "1 a 2 horas para uma refeição.",
    bestWindow: "Almoço ou jantar, conforme o ritmo do grupo.",
    access: "Área central normalmente explorada a pé; use a rota real para o ponto de entrada.",
    checks: [
      "Escolha o estabelecimento no dia e confirme horário, fila e reserva.",
      "Faixa de preço e cardápio variam entre os restaurantes da área.",
    ],
    sources: [],
    reviewedAt,
  },
  "avenida-baia-dos-golfinhos-noite": {
    goodFor:
      "Explorar bares, música e movimento noturno sem escolher um único estabelecimento antes.",
    suggestedDuration: "2 a 4 horas, de acordo com o grupo.",
    bestWindow: "Noite; a programação varia por dia.",
    access: "Eixo central caminhável, com circulação e ruído maiores nos horários de pico.",
    checks: [
      "Confirme a programação dos locais no mesmo dia.",
      "Combine ponto e forma de retorno antes de iniciar a noite.",
    ],
    sources: [],
    reviewedAt,
  },
  "praia-do-centro": {
    goodFor: "Acesso rápido a partir da vila, banho de mar e integração com o centro.",
    suggestedDuration: "2 a 4 horas.",
    bestWindow: "Manhã ou tarde, depois de conferir maré e condições do mar.",
    access: "Acesso direto pela área central, com trechos de areia que mudam conforme a maré.",
    checks: [
      "Confira a maré se pretende caminhar para praias vizinhas.",
      "Passeios náuticos e serviços locais devem ser confirmados no momento da visita.",
    ],
    sources: destinationSources,
    reviewedAt,
  },
  "praia-do-madeiro": {
    goodFor: "Praia cercada por vegetação, banho de mar e permanência de meio período.",
    suggestedDuration: "3 a 5 horas.",
    bestWindow: "Manhã ou começo da tarde.",
    access: "O acesso principal inclui uma escadaria longa a partir da via costeira.",
    checks: [
      "Avalie a escadaria para pessoas com mobilidade reduzida, crianças ou muito volume.",
      "Confira mar e maré antes do banho.",
    ],
    sources: destinationSources,
    reviewedAt,
  },
  "santuario-ecologico-de-pipa": {
    goodFor: "Trilhas, mirantes, Mata Atlântica e uma atividade de natureza fora da areia.",
    suggestedDuration: "2 a 4 horas, conforme as trilhas escolhidas.",
    bestWindow: "Manhã, com temperatura mais amena.",
    access: "Entrada terrestre; trilhas podem ter desnível e piso natural.",
    checks: [
      "Confirme abertura, ingresso e condições das trilhas no dia.",
      "Use calçado adequado, água e proteção contra sol e insetos.",
    ],
    sources: destinationSources,
    reviewedAt,
  },
  "camarao-na-fazenda-pipa": {
    goodFor:
      "Refeição de frutos do mar no centro, especialmente para um almoço ou jantar planejado.",
    suggestedDuration: "1 a 2 horas.",
    bestWindow: "Almoço ou jantar.",
    access: "Localização central; compare rota a pé e de carro a partir da hospedagem.",
    checks: [
      "Confirme horário, reserva, cardápio e restrições alimentares no dia.",
      "Valores e disponibilidade não são dados em tempo real do RouteBook.",
    ],
    sources: [],
    reviewedAt,
  },
  "atelier-de-massas": {
    goodFor: "Jantar de massas em um restaurante de pequeno porte no centro.",
    suggestedDuration: "1 a 2 horas.",
    bestWindow: "Jantar, com reserva quando recomendada pelo estabelecimento.",
    access: "Área central; priorize deslocamento a pé se a rota for adequada.",
    checks: [
      "Confirme funcionamento e reserva no mesmo dia.",
      "Consulte cardápio atual para restrições e preferências do grupo.",
    ],
    sources: [],
    reviewedAt,
  },
  "o-tal-do-escondidinho": {
    goodFor: "Cozinha brasileira e regional numa refeição casual no centro.",
    suggestedDuration: "1 a 2 horas.",
    bestWindow: "Almoço ou jantar.",
    access: "Na Avenida Baía dos Golfinhos, em trecho normalmente explorado a pé.",
    checks: [
      "Confirme horário, fila e cardápio atual antes de sair.",
      "Consulte diretamente o local sobre alergias e restrições alimentares.",
    ],
    sources: [],
    reviewedAt,
  },
  "mirante-sunset-bar": {
    goodFor: "Pôr do sol, vista elevada e uma parada com bebidas ou música.",
    suggestedDuration: "1 a 3 horas.",
    bestWindow: "Fim da tarde, chegando com antecedência em dias concorridos.",
    access: "Área elevada; confirme rota, entrada e disponibilidade de mesa.",
    checks: [
      "Confirme horário, ingresso ou consumação e programação no dia.",
      "A visibilidade do pôr do sol depende das condições meteorológicas.",
    ],
    sources: [],
    reviewedAt,
  },
  "agora-club": {
    goodFor: "Música e dança numa noite com programação definida.",
    suggestedDuration: "2 a 5 horas.",
    bestWindow: "Noite ou madrugada, somente após confirmar o evento do dia.",
    access: "Trecho central da Avenida Baía dos Golfinhos.",
    checks: [
      "Confirme evento, abertura, ingresso e classificação etária.",
      "Planeje o retorno seguro antes de sair.",
    ],
    sources: [],
    reviewedAt,
  },
  "praia-das-minas": {
    goodFor: "Paisagem de falésias e um trecho de praia menos urbano ao sul de Pipa.",
    suggestedDuration: "2 a 4 horas.",
    bestWindow: "Com luz natural e maré conferida antes da saída.",
    access: "Use rota atual e confirme o ponto de acesso; o trecho é menos estruturado.",
    checks: [
      "Confira maré e condições do mar.",
      "Leve água e proteção solar e não dependa de serviços no local.",
    ],
    sources: destinationSources,
    reviewedAt,
  },
  "praia-de-cacimbinhas": {
    goodFor: "Falésias, dunas, paisagem aberta e uma parada no caminho de Tibau do Sul.",
    suggestedDuration: "2 a 4 horas.",
    bestWindow: "Manhã ou fim da tarde.",
    access: "Confirme o acesso escolhido; há desnível entre a via e a praia.",
    checks: [
      "Avalie acessibilidade e condições do acesso antes de descer.",
      "Confira vento, maré e condições do mar.",
    ],
    sources: destinationSources,
    reviewedAt,
  },
  "praia-de-sibauma": {
    goodFor: "Litoral aberto e uma experiência mais distante do centro de Pipa.",
    suggestedDuration: "3 a 5 horas, incluindo deslocamento.",
    bestWindow: "Manhã ou começo da tarde.",
    access: "Deslocamento terrestre até Sibaúma; compare rota e tempo antes de sair.",
    checks: [
      "Confira maré e condições do mar.",
      "Planeje transporte de ida e volta e leve o necessário para uma praia menos central.",
    ],
    sources: destinationSources,
    reviewedAt,
  },
  "praia-de-tibau-do-sul": {
    goodFor: "Combinar praia, vila de Tibau do Sul e paisagem próxima à Lagoa de Guaraíras.",
    suggestedDuration: "3 a 5 horas, incluindo deslocamento.",
    bestWindow: "Manhã ou tarde, considerando maré e o restante do roteiro em Tibau do Sul.",
    access: "Deslocamento terrestre a partir de Pipa; use rota real antes de sair.",
    checks: [
      "Confira maré e condições do mar.",
      "Evite tratar a distância em linha reta como tempo de carro.",
    ],
    sources: destinationSources,
    reviewedAt,
  },
  "caxanga-restaurante": {
    goodFor: "Peixes e frutos do mar numa refeição próxima à orla central.",
    suggestedDuration: "1 a 2 horas.",
    bestWindow: "Almoço ou jantar.",
    access: "No Largo São Sebastião, próximo à área central e à praia.",
    checks: [
      "Confirme horário, reserva e cardápio atual.",
      "Consulte diretamente o restaurante sobre alergias e restrições.",
    ],
    sources: [],
    reviewedAt,
  },
  "macoco-cozinha-artesanal": {
    goodFor: "Refeição autoral com referências regionais no centro.",
    suggestedDuration: "1 a 2 horas.",
    bestWindow: "Almoço ou jantar, conforme funcionamento confirmado.",
    access: "Rua dos Bem-Te-Vis, em área central caminhável.",
    checks: [
      "Confirme funcionamento, reserva e menu no dia.",
      "Preparos e disponibilidade podem variar.",
    ],
    sources: [],
    reviewedAt,
  },
  "aprecie-restaurante": {
    goodFor: "Jantar contemporâneo ou internacional no centro.",
    suggestedDuration: "1 a 2 horas.",
    bestWindow: "Jantar, com reserva quando necessária.",
    access: "Rua dos Bem-Te-Vis, em área central.",
    checks: [
      "Confirme abertura e reserva no mesmo dia.",
      "Consulte menu e restrições alimentares diretamente com o local.",
    ],
    sources: [],
    reviewedAt,
  },
  "el-farolito": {
    goodFor: "Parrilla e carnes numa refeição de grupo.",
    suggestedDuration: "1 a 2 horas.",
    bestWindow: "Jantar ou almoço, conforme horário confirmado.",
    access: "Rua Albacora, próxima ao centro de Pipa.",
    checks: [
      "Confirme funcionamento, reserva e cardápio atual.",
      "Combine preferências de ponto da carne e restrições do grupo.",
    ],
    sources: [],
    reviewedAt,
  },
  "moka-cafes-especiais": {
    goodFor: "Café da manhã, café especial ou uma pausa curta durante o dia.",
    suggestedDuration: "45 a 90 minutos.",
    bestWindow: "Manhã ou meio da tarde, conforme funcionamento confirmado.",
    access: "Rua da Mangaba; consulte a rota a partir do ponto anterior do roteiro.",
    checks: [
      "Confirme horário e opções disponíveis no dia.",
      "Consulte diretamente o local sobre restrições alimentares.",
    ],
    sources: [],
    reviewedAt,
  },
  "caju-cafeteria": {
    goodFor: "Café da manhã, brunch ou pausa combinada com uma necessidade de lavanderia.",
    suggestedDuration: "1 a 2 horas.",
    bestWindow: "Manhã ou começo da tarde, conforme funcionamento confirmado.",
    access: "Rua das Gameleiras, na área central.",
    checks: [
      "Confirme separadamente horário da cafeteria e disponibilidade da lavanderia.",
      "Serviços e cardápio podem mudar; verifique antes de sair.",
    ],
    sources: [],
    reviewedAt,
  },
  "sorveteria-real-de-14": {
    goodFor: "Sobremesa ou pausa curta durante um passeio pelo centro.",
    suggestedDuration: "20 a 45 minutos.",
    bestWindow: "Tarde ou depois de uma refeição.",
    access: "Avenida Baía dos Golfinhos, em trecho central caminhável.",
    checks: [
      "Confirme horário e unidade antes de sair.",
      "Sabores e disponibilidade variam no dia.",
    ],
    sources: [],
    reviewedAt,
  },
  "pipa-beach-club": {
    goodFor: "Refeição ou bebidas próximas à praia central.",
    suggestedDuration: "1 a 3 horas.",
    bestWindow: "Almoço, tarde ou início da noite, conforme funcionamento confirmado.",
    access: "Largo São Sebastião, próximo à orla central.",
    checks: [
      "Confirme horário, reserva, música e regras de consumo no dia.",
      "Não confunda a localização no largo com acesso garantido à faixa de areia na maré alta.",
    ],
    sources: [],
    reviewedAt,
  },
  "lagoa-de-guarairas": {
    goodFor: "Paisagem lagunar, manguezal e pôr do sol na região de Tibau do Sul.",
    suggestedDuration: "2 a 4 horas, incluindo deslocamento.",
    bestWindow: "Fim da tarde para a paisagem, sem garantia de céu aberto.",
    access: "Deslocamento terrestre a partir de Pipa; defina o ponto específico de observação.",
    checks: [
      "Escolha o ponto de acesso antes de sair; a lagoa cobre uma área extensa.",
      "Passeios e serviços devem ser confirmados diretamente com operadores autorizados.",
    ],
    sources: destinationSources,
    reviewedAt,
  },
  "tribus-in-pipa": {
    goodFor: "Bar, refeição casual e uma parada dentro do circuito noturno central.",
    suggestedDuration: "1 a 3 horas.",
    bestWindow: "Noite, conforme programação confirmada.",
    access: "Avenida Baía dos Golfinhos, em área central.",
    checks: [
      "Confirme funcionamento, programação e eventuais cobranças no dia.",
      "Planeje o retorno seguro após a noite.",
    ],
    sources: [],
    reviewedAt,
  },
  bakana: {
    goodFor: "Música e encontro noturno no centro.",
    suggestedDuration: "2 a 4 horas.",
    bestWindow: "Noite, somente após confirmar a programação.",
    access: "Avenida Baía dos Golfinhos, em área central caminhável.",
    checks: [
      "Confirme abertura, evento, ingresso e classificação etária.",
      "Combine transporte e retorno antes de sair.",
    ],
    sources: [],
    reviewedAt,
  },
  "birring-in-paradise": {
    goodFor: "Cervejas artesanais, lanches e uma parada de bar no centro.",
    suggestedDuration: "1 a 3 horas.",
    bestWindow: "Fim da tarde ou noite, conforme funcionamento confirmado.",
    access: "Galeria das Cores, na Avenida Baía dos Golfinhos.",
    checks: [
      "Confirme horário e disponibilidade atual antes de sair.",
      "Se houver consumo de álcool, planeje o retorno sem dirigir.",
    ],
    sources: [],
    reviewedAt,
  },
  "umi-bar": {
    goodFor: "Coquetelaria, gastronomia e música numa noite no centro.",
    suggestedDuration: "1 a 3 horas.",
    bestWindow: "Noite, conforme programação confirmada.",
    access: "Avenida Baía dos Golfinhos, em trecho central.",
    checks: [
      "Confirme abertura, reserva e programação no dia.",
      "Planeje o retorno seguro se houver consumo de álcool.",
    ],
    sources: [],
    reviewedAt,
  },
} satisfies Record<string, PipaPlacePracticalGuide>;

export const PIPA_PLACE_GUIDE_SLUGS = Object.freeze(Object.keys(pipaPlaceGuides));

export function findPipaPlacePracticalGuide(
  placeSlug: string,
): PipaPlacePracticalGuide | undefined {
  return pipaPlaceGuides[placeSlug as keyof typeof pipaPlaceGuides];
}
