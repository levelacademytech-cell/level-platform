export type ThemePresetId =
  | 'level'
  | 'direito'
  | 'enfermagem'
  | 'medicina'
  | 'kids'
  | 'teens'

export interface ThemePreset {
  id: ThemePresetId
  label: string
  eyebrow: string
  heroTitle: string
  heroSubtitle: string
  emoji: string

  accent: string
  accent2: string
  bg: string
  panel: string
  border: string
  text: string
  muted: string
  heroGradient: string
}

export const themePresets: Record<ThemePresetId, ThemePreset> = {
  level: {
    id: 'level',
    label: 'LEVEL',
    eyebrow: 'LEVEL ACADEMY',
    heroTitle: 'Seu próximo level começa aqui.',
    heroSubtitle:
      'Estudo, carreira, oportunidades e evolução em uma única experiência.',
    emoji: '✦',
    accent: '#7c5cff',
    accent2: '#20d9ff',
    bg: '#080d19',
    panel: 'rgba(13, 22, 41, 0.72)',
    border: 'rgba(130, 160, 255, 0.16)',
    text: '#f7f9ff',
    muted: '#98a7c2',
    heroGradient:
      'linear-gradient(120deg, rgba(124,92,255,.9), rgba(32,217,255,.62))',
  },

  direito: {
    id: 'direito',
    label: 'Direito',
    eyebrow: 'LEVEL • DIREITO',
    heroTitle: 'Conhecimento que sustenta grandes decisões.',
    heroSubtitle:
      'Sua central para estudar, praticar, competir e avançar na carreira jurídica.',
    emoji: '⚖️',
    accent: '#d8b45d',
    accent2: '#5c82ff',
    bg: '#090d15',
    panel: 'rgba(17, 22, 34, 0.77)',
    border: 'rgba(216, 180, 93, 0.18)',
    text: '#fbf8ef',
    muted: '#afa995',
    heroGradient:
      'linear-gradient(120deg, rgba(216,180,93,.82), rgba(57,80,155,.72))',
  },

  enfermagem: {
    id: 'enfermagem',
    label: 'Enfermagem',
    eyebrow: 'LEVEL • ENFERMAGEM',
    heroTitle: 'Cuidar também é evoluir.',
    heroSubtitle:
      'Conteúdo, prática e desafios para transformar conhecimento em cuidado.',
    emoji: '🩺',
    accent: '#20d4c7',
    accent2: '#6c8cff',
    bg: '#061419',
    panel: 'rgba(8, 34, 40, 0.73)',
    border: 'rgba(32, 212, 199, 0.18)',
    text: '#f0fffd',
    muted: '#9abfbd',
    heroGradient:
      'linear-gradient(120deg, rgba(32,212,199,.82), rgba(64,109,255,.74))',
  },

  medicina: {
    id: 'medicina',
    label: 'Medicina',
    eyebrow: 'LEVEL • MEDICINA',
    heroTitle: 'Ciência, prática e evolução.',
    heroSubtitle:
      'Um ambiente inteligente para aprender, revisar e ampliar seu conhecimento.',
    emoji: '🧬',
    accent: '#28b8ff',
    accent2: '#7e65ff',
    bg: '#07111e',
    panel: 'rgba(10, 28, 49, 0.74)',
    border: 'rgba(40, 184, 255, 0.18)',
    text: '#f3faff',
    muted: '#9ab5ca',
    heroGradient:
      'linear-gradient(120deg, rgba(40,184,255,.82), rgba(126,101,255,.74))',
  },

  kids: {
    id: 'kids',
    label: 'LEVEL Kids',
    eyebrow: 'LEVEL KIDS',
    heroTitle: 'Aprender pode virar uma aventura.',
    heroSubtitle:
      'Descubra, jogue, conquiste estrelas e aprenda um pouquinho todos os dias.',
    emoji: '🚀',
    accent: '#ff5ba8',
    accent2: '#32d7ff',
    bg: '#11132c',
    panel: 'rgba(35, 33, 78, 0.72)',
    border: 'rgba(255, 122, 192, 0.20)',
    text: '#fff8fd',
    muted: '#cabce3',
    heroGradient:
      'linear-gradient(120deg, rgba(255,91,168,.9), rgba(50,215,255,.82))',
  },

  teens: {
    id: 'teens',
    label: 'LEVEL Teens',
    eyebrow: 'LEVEL TEENS',
    heroTitle: 'Seu futuro não precisa esperar.',
    heroSubtitle:
      'Estude, dispute desafios, descubra caminhos e construa o seu próximo level.',
    emoji: '⚡',
    accent: '#9a61ff',
    accent2: '#20e6d5',
    bg: '#0c0b1c',
    panel: 'rgba(29, 23, 59, 0.73)',
    border: 'rgba(154, 97, 255, 0.20)',
    text: '#faf8ff',
    muted: '#b8afd2',
    heroGradient:
      'linear-gradient(120deg, rgba(154,97,255,.9), rgba(32,230,213,.72))',
  },
}

export const themePresetList = Object.values(themePresets)