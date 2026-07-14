import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  Globe2,
  Handshake,
  Layers3,
  MapPin,
  Megaphone,
  MessageCircle,
  Palette,
  Phone,
  Radio,
  Send,
  ShieldCheck,
  WalletCards,
} from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { apiRequest } from '../../../lib/apiClient'
import { BrandLogo } from '../../../shared/brand/BrandLogo'
import './LandingPage.css'

type ChannelFamilyId = 'digital' | 'terrain' | 'media' | 'partenariats'

type ChannelRow = {
  channel: string
  description: string
  asset: string
}

type LandingPublicContent = {
  page: {
    title: string
    brandName: string
    slogan: string | null
    baseline: string | null
  }
  sections: Array<{
    sectionKey: string
    eyebrow: string | null
    title: string
    subtitle: string | null
    body: string | null
    ctaLabel: string | null
    ctaHref: string | null
    secondaryCtaLabel: string | null
    secondaryCtaHref: string | null
  }>
  pricingPackages: Array<{
    id: number
    name: string
    price: string
    priceSuffix: string | null
    badge: string | null
    features: string[]
    isPopular: boolean
    isEnabled: boolean
  }>
  contact: {
    phone: string | null
    whatsapp: string | null
    email: string | null
    address: string | null
    openingHours: string | null
  } | null
}

const channelFamilies: Array<{
  id: ChannelFamilyId
  label: string
  title: string
  rows: ChannelRow[]
}> = [
  {
    id: 'digital',
    label: 'Digitaux',
    title: 'Canaux digitaux',
    rows: [
      {
        channel: 'Plateforme TOP TEASER',
        description: 'Publication et diffusion structurée des annonces.',
        asset: 'Point d’entrée propriétaire',
      },
      {
        channel: 'WhatsApp Business',
        description: 'Campagnes directes, relances et conversations qualifiées.',
        asset: 'Très forte proximité',
      },
      {
        channel: 'Facebook & Instagram',
        description: 'Visibilité sociale, sponsorisation et engagement communautaire.',
        asset: 'Audience massive',
      },
      {
        channel: 'TikTok',
        description: 'Formats courts, tendances et contenus à fort potentiel viral.',
        asset: 'Impact générationnel',
      },
      {
        channel: 'LinkedIn',
        description: 'Communication B2B, marque employeur et annonces corporate.',
        asset: 'Crédibilité professionnelle',
      },
      {
        channel: 'Google SEO/SEA',
        description: 'Référencement naturel et campagnes de recherche ciblées.',
        asset: 'Intention forte',
      },
      {
        channel: 'YouTube',
        description: 'Diffusion vidéo, pré-roll, contenus pédagogiques et teasing.',
        asset: 'Mémorisation vidéo',
      },
      {
        channel: 'E-mailing & SMS Pro',
        description: 'Messages transactionnels, promotionnels et campagnes segmentées.',
        asset: 'Mesure directe',
      },
      {
        channel: 'Influenceurs digitaux',
        description: 'Amplification par créateurs locaux et communautés ciblées.',
        asset: 'Preuve sociale',
      },
    ],
  },
  {
    id: 'terrain',
    label: 'Terrain',
    title: 'Activation terrain',
    rows: [
      {
        channel: 'Affichage urbain',
        description: 'Présence dans les zones à fort trafic et points stratégiques.',
        asset: 'Visibilité locale',
      },
      {
        channel: 'PLV',
        description: 'Supports de vente et signalétique pour points de contact.',
        asset: 'Décision d’achat',
      },
      {
        channel: 'Flyers',
        description: 'Distribution ciblée dans les zones pertinentes.',
        asset: 'Contact direct',
      },
      {
        channel: 'Street marketing',
        description: 'Dispositifs d’animation et d’interaction avec le public.',
        asset: 'Expérience vivante',
      },
      {
        channel: 'Caravanes publicitaires',
        description: 'Déploiement mobile pour toucher plusieurs communes.',
        asset: 'Couverture étendue',
      },
      {
        channel: 'Habillage véhicules',
        description: 'Véhicules brandés pour visibilité continue en circulation.',
        asset: 'Mobilité permanente',
      },
      {
        channel: 'Roadshows & salons',
        description: 'Présence organisée lors d’événements, foires et rencontres.',
        asset: 'Prospection qualifiée',
      },
    ],
  },
  {
    id: 'media',
    label: 'Médias',
    title: 'Médias & écrans',
    rows: [
      {
        channel: 'Radio',
        description: 'Spots, annonces et partenariats antenne.',
        asset: 'Portée populaire',
      },
      {
        channel: 'Télévision',
        description: 'Visibilité premium via spots et formats sponsorisés.',
        asset: 'Notoriété forte',
      },
      {
        channel: 'Presse écrite & en ligne',
        description: 'Articles, publi-reportages et annonces ciblées.',
        asset: 'Crédibilité éditoriale',
      },
      {
        channel: 'Cinéma & écrans publics',
        description: 'Diffusion sur écrans captifs et lieux d’attente.',
        asset: 'Attention disponible',
      },
      {
        channel: 'Web TV & radios en ligne',
        description: 'Formats audiovisuels distribués sur canaux connectés.',
        asset: 'Audience numérique',
      },
    ],
  },
  {
    id: 'partenariats',
    label: 'Partenariats',
    title: 'Réseaux & alliances',
    rows: [
      {
        channel: 'Écosystème BWAN',
        description: 'Activation des relais et plateformes BWAN TECHNOLOGIES.',
        asset: 'Synergie interne',
      },
      {
        channel: 'Partenariats événementiels',
        description: 'Présence de marque sur événements pertinents.',
        asset: 'Moment fort',
      },
      {
        channel: 'Partenariats institutionnels',
        description: 'Relations avec structures publiques, privées et organisations.',
        asset: 'Légitimité accrue',
      },
      {
        channel: 'Réseaux commerçants & GIE',
        description: 'Diffusion par groupements et réseaux de proximité.',
        asset: 'Maillage terrain',
      },
      {
        channel: 'Co-branding',
        description: 'Opérations conjointes avec marques complémentaires.',
        asset: 'Audience partagée',
      },
      {
        channel: 'Apporteurs d’affaires',
        description: 'Réseau de recommandation et génération d’opportunités.',
        asset: 'Acquisition agile',
      },
    ],
  },
]

const whyCards = [
  {
    title: 'Guichet unique',
    text: 'Un seul interlocuteur pour orchestrer vos campagnes de bout en bout.',
    icon: Layers3,
  },
  {
    title: 'Couverture 360°',
    text: 'Digital, terrain, médias et partenariats coordonnés dans un même plan.',
    icon: Globe2,
  },
  {
    title: 'Ancrage local',
    text: 'Une lecture concrète du marché ivoirien, des communes et des usages.',
    icon: MapPin,
  },
  {
    title: 'Production intégrée',
    text: 'Création, contenus, visuels, audio et vidéo sans dispersion inutile.',
    icon: Palette,
  },
  {
    title: 'Tarifs transparents',
    text: 'Des packages lisibles, évolutifs et adaptés à votre niveau d’ambition.',
    icon: FileText,
  },
  {
    title: 'Résultats mesurés',
    text: 'Suivi, reporting et indicateurs pour améliorer chaque campagne.',
    icon: BarChart3,
  },
]

const productions = [
  'Identité visuelle',
  'Création graphique',
  'Production vidéo',
  'Production audio',
  'Copywriting',
  'Photographie produit',
  'Community management',
  'Stratégie & médiaplanning',
]

const packages = [
  {
    name: 'Start',
    price: '100 000 FCFA',
    suffix: '/mois',
    highlight: false,
    features: [
      'Fiche annonceur',
      '4 publications/mois',
      '1 campagne WhatsApp',
      '1 visuel',
      'Reporting simplifié',
    ],
  },
  {
    name: 'Boost',
    price: '250 000 FCFA',
    suffix: '/mois',
    highlight: true,
    badge: 'Populaire',
    features: [
      'Tout Start',
      '12 publications',
      'Ads FB/Insta',
      '2 vidéos courtes',
      'WhatsApp + SMS',
      'Community management 2 pages',
      'Reporting détaillé',
    ],
  },
  {
    name: 'Premium',
    price: '450 000 FCFA',
    suffix: '/mois',
    highlight: false,
    features: [
      'Tout Boost',
      'Présence terrain',
      'Spot radio',
      'Vidéo pro',
      'Stratégie dédiée',
      'Écosystème partenaires',
      'Community management 3 pages + influenceurs',
    ],
  },
  {
    name: 'Institutionnel',
    price: 'Sur devis',
    suffix: '',
    highlight: false,
    features: [
      'Dispositif 360°',
      'Campagnes nationales',
      'Caravanes',
      'Partenariats institutionnels',
      'Production illimitée',
      'Chef de projet dédié',
    ],
  },
]

const steps = [
  'Contact',
  'Tarifs',
  'Package',
  'Brief',
  'Production',
  'Diffusion',
  'Reporting',
]

const paymentMethods = [
  'Cartes bancaires',
  'Orange Money',
  'MTN MoMo',
  'Moov Money',
  'Wave',
  'Virement',
  'Espèces',
]

export function LandingPage() {
  const [activeFamily, setActiveFamily] = useState<ChannelFamilyId>('digital')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [landingContent, setLandingContent] = useState<LandingPublicContent | null>(null)
  const currentFamily = useMemo(
    () => channelFamilies.find((family) => family.id === activeFamily)!,
    [activeFamily],
  )
  const landingSection = createSectionLookup(landingContent)
  const heroSection = landingSection('hero')
  const whySection = landingSection('why')
  const channelsSection = landingSection('channels')
  const productionSection = landingSection('production')
  const pricingSection = landingSection('pricing')
  const methodSection = landingSection('method')
  const ctaSection = landingSection('cta')
  const contactSection = landingSection('contact')
  const displayPackages =
    landingContent?.pricingPackages
      .filter((item) => item.isEnabled)
      .map((item) => ({
        name: item.name,
        price: item.price,
        suffix: item.priceSuffix ?? '',
        highlight: item.isPopular,
        badge: item.badge ?? undefined,
        features: item.features,
      })) ?? packages
  const contactPhone =
    landingContent?.contact?.whatsapp ??
    landingContent?.contact?.phone ??
    '[À COMPLÉTER]'
  const contactEmail = landingContent?.contact?.email ?? '[À COMPLÉTER]'
  const contactAddress = landingContent?.contact?.address ?? 'Abidjan, Côte d’Ivoire'
  const contactHours = landingContent?.contact?.openingHours ?? 'Lun-Sam 8h-18h'

  useEffect(() => {
    let isMounted = true

    apiRequest<{ data: LandingPublicContent }>('/api/landing')
      .then((response) => {
        if (isMounted) {
          setLandingContent(response.data)
        }
      })
      .catch(() => {
        if (isMounted) {
          setLandingContent(null)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitted(true)
  }

  return (
    <main className="landing-page">
      <header className="landing-nav">
        <a className="landing-brand" href="#hero" aria-label="TOP TEASER">
          <BrandLogo className="landing-logo" />
        </a>
        <nav aria-label="Navigation principale">
          <a href="#pourquoi">Pourquoi nous</a>
          <a href="#canaux">Canaux</a>
          <a href="#production">Production</a>
          <a href="#tarifs">Tarifs</a>
          <a href="#methode">Méthode</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="landing-nav-actions">
          <a className="landing-btn ghost" href="#tarifs">
            Voir nos tarifs
          </a>
          <a className="landing-btn primary" href="#contact">
            Travailler avec nous
          </a>
        </div>
      </header>

      <section className="landing-hero" id="hero">
        <div className="landing-hero-bg" aria-hidden="true">
          <img src="/brand/logo-top-teaser.png" alt="" />
        </div>
        <div className="landing-container hero-grid">
          <div className="hero-copy">
            <p className="landing-eyebrow">
              {heroSection?.eyebrow ?? 'La référence communication · Côte d’Ivoire'}
            </p>
            <h1>{heroSection?.title ?? 'Donnez de la voix à votre marque.'}</h1>
            <div className="animated-slogan" aria-label="Exposez. Valorisez. Développez.">
              <span>Exposez.</span>
              <span>Valorisez.</span>
              <span>Développez.</span>
            </div>
            <p className="hero-intro">
              {heroSection?.body ??
                landingContent?.page.baseline ??
                'La référence en Côte d’Ivoire pour la communication, la promotion et la diffusion d’annonces professionnelles, commerciales et de services.'}
            </p>
            <div className="hero-actions">
              <a className="landing-btn primary large" href={heroSection?.ctaHref ?? '#contact'}>
                {heroSection?.ctaLabel ?? 'Lancer ma campagne'} <ArrowRight size={18} />
              </a>
              <a
                className="landing-btn secondary large"
                href={heroSection?.secondaryCtaHref ?? '#canaux'}
              >
                {heroSection?.secondaryCtaLabel ?? 'Découvrir nos canaux'}
              </a>
            </div>
            <div className="hero-stats">
              <strong>4</strong>
              <span>familles de canaux</span>
              <strong>20+</strong>
              <span>canaux</span>
              <strong>1</strong>
              <span>guichet unique</span>
            </div>
          </div>
          <div className="hero-panel" aria-label="Vue synthétique des canaux">
            <div className="hero-panel-top">
              <span>Plan de diffusion</span>
              <BadgeCheck size={20} />
            </div>
            <div className="orbit-card digital">
              <Globe2 size={18} />
              Digitaux
            </div>
            <div className="orbit-card terrain">
              <MapPin size={18} />
              Terrain
            </div>
            <div className="orbit-card media">
              <Radio size={18} />
              Médias
            </div>
            <div className="orbit-card partners">
              <Handshake size={18} />
              Partenariats
            </div>
            <div className="hero-panel-core">
              <Megaphone size={28} />
              <strong>TOP TEASER</strong>
              <span>Régie multicanal</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section cream" id="pourquoi">
        <div className="landing-container">
          <div className="section-heading">
            <p className="landing-eyebrow">
              {whySection?.eyebrow ?? 'Pourquoi TOP TEASER'}
            </p>
            <h2>{whySection?.title ?? 'Une régie, tous vos canaux'}</h2>
          </div>
          <div className="why-grid">
            {whyCards.map(({ icon: Icon, text, title }) => (
              <article className="why-card" key={title}>
                <Icon size={22} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section dark" id="canaux">
        <div className="landing-container">
          <div className="section-heading split">
            <div>
              <p className="landing-eyebrow">Nos canaux de diffusion</p>
              <h2>{channelsSection?.title ?? 'Chaque audience a son point de contact.'}</h2>
            </div>
            <p>
              {channelsSection?.subtitle ??
                'Nous combinons les canaux selon votre cible, votre budget, votre localisation et votre objectif de visibilité.'}
            </p>
          </div>
          <div className="channel-tabs" role="tablist" aria-label="Familles de canaux">
            {channelFamilies.map((family) => (
              <button
                aria-selected={activeFamily === family.id}
                className={activeFamily === family.id ? 'active' : ''}
                key={family.id}
                onClick={() => setActiveFamily(family.id)}
                role="tab"
                type="button"
              >
                {family.label}
              </button>
            ))}
          </div>
          <div className="channel-table-wrap">
            <div className="channel-table-title">
              <h3>{currentFamily.title}</h3>
              <span>{currentFamily.rows.length} canaux</span>
            </div>
            <div className="channel-table" role="table">
              <div className="channel-table-head" role="row">
                <span>Canal</span>
                <span>Description</span>
                <span>Atout</span>
              </div>
              {currentFamily.rows.map((row) => (
                <div className="channel-table-row" key={row.channel} role="row">
                  <strong>{row.channel}</strong>
                  <span>{row.description}</span>
                  <em>{row.asset}</em>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section cream" id="production">
        <div className="landing-container production-grid">
          <div className="section-heading">
            <p className="landing-eyebrow">Production de contenus</p>
            <h2>{productionSection?.title ?? 'On crée ce qui fait la différence'}</h2>
            <p>
              {productionSection?.subtitle ??
                'Une campagne fonctionne mieux quand le message, le support et la diffusion avancent ensemble.'}
            </p>
          </div>
          <div className="production-list">
            {productions.map((item, index) => (
              <article className="production-item" key={item}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{item}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section pricing-section" id="tarifs">
        <div className="landing-container">
          <div className="section-heading centered">
            <p className="landing-eyebrow">Packages / Tarifs</p>
            <h2>{pricingSection?.title ?? 'Choisissez votre ambition'}</h2>
            <p>
              {pricingSection?.subtitle ??
                'Des offres lisibles pour lancer, accélérer ou déployer une campagne complète.'}
            </p>
          </div>
          <div className="pricing-grid">
            {displayPackages.map((item) => (
              <article
                className={`pricing-card ${item.highlight ? 'popular' : ''}`}
                key={item.name}
              >
                {item.badge ? <span className="pricing-badge">★ {item.badge}</span> : null}
                <h3>{item.name}</h3>
                <div className="pricing-price">
                  <strong>{item.price}</strong>
                  {item.suffix ? <span>{item.suffix}</span> : null}
                </div>
                <ul>
                  {item.features.map((feature) => (
                    <li key={feature}>
                      <CheckCircle2 size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a className="landing-btn pricing" href="#contact">
                  Choisir ce package
                </a>
              </article>
            ))}
          </div>
          <p className="pricing-note">
            {pricingSection?.body ??
              'Note : achat d’espace média facturé en sus, montants en FCFA HT.'}
          </p>
        </div>
      </section>

      <section className="landing-section dark method-section" id="methode">
        <div className="landing-container">
          <div className="section-heading centered">
            <p className="landing-eyebrow">Méthode</p>
            <h2>{methodSection?.title ?? 'Du contact à la performance'}</h2>
          </div>
          <div className="method-track">
            {steps.map((step, index) => (
              <div className="method-step" key={step}>
                <span>{index + 1}</span>
                <strong>{step}</strong>
                {index < steps.length - 1 ? <ChevronRight size={16} /> : null}
              </div>
            ))}
          </div>
          <div className="payment-panel">
            <div>
              <WalletCards size={22} />
              <h3>Moyens de paiement</h3>
            </div>
            <div className="payment-list">
              {paymentMethods.map((method) => (
                <span key={method}>
                  <CreditCard size={14} />
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="landing-container cta-inner">
          <div>
            <p className="landing-eyebrow">Prêt à passer à l’action ?</p>
            <h2>{ctaSection?.title ?? 'Votre marque mérite d’être vue'}</h2>
            <p>
              {ctaSection?.body ??
                'Transformons votre objectif de visibilité en dispositif concret, mesurable et adapté au terrain ivoirien.'}
            </p>
          </div>
          <div className="hero-actions">
            <a className="landing-btn primary large" href={ctaSection?.ctaHref ?? '#contact'}>
              {ctaSection?.ctaLabel ?? 'Demander un devis gratuit'}
            </a>
            <a
              className="landing-btn secondary large"
              href={ctaSection?.secondaryCtaHref ?? '#tarifs'}
            >
              {ctaSection?.secondaryCtaLabel ?? 'Comparer les packages'}
            </a>
          </div>
        </div>
      </section>

      <section className="landing-section cream contact-section" id="contact">
        <div className="landing-container contact-grid">
          <div>
            <p className="landing-eyebrow">Contact</p>
            <h2>{contactSection?.title ?? 'Travaillons ensemble'}</h2>
            <p>
              {contactSection?.subtitle ??
                'Parlez-nous de votre activité, de votre cible et de votre objectif. Nous vous orientons vers le dispositif le plus pertinent.'}
            </p>
            <div className="contact-cards">
              <div>
                <Phone size={18} />
                <span>Téléphone / WhatsApp</span>
                <strong>{contactPhone}</strong>
              </div>
              <div>
                <Send size={18} />
                <span>E-mail</span>
                <strong>{contactEmail}</strong>
              </div>
              <div>
                <Building2 size={18} />
                <span>Adresse</span>
                <strong>{contactAddress}</strong>
              </div>
              <div>
                <ShieldCheck size={18} />
                <span>Horaires</span>
                <strong>{contactHours}</strong>
              </div>
            </div>
          </div>
          <form className="landing-form" onSubmit={handleContactSubmit}>
            {isSubmitted ? (
              <div className="landing-success">
                Message préparé. Le formulaire sera connecté à votre service de
                réception e-mail ou WhatsApp avant la mise en ligne.
              </div>
            ) : null}
            <label>
              <span>Nom / Entreprise*</span>
              <input required name="name" placeholder="Votre entreprise" />
            </label>
            <label>
              <span>Téléphone*</span>
              <input required name="phone" placeholder="+225 ..." />
            </label>
            <label>
              <span>E-mail</span>
              <input name="email" placeholder="contact@entreprise.com" type="email" />
            </label>
            <label>
              <span>Package intéressé</span>
              <select name="package" defaultValue="">
                <option value="" disabled>
                  Sélectionner un package
                </option>
                <option>Start</option>
                <option>Boost</option>
                <option>Premium</option>
                <option>Institutionnel</option>
              </select>
            </label>
            <label>
              <span>Votre projet</span>
              <textarea
                name="project"
                placeholder="Décrivez votre besoin, votre cible, votre zone et votre délai."
                rows={5}
              />
            </label>
            <button className="landing-btn primary large" type="submit">
              Envoyer ma demande <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container footer-grid">
          <div>
            <BrandLogo className="landing-logo footer-logo" />
            <p>
              TOP TEASER est une régie de communication multicanal éditée par
              BWAN TECHNOLOGIES, basée à Abidjan, Côte d’Ivoire.
            </p>
          </div>
          <div>
            <h3>Navigation</h3>
            <a href="#pourquoi">Pourquoi nous</a>
            <a href="#canaux">Canaux</a>
            <a href="#production">Production</a>
            <a href="#methode">Méthode</a>
          </div>
          <div>
            <h3>Packages</h3>
            <a href="#tarifs">Start</a>
            <a href="#tarifs">Boost</a>
            <a href="#tarifs">Premium</a>
            <a href="#tarifs">Institutionnel</a>
          </div>
          <div>
            <h3>Contact</h3>
            <a href="#contact">Téléphone : {contactPhone}</a>
            <a href="#contact">E-mail : {contactEmail}</a>
            <a href="#contact">{contactAddress}</a>
          </div>
        </div>
        <div className="landing-container footer-bottom">
          <span>© 2026 {landingContent?.page.brandName ?? 'TOP TEASER'}</span>
          <strong>{landingContent?.page.slogan ?? 'Exposez. Valorisez. Développez.'}</strong>
        </div>
      </footer>

      <a className="floating-whatsapp" href="#contact" aria-label="Contacter TOP TEASER">
        <MessageCircle size={24} />
      </a>
    </main>
  )
}

function createSectionLookup(content: LandingPublicContent | null) {
  return (sectionKey: string) =>
    content?.sections.find((section) => section.sectionKey === sectionKey) ?? null
}
