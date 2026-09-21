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
      'A LEVEL ADV é uma plataforma de apoio à rotina profissional jurídica, com ferramentas de cálculo, organização de casos, documentos, comunicação e geração de materiais.',
      'O usuário é responsável por manter suas credenciais seguras, utilizar a plataforma de forma lícita e revisar profissionalmente todos os cálculos, textos, modelos e documentos antes de utilizá-los em atendimento, negociação, processo judicial ou procedimento administrativo.',
      'Ferramentas automatizadas, modelos e recursos de inteligência artificial constituem apoio tecnológico e não substituem a análise jurídica, contábil, pericial ou profissional do advogado responsável pelo caso.',
      'É vedado utilizar a plataforma para armazenar ou compartilhar conteúdo ilícito, violar sigilo profissional, direitos de terceiros ou inserir dados sem fundamento jurídico adequado.',
      'Documentos e modelos criados na plataforma podem ser editados pelo usuário. O usuário é responsável pela adequação final do conteúdo ao caso concreto e à legislação aplicável.',
      'A LEVEL ADV poderá atualizar funcionalidades, medidas de segurança e estes Termos. Quando uma nova versão exigir nova manifestação do usuário, a plataforma poderá solicitar novo aceite antes da continuidade do uso.',
    ],
  },

  privacy: {
    title: 'Política de Privacidade e Aviso LGPD',
    eyebrow: 'PRIVACIDADE E LGPD',
    paragraphs: [
      'A LEVEL ADV trata dados necessários à criação e manutenção da conta, autenticação, segurança, funcionamento das ferramentas, suporte, registro de atividades e armazenamento dos conteúdos enviados pelo usuário.',
      'Podem ser tratados dados cadastrais, dados de acesso, preferências, registros de aceite, documentos e informações inseridas pelo próprio usuário. Arquivos de clientes, partes e terceiros podem conter dados pessoais e, conforme o caso, dados pessoais sensíveis.',
      'O tratamento não depende necessariamente de consentimento em todas as situações. Serão utilizadas as bases legais adequadas a cada finalidade, como execução de contrato, cumprimento de obrigação legal, exercício regular de direitos, legítimo interesse quando cabível e consentimento quando efetivamente exigido.',
      'O acesso aos dados deve observar necessidade, finalidade, segurança e sigilo. Provedores de infraestrutura e serviços tecnológicos poderão processar dados estritamente para viabilizar a plataforma, conforme contratos e medidas de proteção aplicáveis.',
      'Os dados serão mantidos pelo período necessário ao atendimento das finalidades, obrigações legais, exercício de direitos e políticas de retenção da instalação. Solicitações relacionadas a acesso, correção, exclusão, oposição ou outras prerrogativas poderão ser encaminhadas ao responsável pela instalação LEVEL ADV.',
      'O aceite desta política representa ciência das informações apresentadas e não constitui autorização genérica para qualquer tratamento de dados.',
    ],
  },

  thirdParty: {
    title: 'Declaração sobre Dados e Documentos de Terceiros',
    eyebrow: 'DECLARAÇÃO DO USUÁRIO',
    paragraphs: [
      'Ao inserir dados, documentos ou informações de clientes, partes, testemunhas, empregados, instituições ou outros terceiros, o usuário declara que sua utilização possui fundamento jurídico adequado e está relacionada à atividade profissional legítima.',
      'O usuário deve observar o sigilo profissional, limitar o conteúdo ao necessário para a finalidade jurídica e evitar o envio de informações excessivas, irrelevantes ou obtidas de forma ilícita.',
      'Quando o documento contiver dados pessoais sensíveis ou informações protegidas por dever de confidencialidade, o usuário deverá adotar cautelas adicionais e restringir o compartilhamento aos profissionais que efetivamente necessitem de acesso.',
      'A utilização das ferramentas da LEVEL ADV não transfere para a plataforma a responsabilidade profissional do advogado pela legitimidade, pertinência e utilização dos dados inseridos em seus casos e documentos.',
    ],
  },
}