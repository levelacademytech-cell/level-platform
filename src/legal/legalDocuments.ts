export const LEGAL_VERSION = '1.0.0'

export type LegalDocumentCode =
  | 'terms'
  | 'privacy'
  | 'thirdParty'

export const LEGAL_DOCUMENTS: Record<
  LegalDocumentCode,
  {
    title: string
    eyebrow: string
    paragraphs: string[]
  }
> = {
  terms: {
    title: 'Termos de Uso da LEVEL ADV',
    eyebrow: 'TERMOS DE USO',
    paragraphs: [
      'A LEVEL ADV Ã© uma plataforma de apoio Ã  rotina profissional jurÃ­dica, com ferramentas de cÃ¡lculo, organizaÃ§Ã£o de casos, documentos, comunicaÃ§Ã£o e geraÃ§Ã£o de materiais.',
      'O usuÃ¡rio Ã© responsÃ¡vel por manter suas credenciais seguras, utilizar a plataforma de forma lÃ­cita e revisar profissionalmente todos os cÃ¡lculos, textos, modelos e documentos antes de utilizÃ¡-los em atendimento, negociaÃ§Ã£o, processo judicial ou procedimento administrativo.',
      'Ferramentas automatizadas, modelos e recursos de inteligÃªncia artificial constituem apoio tecnolÃ³gico e nÃ£o substituem a anÃ¡lise jurÃ­dica, contÃ¡bil, pericial ou profissional do advogado responsÃ¡vel pelo caso.',
      'Ã‰ vedado utilizar a plataforma para armazenar ou compartilhar conteÃºdo ilÃ­cito, violar sigilo profissional, direitos de terceiros ou inserir dados sem fundamento jurÃ­dico adequado.',
      'Documentos e modelos criados na plataforma podem ser editados pelo usuÃ¡rio. O usuÃ¡rio Ã© responsÃ¡vel pela adequaÃ§Ã£o final do conteÃºdo ao caso concreto e Ã  legislaÃ§Ã£o aplicÃ¡vel.',
      'A LEVEL ADV poderÃ¡ atualizar funcionalidades, medidas de seguranÃ§a e estes Termos. Quando uma nova versÃ£o exigir nova manifestaÃ§Ã£o do usuÃ¡rio, a plataforma poderÃ¡ solicitar novo aceite antes da continuidade do uso.',
    ],
  },

  privacy: {
    title: 'PolÃ­tica de Privacidade e Aviso LGPD',
    eyebrow: 'PRIVACIDADE E LGPD',
    paragraphs: [
      'A LEVEL ADV trata dados necessÃ¡rios Ã  criaÃ§Ã£o e manutenÃ§Ã£o da conta, autenticaÃ§Ã£o, seguranÃ§a, funcionamento das ferramentas, suporte, registro de atividades e armazenamento dos conteÃºdos enviados pelo usuÃ¡rio.',
      'Podem ser tratados dados cadastrais, dados de acesso, preferÃªncias, registros de aceite, documentos e informaÃ§Ãµes inseridas pelo prÃ³prio usuÃ¡rio. Arquivos de clientes, partes e terceiros podem conter dados pessoais e, conforme o caso, dados pessoais sensÃ­veis.',
      'O tratamento nÃ£o depende necessariamente de consentimento em todas as situaÃ§Ãµes. SerÃ£o utilizadas as bases legais adequadas a cada finalidade, como execuÃ§Ã£o de contrato, cumprimento de obrigaÃ§Ã£o legal, exercÃ­cio regular de direitos, legÃ­timo interesse quando cabÃ­vel e consentimento quando efetivamente exigido.',
      'O acesso aos dados deve observar necessidade, finalidade, seguranÃ§a e sigilo. Provedores de infraestrutura e serviÃ§os tecnolÃ³gicos poderÃ£o processar dados estritamente para viabilizar a plataforma, conforme contratos e medidas de proteÃ§Ã£o aplicÃ¡veis.',
      'Os dados serÃ£o mantidos pelo perÃ­odo necessÃ¡rio ao atendimento das finalidades, obrigaÃ§Ãµes legais, exercÃ­cio de direitos e polÃ­ticas de retenÃ§Ã£o da instalaÃ§Ã£o. SolicitaÃ§Ãµes relacionadas a acesso, correÃ§Ã£o, exclusÃ£o, oposiÃ§Ã£o ou outras prerrogativas poderÃ£o ser encaminhadas ao responsÃ¡vel pela instalaÃ§Ã£o LEVEL ADV.',
      'O aceite desta polÃ­tica representa ciÃªncia das informaÃ§Ãµes apresentadas e nÃ£o constitui autorizaÃ§Ã£o genÃ©rica para qualquer tratamento de dados.',
    ],
  },

  thirdParty: {
    title: 'DeclaraÃ§Ã£o sobre Dados e Documentos de Terceiros',
    eyebrow: 'DECLARAÃ‡ÃƒO DO USUÃRIO',
    paragraphs: [
      'Ao inserir dados, documentos ou informaÃ§Ãµes de clientes, partes, testemunhas, empregados, instituiÃ§Ãµes ou outros terceiros, o usuÃ¡rio declara que sua utilizaÃ§Ã£o possui fundamento jurÃ­dico adequado e estÃ¡ relacionada Ã  atividade profissional legÃ­tima.',
      'O usuÃ¡rio deve observar o sigilo profissional, limitar o conteÃºdo ao necessÃ¡rio para a finalidade jurÃ­dica e evitar o envio de informaÃ§Ãµes excessivas, irrelevantes ou obtidas de forma ilÃ­cita.',
      'Quando o documento contiver dados pessoais sensÃ­veis ou informaÃ§Ãµes protegidas por dever de confidencialidade, o usuÃ¡rio deverÃ¡ adotar cautelas adicionais e restringir o compartilhamento aos profissionais que efetivamente necessitem de acesso.',
      'A utilizaÃ§Ã£o das ferramentas da LEVEL ADV nÃ£o transfere para a plataforma a responsabilidade profissional do advogado pela legitimidade, pertinÃªncia e utilizaÃ§Ã£o dos dados inseridos em seus casos e documentos.',
    ],
  },
}