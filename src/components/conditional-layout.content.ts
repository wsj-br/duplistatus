import { t, type Dictionary } from 'intlayer';

export default {
  key: 'conditional-layout',
  content: {
    footerDisclaimer: t({
      en: 'Product names and icons belong to their respective owners and are used for identification purposes only.',
      de: 'Produktnamen und Symbole gehören ihren jeweiligen Eigentümern und werden nur zu Identifikationszwecken verwendet.',
      fr: 'Les noms de produits et les icônes appartiennent à leurs propriétaires respectifs et sont utilisés uniquement à des fins d\'identification.',
      es: 'Los nombres de productos e iconos pertenecen a sus respectivos propietarios y se utilizan únicamente con fines de identificación.',
      'pt-BR': 'Nomes de produtos e ícones pertencem aos seus respectivos proprietários e são usados apenas para fins de identificação.',
    }),
  },
} satisfies Dictionary;
