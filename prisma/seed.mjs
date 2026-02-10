/**
 * Prisma seed script for Ballast Point Marketplace
 *
 * Populates the database with realistic Australian provider + service data.
 *
 * Notes:
 * - `UserProfile.id` is intended to match Supabase `auth.users.id`. This script
 *   creates UUIDs directly in the app DB for demo/test purposes.
 * - All availability timezones default to AEDT/AEST via `Australia/Sydney`.
 */

import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import {
  PrismaClient,
  BundlePricingType,
  DeliveryMode,
  TeamRole,
  TemplateKey,
} from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_TZ = 'Australia/Sydney';
const UNSPLASH_IMAGE_PARAMS = 'auto=format&fit=crop&w=1800&q=80';

function unsplashImage(photoId) {
  return `https://images.unsplash.com/photo-${photoId}?${UNSPLASH_IMAGE_PARAMS}`;
}

const PROVIDER_IMAGE_URLS_BY_SLUG = {
  'harbour-atelier-architects': [
    unsplashImage('1487958449943-2429e8be8625'),
    unsplashImage('1493397212122-2b85dda8106b'),
    unsplashImage('1486406146926-c627a92ad1ab'),
  ],
  'laneway-studio-architecture': [
    unsplashImage('1479839672679-a46483c0e7c8'),
    unsplashImage('1518005020951-eccb494ad742'),
    unsplashImage('1460574283810-2aab119d8511'),
  ],
  'subtropic-design-co': [
    unsplashImage('1431576901776-e539bd916ba2'),
    unsplashImage('1527576539890-dfa815648363'),
    unsplashImage('1766802981813-e532002dfc22'),
  ],
  'coastal-craft-architects': [
    unsplashImage('1451976426598-a7593bd6d0b2'),
    unsplashImage('1551038247-3d9af20df552'),
    unsplashImage('1525286335722-c30c6b5df541'),
  ],
  'terrace-timber-studio': [
    unsplashImage('1488972685288-c3fd157d7c7a'),
    unsplashImage('1560924288-1f65d09c730f'),
    unsplashImage('1486406146926-c627a92ad1ab'),
  ],
};

const SERVICE_IMAGE_URLS_BY_TEMPLATE = {
  [TemplateKey.CONSULTATION]: [
    unsplashImage('1560924288-1f65d09c730f'),
    unsplashImage('1488972685288-c3fd157d7c7a'),
    unsplashImage('1486406146926-c627a92ad1ab'),
  ],
  [TemplateKey.FEASIBILITY]: [
    unsplashImage('1493397212122-2b85dda8106b'),
    unsplashImage('1479839672679-a46483c0e7c8'),
    unsplashImage('1525286335722-c30c6b5df541'),
  ],
  [TemplateKey.CONCEPT_DESIGN]: [
    unsplashImage('1487958449943-2429e8be8625'),
    unsplashImage('1527576539890-dfa815648363'),
    unsplashImage('1766802981813-e532002dfc22'),
  ],
  [TemplateKey.PLANNING_APPROVALS]: [
    unsplashImage('1518005020951-eccb494ad742'),
    unsplashImage('1551038247-3d9af20df552'),
    unsplashImage('1460574283810-2aab119d8511'),
  ],
  [TemplateKey.REVIEW]: [
    unsplashImage('1451976426598-a7593bd6d0b2'),
    unsplashImage('1486406146926-c627a92ad1ab'),
    unsplashImage('1488972685288-c3fd157d7c7a'),
  ],
};

function aud(audDollars) {
  return Math.round(audDollars * 100);
}

function uuid() {
  return randomUUID();
}

function rotateImages(images, seedText) {
  if (!images || images.length === 0) {
    return [];
  }

  const seed = [...seedText].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const start = seed % images.length;

  return Array.from({ length: Math.min(images.length, 3) }, (_, index) => {
    return images[(start + index) % images.length];
  });
}

function getProviderSeedImages(provider) {
  if (provider.imageUrls && provider.imageUrls.length > 0) {
    return provider.imageUrls;
  }

  const mappedImages = PROVIDER_IMAGE_URLS_BY_SLUG[provider.slug];
  if (mappedImages && mappedImages.length > 0) {
    return mappedImages;
  }

  return rotateImages(SERVICE_IMAGE_URLS_BY_TEMPLATE[TemplateKey.CONCEPT_DESIGN], provider.slug);
}

function getServiceSeedImages(service) {
  if (service.imageUrls && service.imageUrls.length > 0) {
    return service.imageUrls;
  }

  const templateImages = SERVICE_IMAGE_URLS_BY_TEMPLATE[service.templateKey];
  if (templateImages && templateImages.length > 0) {
    return rotateImages(templateImages, service.slug);
  }

  return rotateImages(SERVICE_IMAGE_URLS_BY_TEMPLATE[TemplateKey.CONSULTATION], service.slug);
}

async function upsertUserProfile(user) {
  return prisma.userProfile.upsert({
    where: { email: user.email },
    create: {
      id: user.id ?? uuid(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl ?? null,
      timezone: user.timezone ?? DEFAULT_TZ,
    },
    update: {
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl ?? null,
      timezone: user.timezone ?? DEFAULT_TZ,
    },
  });
}

async function ensureProviderWithTeam({ provider, ownerUser }) {
  const owner = await upsertUserProfile(ownerUser);
  const providerImages = getProviderSeedImages(provider);
  const providerLogoUrl = provider.logoUrl ?? providerImages[0] ?? null;

  const providerProfile = await prisma.providerProfile.upsert({
    where: { slug: provider.slug },
    create: {
      name: provider.name,
      slug: provider.slug,
      description: provider.description ?? null,
      logoUrl: providerLogoUrl,
      imageUrls: providerImages,
      team: {
        create: {
          id: uuid(),
        },
      },
    },
    update: {
      name: provider.name,
      description: provider.description ?? null,
      logoUrl: providerLogoUrl,
      imageUrls: providerImages,
    },
  });

  const teamMember = await prisma.teamMember.upsert({
    where: {
      userId_teamId: {
        userId: owner.id,
        teamId: providerProfile.teamId,
      },
    },
    create: {
      role: TeamRole.ADMIN,
      user: { connect: { id: owner.id } },
      team: { connect: { id: providerProfile.teamId } },
    },
    update: {
      role: TeamRole.ADMIN,
    },
  });

  return { owner, providerProfile, teamMember };
}

async function replaceProviderLicensing(providerProfileId, { licenses, serviceAreas, localExperience }) {
  await prisma.$transaction([
    prisma.providerLicense.deleteMany({ where: { providerProfileId } }),
    prisma.providerServiceArea.deleteMany({ where: { providerProfileId } }),
    prisma.providerLocalExperience.deleteMany({ where: { providerProfileId } }),
  ]);

  if (licenses.length > 0) {
    await prisma.providerLicense.createMany({
      data: licenses.map((l) => ({
        id: uuid(),
        providerProfileId,
        country: 'AU',
        jurisdiction: l.jurisdiction,
      })),
      skipDuplicates: true,
    });
  }

  if (serviceAreas.length > 0) {
    await prisma.providerServiceArea.createMany({
      data: serviceAreas.map((a) => ({
        id: uuid(),
        providerProfileId,
        country: 'AU',
        jurisdiction: a.jurisdiction,
        localityName: a.localityName,
        localityType: a.localityType ?? 'council',
      })),
      skipDuplicates: true,
    });
  }

  if (localExperience.length > 0) {
    await prisma.providerLocalExperience.createMany({
      data: localExperience.map((e) => ({
        id: uuid(),
        providerProfileId,
        country: 'AU',
        jurisdiction: e.jurisdiction,
        localityName: e.localityName,
        localityType: e.localityType ?? 'council',
        isActive: true,
      })),
      skipDuplicates: true,
    });
  }
}

async function replaceTeamMemberAvailability(teamMemberId, availabilityBlocks) {
  await prisma.availability.deleteMany({ where: { teamMemberId } });
  await prisma.availability.createMany({
    data: availabilityBlocks.map((b) => ({
      id: uuid(),
      teamMemberId,
      dayOfWeek: b.dayOfWeek,
      startTime: b.startTime,
      endTime: b.endTime,
      timezone: b.timezone ?? DEFAULT_TZ,
      serviceId: b.serviceId ?? null,
    })),
  });
}

async function replaceProviderMarketplace(providerProfileId, { services, bundles }) {
  await prisma.$transaction([
    prisma.serviceAddOn.deleteMany({ where: { service: { providerProfileId } } }),
    prisma.bundleAddOn.deleteMany({ where: { bundle: { providerProfileId } } }),
    prisma.bundleService.deleteMany({ where: { bundle: { providerProfileId } } }),
    prisma.bundle.deleteMany({ where: { providerProfileId } }),
    prisma.service.deleteMany({ where: { providerProfileId } }),
  ]);

  const createdServicesBySlug = new Map();

  for (const service of services) {
    const serviceImages = getServiceSeedImages(service);

    const createdService = await prisma.service.create({
      data: {
        id: uuid(),
        providerProfileId,
        name: service.name,
        slug: service.slug,
        description: service.description,
        imageUrls: serviceImages,
        templateKey: service.templateKey,
        templateData: service.templateData,
        coveragePackageKey: service.coveragePackageKey,
        priceCents: service.priceCents,
        leadTimeDays: service.leadTimeDays,
        turnaroundDays: service.turnaroundDays,
        deliveryMode: service.deliveryMode,
        isPublished: service.isPublished ?? true,
        positioning: service.positioning ?? null,
        assumptions: service.assumptions ?? null,
        clientResponsibilities: service.clientResponsibilities ?? null,
        slotDuration: service.slotDuration,
        slotBuffer: service.slotBuffer,
        advanceBookingMin: service.advanceBookingMin,
        advanceBookingMax: service.advanceBookingMax,
      },
    });

    createdServicesBySlug.set(createdService.slug, createdService);

    if (service.addOns && service.addOns.length > 0) {
      await prisma.serviceAddOn.createMany({
        data: service.addOns.map((a) => ({
          id: uuid(),
          serviceId: createdService.id,
          addOnKey: a.addOnKey,
          priceCents: a.priceCents,
          turnaroundImpactDays: a.turnaroundImpactDays,
        })),
        skipDuplicates: true,
      });
    }
  }

  for (const bundle of bundles) {
    const createdBundle = await prisma.bundle.create({
      data: {
        id: uuid(),
        providerProfileId,
        name: bundle.name,
        slug: bundle.slug,
        description: bundle.description,
        pricingType: bundle.pricingType,
        priceCents: bundle.priceCents ?? 0,
        isPublished: bundle.isPublished ?? true,
        positioning: bundle.positioning ?? null,
      },
    });

    await prisma.bundleService.createMany({
      data: bundle.services.map((s) => {
        const service = createdServicesBySlug.get(s.serviceSlug);
        if (!service) {
          throw new Error(
            `Bundle "${bundle.slug}" references unknown service slug "${s.serviceSlug}"`
          );
        }
        return {
          id: uuid(),
          bundleId: createdBundle.id,
          serviceId: service.id,
          sortOrder: s.sortOrder,
        };
      }),
      skipDuplicates: true,
    });
  }
}

function weekdayAvailability({ start = '09:00', end = '17:00' } = {}) {
  return [
    { dayOfWeek: 1, startTime: start, endTime: end, timezone: DEFAULT_TZ },
    { dayOfWeek: 2, startTime: start, endTime: end, timezone: DEFAULT_TZ },
    { dayOfWeek: 3, startTime: start, endTime: end, timezone: DEFAULT_TZ },
    { dayOfWeek: 4, startTime: start, endTime: end, timezone: DEFAULT_TZ },
    { dayOfWeek: 5, startTime: start, endTime: end, timezone: DEFAULT_TZ },
  ];
}

async function main() {
  const providerSeeds = [
    {
      provider: {
        name: 'Harbour Atelier Architects',
        slug: 'harbour-atelier-architects',
        description:
          'Residential architecture studio focused on thoughtful renovations, compact sites, and council-ready planning packages across Sydney.',
      },
      ownerUser: {
        email: 'amelia.chen@harbouratelier.com.au',
        firstName: 'Amelia',
        lastName: 'Chen',
        timezone: DEFAULT_TZ,
      },
      licensing: {
        licenses: [{ jurisdiction: 'NSW' }, { jurisdiction: 'ACT' }],
        serviceAreas: [
          { jurisdiction: 'NSW', localityName: 'City of Sydney' },
          { jurisdiction: 'NSW', localityName: 'Inner West Council' },
          { jurisdiction: 'NSW', localityName: 'Waverley Council' },
          { jurisdiction: 'NSW', localityName: 'Woollahra Municipal Council' },
          { jurisdiction: 'NSW', localityName: 'North Sydney Council' },
        ],
        localExperience: [
          { jurisdiction: 'NSW', localityName: 'City of Sydney' },
          { jurisdiction: 'NSW', localityName: 'City of Parramatta' },
          { jurisdiction: 'NSW', localityName: 'Randwick City Council' },
        ],
      },
      availability: [
        ...weekdayAvailability({ start: '09:00', end: '17:30' }),
        { dayOfWeek: 6, startTime: '10:00', endTime: '14:00', timezone: DEFAULT_TZ },
      ],
      marketplace: {
        services: [
          {
            name: 'Initial Design Consultation (60 min)',
            slug: 'initial-design-consultation',
            description:
              'A focused 60-minute consult to unpack your brief, budget, and planning pathway. Ideal for renovations and tight inner-city sites.',
            templateKey: TemplateKey.CONSULTATION,
            templateData: {
              duration: '60',
              delivery: 'VIDEO',
              focus: ['RENOVATION_ADVICE', 'PLANNING_PATHWAY', 'BUDGET_STRATEGY'],
              followUp: 'EMAIL_SUMMARY',
              siteContext: 'PHOTOS_MEASUREMENTS',
            },
            coveragePackageKey: 'CONSULTATION_STANDARD',
            priceCents: aud(420),
            leadTimeDays: 2,
            turnaroundDays: 2,
            deliveryMode: DeliveryMode.REMOTE,
            positioning: 'Best for renovation scoping + council pathway clarity.',
            assumptions:
              'Includes one 60-minute session and a short follow-up email. No drawings or submissions.',
            clientResponsibilities: [
              'Provide photos and basic measurements (if available)',
              'Share any existing plans, title, or council correspondence',
              'Prepare a brief list of priorities and constraints',
            ],
            slotDuration: 60,
            slotBuffer: 15,
            advanceBookingMin: 60 * 24,
            advanceBookingMax: 60 * 24 * 21,
            addOns: [
              { addOnKey: 'EXPEDITED_TURNAROUND', priceCents: aud(95), turnaroundImpactDays: -1 },
              { addOnKey: 'ADDITIONAL_MEETING', priceCents: aud(260), turnaroundImpactDays: 0 },
            ],
          },
          {
            name: 'Feasibility + Planning Review (2 options)',
            slug: 'feasibility-planning-review',
            description:
              'A concise feasibility package covering planning constraints, site opportunities, and two high-level options with a budget range.',
            templateKey: TemplateKey.FEASIBILITY,
            templateData: {
              analysisTypes: [
                'PLANNING_REVIEW',
                'SITE_CONSTRAINTS',
                'OPTIONS_ANALYSIS',
                'BUDGET_RANGE',
              ],
              optionsCount: '2',
            },
            coveragePackageKey: 'FEASIBILITY_STANDARD',
            priceCents: aud(2850),
            leadTimeDays: 7,
            turnaroundDays: 10,
            deliveryMode: DeliveryMode.REMOTE,
            positioning: 'Best for early-stage decisions before committing to design.',
            clientResponsibilities: [
              'Provide the address and any survey or existing plans (if available)',
              'Confirm approximate floor area and storeys',
              'Share any known overlays or constraints',
            ],
            slotDuration: 60,
            slotBuffer: 15,
            advanceBookingMin: 60 * 24 * 3,
            advanceBookingMax: 60 * 24 * 45,
            addOns: [
              { addOnKey: 'TOWN_PLANNER_INPUT', priceCents: aud(980), turnaroundImpactDays: 5 },
              { addOnKey: 'COST_PLANNER_INPUT', priceCents: aud(1200), turnaroundImpactDays: 5 },
            ],
          },
          {
            name: 'Concept Design – Renovation (2 options + basic massing)',
            slug: 'concept-design-renovation',
            description:
              'Two concept directions for a renovation, including floor plans and basic elevations, with a simple 3D massing model to test form.',
            templateKey: TemplateKey.CONCEPT_DESIGN,
            templateData: {
              projectType: 'RENOVATION',
              optionsCount: '2',
              drawingTypes: ['FLOOR_PLANS', 'BASIC_ELEVATIONS'],
              threeDLevel: 'BASIC_MASSING',
              revisionsIncluded: 2,
              touchpointsIncluded: 2,
            },
            coveragePackageKey: 'CONCEPT_DESIGN_STANDARD',
            priceCents: aud(7200),
            leadTimeDays: 10,
            turnaroundDays: 21,
            deliveryMode: DeliveryMode.BOTH,
            positioning: 'Best for aligning layout + look before planning drawings.',
            clientResponsibilities: [
              'Provide survey / existing plans if available',
              'Confirm key room requirements and budget range',
              'Provide reference imagery and constraints (heritage, trees, etc.)',
            ],
            slotDuration: 60,
            slotBuffer: 15,
            advanceBookingMin: 60 * 24 * 7,
            advanceBookingMax: 60 * 24 * 60,
            addOns: [
              { addOnKey: 'EXTRA_REVISION_ROUND', priceCents: aud(850), turnaroundImpactDays: 2 },
              { addOnKey: 'DETAILED_3D_RENDERS', priceCents: aud(1650), turnaroundImpactDays: 3 },
            ],
          },
          {
            name: 'Planning Approvals – NSW DA Lodgement',
            slug: 'planning-approvals-nsw-da',
            description:
              'Planning drawings and coordination for a NSW Development Application, including RFI responses and council liaison.',
            templateKey: TemplateKey.PLANNING_APPROVALS,
            templateData: {
              jurisdiction: 'NSW',
              submissionType: 'DA',
              scope: ['PLANNING_DRAWINGS', 'SUBMISSION_COORDINATION', 'RFI_RESPONSES'],
              lodgementLead: 'ARCHITECT',
              consultantCoordination: true,
            },
            coveragePackageKey: 'PLANNING_APPROVALS_STANDARD',
            priceCents: aud(9800),
            leadTimeDays: 14,
            turnaroundDays: 35,
            deliveryMode: DeliveryMode.BOTH,
            positioning: 'Best for council-ready packages with clear coordination.',
            clientResponsibilities: [
              'Provide survey and title information',
              'Pay council fees directly',
              'Engage specialist consultants if required (we can coordinate)',
            ],
            slotDuration: 60,
            slotBuffer: 15,
            advanceBookingMin: 60 * 24 * 10,
            advanceBookingMax: 60 * 24 * 90,
            addOns: [
              { addOnKey: 'PRE_LODGEMENT_MEETING', priceCents: aud(650), turnaroundImpactDays: 7 },
              {
                addOnKey: 'HERITAGE_CONSULTANT_INPUT',
                priceCents: aud(1450),
                turnaroundImpactDays: 5,
              },
            ],
          },
          {
            name: 'Builder Drawings Review (annotated)',
            slug: 'builder-drawings-review',
            description:
              'A detailed annotated review of builder-prepared drawings, highlighting risks, missing information, and design improvements.',
            templateKey: TemplateKey.REVIEW,
            templateData: {
              reviewTarget: 'BUILDER_DRAWINGS',
              reviewDepth: 'DETAILED_ANNOTATED',
              inputsRequired: 'PDFS_ONLY',
            },
            coveragePackageKey: 'REVIEW_STANDARD',
            priceCents: aud(1250),
            leadTimeDays: 3,
            turnaroundDays: 5,
            deliveryMode: DeliveryMode.REMOTE,
            positioning: 'Best for a second opinion before signing off.',
            clientResponsibilities: [
              'Provide the full drawing set as PDFs',
              'Outline key concerns/questions',
            ],
            slotDuration: 30,
            slotBuffer: 10,
            advanceBookingMin: 60 * 12,
            advanceBookingMax: 60 * 24 * 30,
            addOns: [
              { addOnKey: 'EXPEDITED_TURNAROUND', priceCents: aud(180), turnaroundImpactDays: -2 },
            ],
          },
        ],
        bundles: [
          {
            name: 'Renovation Kickstart Bundle',
            slug: 'renovation-kickstart',
            description:
              'A popular sequence to get moving fast: consult → feasibility → concept design. Ideal for Sydney renovations and small sites.',
            pricingType: BundlePricingType.FIXED,
            priceCents: aud(9800),
            positioning: 'Best for confident decisions in 4–6 weeks.',
            services: [
              { serviceSlug: 'initial-design-consultation', sortOrder: 0 },
              { serviceSlug: 'feasibility-planning-review', sortOrder: 1 },
              { serviceSlug: 'concept-design-renovation', sortOrder: 2 },
            ],
          },
        ],
      },
    },
    {
      provider: {
        name: 'Laneway Studio Architecture',
        slug: 'laneway-studio-architecture',
        description:
          'Melbourne-based practice specialising in warm modern homes, heritage-sensitive alterations, and clear documentation for planning.',
      },
      ownerUser: {
        email: 'matthew.singh@lanewaystudio.com.au',
        firstName: 'Matthew',
        lastName: 'Singh',
        timezone: DEFAULT_TZ,
      },
      licensing: {
        licenses: [{ jurisdiction: 'VIC' }],
        serviceAreas: [
          { jurisdiction: 'VIC', localityName: 'City of Melbourne' },
          { jurisdiction: 'VIC', localityName: 'City of Yarra' },
          { jurisdiction: 'VIC', localityName: 'City of Port Phillip' },
          { jurisdiction: 'VIC', localityName: 'City of Stonnington' },
          { jurisdiction: 'VIC', localityName: 'City of Boroondara' },
        ],
        localExperience: [
          { jurisdiction: 'VIC', localityName: 'City of Melbourne' },
          { jurisdiction: 'VIC', localityName: 'City of Glen Eira' },
          { jurisdiction: 'VIC', localityName: 'City of Darebin' },
        ],
      },
      availability: weekdayAvailability({ start: '08:30', end: '17:00' }),
      marketplace: {
        services: [
          {
            name: 'On-site Consultation (90 min)',
            slug: 'on-site-consultation',
            description:
              'A 90-minute on-site visit to review constraints, discuss options, and align on budget and next steps. Includes email summary.',
            templateKey: TemplateKey.CONSULTATION,
            templateData: {
              duration: '90',
              delivery: 'ON_SITE',
              focus: ['RENOVATION_ADVICE', 'DESIGN_SECOND_OPINION', 'BUDGET_STRATEGY'],
              followUp: 'EMAIL_SUMMARY',
              siteContext: 'ON_SITE_WALKTHROUGH',
            },
            coveragePackageKey: 'CONSULTATION_STANDARD',
            priceCents: aud(640),
            leadTimeDays: 5,
            turnaroundDays: 2,
            deliveryMode: DeliveryMode.ON_SITE,
            positioning: 'Best for heritage homes and tricky existing conditions.',
            clientResponsibilities: [
              'Confirm site access and any body corporate/building requirements',
              'Share any existing plans or permits',
            ],
            slotDuration: 90,
            slotBuffer: 20,
            advanceBookingMin: 60 * 24 * 2,
            advanceBookingMax: 60 * 24 * 28,
            addOns: [
              { addOnKey: 'ADDITIONAL_MEETING', priceCents: aud(320), turnaroundImpactDays: 0 },
            ],
          },
          {
            name: 'Feasibility – Medium Site (3 options)',
            slug: 'feasibility-medium-site',
            description:
              'Planning review and site constraints analysis with three high-level options. Suitable for medium-sized sites without overlays.',
            templateKey: TemplateKey.FEASIBILITY,
            templateData: {
              analysisTypes: [
                'PLANNING_REVIEW',
                'SITE_CONSTRAINTS',
                'OPTIONS_ANALYSIS',
                'YIELD_STUDY',
              ],
              optionsCount: '3',
            },
            coveragePackageKey: 'FEASIBILITY_STANDARD',
            priceCents: aud(3600),
            leadTimeDays: 10,
            turnaroundDays: 14,
            deliveryMode: DeliveryMode.REMOTE,
            positioning: 'Best for clarifying what’s possible before design.',
            clientResponsibilities: [
              'Provide existing plans or survey (preferred)',
              'Confirm intended use and approximate floor area',
            ],
            slotDuration: 60,
            slotBuffer: 15,
            advanceBookingMin: 60 * 24 * 5,
            advanceBookingMax: 60 * 24 * 60,
            addOns: [
              {
                addOnKey: 'SUSTAINABILITY_ASSESSMENT',
                priceCents: aud(950),
                turnaroundImpactDays: 3,
              },
              {
                addOnKey: 'STRUCTURAL_ENGINEER_INPUT',
                priceCents: aud(1250),
                turnaroundImpactDays: 5,
              },
            ],
          },
          {
            name: 'Concept Design – New Build (renders included)',
            slug: 'concept-design-new-build',
            description:
              'A concept package for a new build with floor plans, basic elevations, and rendered views to help you visualise the outcome.',
            templateKey: TemplateKey.CONCEPT_DESIGN,
            templateData: {
              projectType: 'NEW_BUILD',
              optionsCount: '2',
              drawingTypes: ['FLOOR_PLANS', 'ROOF_SITE', 'BASIC_ELEVATIONS'],
              threeDLevel: 'RENDERED_VIEWS',
              revisionsIncluded: 3,
              touchpointsIncluded: 3,
            },
            coveragePackageKey: 'CONCEPT_DESIGN_STANDARD',
            priceCents: aud(11200),
            leadTimeDays: 14,
            turnaroundDays: 28,
            deliveryMode: DeliveryMode.BOTH,
            positioning: 'Best for aligning on a clear design direction with visuals.',
            clientResponsibilities: [
              'Provide site survey (required) and any covenants',
              'Confirm room schedule and must-haves',
            ],
            slotDuration: 60,
            slotBuffer: 15,
            advanceBookingMin: 60 * 24 * 10,
            advanceBookingMax: 60 * 24 * 90,
            addOns: [
              {
                addOnKey: 'PASSIVE_DESIGN_ANALYSIS',
                priceCents: aud(780),
                turnaroundImpactDays: 2,
              },
              {
                addOnKey: 'LANDSCAPE_ARCHITECT_INPUT',
                priceCents: aud(1400),
                turnaroundImpactDays: 4,
              },
            ],
          },
          {
            name: 'Planning Approvals – VIC Planning Permit Support',
            slug: 'planning-approvals-vic',
            description:
              'Preparation of a planning permit package and coordination through council requests for information (RFIs).',
            templateKey: TemplateKey.PLANNING_APPROVALS,
            templateData: {
              jurisdiction: 'VIC',
              submissionType: 'PLANNING_PERMIT',
              scope: [
                'PLANNING_DRAWINGS',
                'SUBMISSION_COORDINATION',
                'RFI_RESPONSES',
                'PRE_LODGEMENT',
              ],
              lodgementLead: 'ARCHITECT',
              consultantCoordination: false,
            },
            coveragePackageKey: 'PLANNING_APPROVALS_STANDARD',
            priceCents: aud(10400),
            leadTimeDays: 14,
            turnaroundDays: 42,
            deliveryMode: DeliveryMode.BOTH,
            positioning: 'Best for a clean, council-ready planning package.',
            clientResponsibilities: [
              'Pay council fees directly',
              'Provide title, covenant, and survey details',
            ],
            slotDuration: 60,
            slotBuffer: 15,
            advanceBookingMin: 60 * 24 * 10,
            advanceBookingMax: 60 * 24 * 120,
            addOns: [
              { addOnKey: 'TOWN_PLANNER_INPUT', priceCents: aud(1350), turnaroundImpactDays: 5 },
              {
                addOnKey: 'HERITAGE_CONSULTANT_INPUT',
                priceCents: aud(1650),
                turnaroundImpactDays: 5,
              },
            ],
          },
        ],
        bundles: [
          {
            name: 'New Build Concept Bundle',
            slug: 'new-build-concept-bundle',
            description:
              'A streamlined pathway for new builds: feasibility followed by concept design with renders.',
            pricingType: BundlePricingType.FIXED,
            priceCents: aud(14000),
            positioning: 'Best for getting from “can we?” to “this is it”.',
            services: [
              { serviceSlug: 'feasibility-medium-site', sortOrder: 0 },
              { serviceSlug: 'concept-design-new-build', sortOrder: 1 },
            ],
          },
        ],
      },
    },
    {
      provider: {
        name: 'Subtropic Design Co.',
        slug: 'subtropic-design-co',
        description:
          'Queensland studio for subtropical homes, outdoor living, and secondary dwellings. Practical planning advice with climate-first design.',
      },
      ownerUser: {
        email: 'isla.taylor@subtropicdesign.com.au',
        firstName: 'Isla',
        lastName: 'Taylor',
        timezone: DEFAULT_TZ,
      },
      licensing: {
        licenses: [{ jurisdiction: 'QLD' }],
        serviceAreas: [
          { jurisdiction: 'QLD', localityName: 'Brisbane City Council' },
          { jurisdiction: 'QLD', localityName: 'Gold Coast City Council' },
          { jurisdiction: 'QLD', localityName: 'Sunshine Coast Council' },
          { jurisdiction: 'QLD', localityName: 'Moreton Bay Regional Council' },
        ],
        localExperience: [
          { jurisdiction: 'QLD', localityName: 'Brisbane City Council' },
          { jurisdiction: 'QLD', localityName: 'Logan City Council' },
        ],
      },
      availability: [
        ...weekdayAvailability({ start: '09:00', end: '16:30' }),
        { dayOfWeek: 4, startTime: '18:00', endTime: '20:00', timezone: DEFAULT_TZ },
      ],
      marketplace: {
        services: [
          {
            name: 'Climate-Smart Consultation (60 min)',
            slug: 'climate-smart-consultation',
            description:
              'A practical design consult focused on orientation, ventilation, shading, and room planning for subtropical comfort.',
            templateKey: TemplateKey.CONSULTATION,
            templateData: {
              duration: '60',
              delivery: 'VIDEO',
              focus: ['NEW_BUILD_ADVICE', 'RENOVATION_ADVICE', 'BUDGET_STRATEGY'],
              followUp: 'WRITTEN_SUMMARY_PDF',
              siteContext: 'EXISTING_PLANS',
            },
            coveragePackageKey: 'CONSULTATION_STANDARD',
            priceCents: aud(480),
            leadTimeDays: 3,
            turnaroundDays: 3,
            deliveryMode: DeliveryMode.REMOTE,
            positioning: 'Best for subtropical layouts and passive comfort wins.',
            clientResponsibilities: ['Share existing plans or a rough sketch', 'Provide site address and photos'],
            slotDuration: 60,
            slotBuffer: 15,
            advanceBookingMin: 60 * 24,
            advanceBookingMax: 60 * 24 * 21,
            addOns: [{ addOnKey: 'ADDITIONAL_MEETING', priceCents: aud(260), turnaroundImpactDays: 0 }],
          },
          {
            name: 'Feasibility – Options + Budget Range',
            slug: 'feasibility-options-budget',
            description:
              'A feasibility assessment including site constraints, planning review, and two options with a budget range estimate.',
            templateKey: TemplateKey.FEASIBILITY,
            templateData: {
              analysisTypes: ['PLANNING_REVIEW', 'SITE_CONSTRAINTS', 'OPTIONS_ANALYSIS', 'BUDGET_RANGE'],
              optionsCount: '2',
            },
            coveragePackageKey: 'FEASIBILITY_STANDARD',
            priceCents: aud(3100),
            leadTimeDays: 7,
            turnaroundDays: 12,
            deliveryMode: DeliveryMode.REMOTE,
            positioning: 'Best for deciding between renovation vs. rebuild.',
            clientResponsibilities: ['Provide address and any survey/contours', 'Share any existing approvals'],
            slotDuration: 60,
            slotBuffer: 15,
            advanceBookingMin: 60 * 24 * 3,
            advanceBookingMax: 60 * 24 * 60,
            addOns: [
              { addOnKey: 'COST_PLANNER_INPUT', priceCents: aud(1150), turnaroundImpactDays: 5 },
              { addOnKey: 'SUSTAINABILITY_ASSESSMENT', priceCents: aud(890), turnaroundImpactDays: 3 },
            ],
          },
          {
            name: 'Concept Design – Secondary Dwelling (granny flat)',
            slug: 'concept-design-secondary-dwelling',
            description:
              'A concept package for a secondary dwelling, including floor plans, furniture layouts, and simple 3D model for massing.',
            templateKey: TemplateKey.CONCEPT_DESIGN,
            templateData: {
              projectType: 'SECONDARY_DWELLING',
              optionsCount: '1',
              drawingTypes: ['FLOOR_PLANS', 'FURNITURE_LAYOUTS'],
              threeDLevel: 'SIMPLE_MODEL',
              revisionsIncluded: 2,
              touchpointsIncluded: 2,
            },
            coveragePackageKey: 'CONCEPT_DESIGN_BASIC',
            priceCents: aud(5200),
            leadTimeDays: 10,
            turnaroundDays: 18,
            deliveryMode: DeliveryMode.REMOTE,
            positioning: 'Best for maximising small footprints with liveability.',
            clientResponsibilities: ['Provide survey and setbacks', 'Confirm desired bedrooms/bathrooms'],
            slotDuration: 60,
            slotBuffer: 15,
            advanceBookingMin: 60 * 24 * 7,
            advanceBookingMax: 60 * 24 * 75,
            addOns: [
              { addOnKey: 'PASSIVE_DESIGN_ANALYSIS', priceCents: aud(690), turnaroundImpactDays: 2 },
              { addOnKey: 'EXTRA_REVISION_ROUND', priceCents: aud(720), turnaroundImpactDays: 2 },
            ],
          },
          {
            name: 'Planning Approvals – QLD DA Support',
            slug: 'planning-approvals-qld',
            description:
              'Support through the DA pathway in Queensland, including planning drawings, submission coordination, and RFI responses.',
            templateKey: TemplateKey.PLANNING_APPROVALS,
            templateData: {
              jurisdiction: 'QLD',
              submissionType: 'DA',
              scope: ['PLANNING_DRAWINGS', 'SUBMISSION_COORDINATION', 'RFI_RESPONSES'],
              lodgementLead: 'CLIENT',
              consultantCoordination: false,
            },
            coveragePackageKey: 'PLANNING_APPROVALS_STANDARD',
            priceCents: aud(8900),
            leadTimeDays: 14,
            turnaroundDays: 35,
            deliveryMode: DeliveryMode.REMOTE,
            positioning: 'Best for clients who want to lodge with supported documentation.',
            clientResponsibilities: ['Client lodges and pays council fees', 'Provide survey and any reports'],
            slotDuration: 60,
            slotBuffer: 15,
            advanceBookingMin: 60 * 24 * 10,
            advanceBookingMax: 60 * 24 * 120,
            addOns: [{ addOnKey: 'TOWN_PLANNER_INPUT', priceCents: aud(1250), turnaroundImpactDays: 5 }],
          },
        ],
        bundles: [
          {
            name: 'Secondary Dwelling Starter Bundle',
            slug: 'secondary-dwelling-starter',
            description: 'A fast pathway for granny flats: consult + concept design.',
            pricingType: BundlePricingType.FIXED,
            priceCents: aud(5400),
            positioning: 'Best for getting to a clear concept quickly.',
            services: [
              { serviceSlug: 'climate-smart-consultation', sortOrder: 0 },
              { serviceSlug: 'concept-design-secondary-dwelling', sortOrder: 1 },
            ],
          },
        ],
      },
    },
    {
      provider: {
        name: 'Coastal + Craft Architects',
        slug: 'coastal-and-craft-architects',
        description:
          'Perth-based architects delivering calm coastal homes and durable details. Clear scope, practical documentation, and good communication.',
      },
      ownerUser: {
        email: 'james.wu@coastalandcraft.com.au',
        firstName: 'James',
        lastName: 'Wu',
        timezone: DEFAULT_TZ,
      },
      licensing: {
        licenses: [{ jurisdiction: 'WA' }],
        serviceAreas: [
          { jurisdiction: 'WA', localityName: 'City of Perth' },
          { jurisdiction: 'WA', localityName: 'City of Subiaco' },
          { jurisdiction: 'WA', localityName: 'City of Fremantle' },
          { jurisdiction: 'WA', localityName: 'City of Stirling' },
        ],
        localExperience: [
          { jurisdiction: 'WA', localityName: 'City of Fremantle' },
          { jurisdiction: 'WA', localityName: 'City of Cockburn' },
        ],
      },
      availability: weekdayAvailability({ start: '09:00', end: '17:00' }),
      marketplace: {
        services: [
          {
            name: 'Project Direction Consultation (60 min)',
            slug: 'project-direction-consultation',
            description:
              'A structured consult to clarify your brief, budget, and site constraints, and agree on a realistic next step.',
            templateKey: TemplateKey.CONSULTATION,
            templateData: {
              duration: '60',
              delivery: 'PHONE',
              focus: ['NEW_BUILD_ADVICE', 'PLANNING_PATHWAY', 'BUDGET_STRATEGY'],
              followUp: 'EMAIL_SUMMARY',
              siteContext: 'PHOTOS_MEASUREMENTS',
            },
            coveragePackageKey: 'CONSULTATION_STANDARD',
            priceCents: aud(360),
            leadTimeDays: 2,
            turnaroundDays: 2,
            deliveryMode: DeliveryMode.REMOTE,
            positioning: 'Best for aligning scope before spending on drawings.',
            clientResponsibilities: ['Provide a short brief and a few site photos', 'Share any existing plans if available'],
            slotDuration: 60,
            slotBuffer: 15,
            advanceBookingMin: 60 * 24,
            advanceBookingMax: 60 * 24 * 21,
            addOns: [{ addOnKey: 'EXPEDITED_TURNAROUND', priceCents: aud(80), turnaroundImpactDays: -1 }],
          },
          {
            name: 'Feasibility – Coastal Site Constraints',
            slug: 'feasibility-coastal-constraints',
            description:
              'Feasibility assessment for coastal conditions: constraints, planning review, and two options with risks checklist.',
            templateKey: TemplateKey.FEASIBILITY,
            templateData: {
              analysisTypes: ['PLANNING_REVIEW', 'SITE_CONSTRAINTS', 'OPTIONS_ANALYSIS'],
              optionsCount: '2',
            },
            coveragePackageKey: 'FEASIBILITY_STANDARD',
            priceCents: aud(2750),
            leadTimeDays: 7,
            turnaroundDays: 10,
            deliveryMode: DeliveryMode.REMOTE,
            positioning: 'Best for early-stage coastal risk and constraints clarity.',
            clientResponsibilities: ['Provide address and any survey/contours', 'Share any known coastal hazard info'],
            slotDuration: 60,
            slotBuffer: 15,
            advanceBookingMin: 60 * 24 * 3,
            advanceBookingMax: 60 * 24 * 45,
            addOns: [{ addOnKey: 'STRUCTURAL_ENGINEER_INPUT', priceCents: aud(1350), turnaroundImpactDays: 5 }],
          },
          {
            name: 'Concept Design – New Build (simple model)',
            slug: 'concept-design-new-build-simple',
            description:
              'Concept design for a new build with floor plans, roof/site plan, and a simple 3D model for form and proportions.',
            templateKey: TemplateKey.CONCEPT_DESIGN,
            templateData: {
              projectType: 'NEW_BUILD',
              optionsCount: '1',
              drawingTypes: ['FLOOR_PLANS', 'ROOF_SITE', 'BASIC_ELEVATIONS'],
              threeDLevel: 'SIMPLE_MODEL',
              revisionsIncluded: 2,
              touchpointsIncluded: 2,
            },
            coveragePackageKey: 'CONCEPT_DESIGN_BASIC',
            priceCents: aud(8400),
            leadTimeDays: 14,
            turnaroundDays: 24,
            deliveryMode: DeliveryMode.BOTH,
            positioning: 'Best for a single, clear direction and steady progress.',
            clientResponsibilities: ['Provide survey (required)', 'Confirm room schedule and desired material palette'],
            slotDuration: 60,
            slotBuffer: 15,
            advanceBookingMin: 60 * 24 * 10,
            advanceBookingMax: 60 * 24 * 90,
            addOns: [
              { addOnKey: 'EXTRA_REVISION_ROUND', priceCents: aud(820), turnaroundImpactDays: 2 },
              { addOnKey: 'DETAILED_3D_RENDERS', priceCents: aud(1750), turnaroundImpactDays: 3 },
            ],
          },
          {
            name: 'Concept Design Review (high-level)',
            slug: 'concept-design-review',
            description:
              'A second-opinion review of an existing concept design with clear recommendations and priorities for improvement.',
            templateKey: TemplateKey.REVIEW,
            templateData: {
              reviewTarget: 'CONCEPT_DESIGN',
              reviewDepth: 'HIGH_LEVEL',
              inputsRequired: 'PDFS_ONLY',
            },
            coveragePackageKey: 'REVIEW_STANDARD',
            priceCents: aud(780),
            leadTimeDays: 3,
            turnaroundDays: 4,
            deliveryMode: DeliveryMode.REMOTE,
            positioning: 'Best for quick clarity before moving to planning.',
            clientResponsibilities: ['Provide concept PDFs and any consultant notes', 'List the top 3 concerns you want addressed'],
            slotDuration: 30,
            slotBuffer: 10,
            advanceBookingMin: 60 * 12,
            advanceBookingMax: 60 * 24 * 21,
            addOns: [{ addOnKey: 'EXPEDITED_TURNAROUND', priceCents: aud(120), turnaroundImpactDays: -1 }],
          },
        ],
        bundles: [
          {
            name: 'New Build Kickoff Bundle',
            slug: 'new-build-kickoff',
            description: 'Consultation + feasibility + concept design for a clean start on a new build.',
            pricingType: BundlePricingType.FIXED,
            priceCents: aud(11200),
            positioning: 'Best for a single direction with confident next steps.',
            services: [
              { serviceSlug: 'project-direction-consultation', sortOrder: 0 },
              { serviceSlug: 'feasibility-coastal-constraints', sortOrder: 1 },
              { serviceSlug: 'concept-design-new-build-simple', sortOrder: 2 },
            ],
          },
        ],
      },
    },
    {
      provider: {
        name: 'Terrace & Timber Studio',
        slug: 'terrace-and-timber-studio',
        description:
          'Adelaide practice delivering carefully detailed renovations and contemporary extensions. Practical advice, clear deliverables, and predictable timelines.',
      },
      ownerUser: {
        email: 'sophie.nguyen@terraceandtimber.com.au',
        firstName: 'Sophie',
        lastName: 'Nguyen',
        timezone: DEFAULT_TZ,
      },
      licensing: {
        licenses: [{ jurisdiction: 'SA' }],
        serviceAreas: [
          { jurisdiction: 'SA', localityName: 'City of Adelaide' },
          { jurisdiction: 'SA', localityName: 'City of Unley' },
          { jurisdiction: 'SA', localityName: 'City of Burnside' },
          { jurisdiction: 'SA', localityName: 'City of Marion' },
        ],
        localExperience: [
          { jurisdiction: 'SA', localityName: 'City of Adelaide' },
          { jurisdiction: 'SA', localityName: 'City of Charles Sturt' },
        ],
      },
      availability: [
        ...weekdayAvailability({ start: '09:00', end: '17:00' }),
        { dayOfWeek: 2, startTime: '19:00', endTime: '21:00', timezone: DEFAULT_TZ },
      ],
      marketplace: {
        services: [
          {
            name: 'Renovation Consultation (60 min)',
            slug: 'renovation-consultation',
            description:
              'A renovation-focused consult to clarify scope, budget, and sequencing. Includes follow-up email with key recommendations.',
            templateKey: TemplateKey.CONSULTATION,
            templateData: {
              duration: '60',
              delivery: 'VIDEO',
              focus: ['RENOVATION_ADVICE', 'BUDGET_STRATEGY', 'DESIGN_SECOND_OPINION'],
              followUp: 'EMAIL_SUMMARY',
              siteContext: 'PHOTOS_MEASUREMENTS',
            },
            coveragePackageKey: 'CONSULTATION_STANDARD',
            priceCents: aud(390),
            leadTimeDays: 2,
            turnaroundDays: 2,
            deliveryMode: DeliveryMode.REMOTE,
            positioning: 'Best for extensions, reconfigurations, and older homes.',
            clientResponsibilities: ['Provide photos and a rough floorplan if possible', 'Share any existing approvals'],
            slotDuration: 60,
            slotBuffer: 15,
            advanceBookingMin: 60 * 24,
            advanceBookingMax: 60 * 24 * 21,
            addOns: [{ addOnKey: 'ADDITIONAL_MEETING', priceCents: aud(240), turnaroundImpactDays: 0 }],
          },
          {
            name: 'Feasibility – Planning + Constraints',
            slug: 'feasibility-planning-constraints',
            description:
              'Planning review and constraints analysis with two options and a clear checklist of risks to resolve before design.',
            templateKey: TemplateKey.FEASIBILITY,
            templateData: {
              analysisTypes: ['PLANNING_REVIEW', 'SITE_CONSTRAINTS', 'OPTIONS_ANALYSIS'],
              optionsCount: '2',
            },
            coveragePackageKey: 'FEASIBILITY_BASIC',
            priceCents: aud(2400),
            leadTimeDays: 7,
            turnaroundDays: 10,
            deliveryMode: DeliveryMode.REMOTE,
            positioning: 'Best for deciding “extend vs. rebuild” with confidence.',
            clientResponsibilities: ['Provide address and any existing plans', 'Confirm intended floor area and storeys'],
            slotDuration: 60,
            slotBuffer: 15,
            advanceBookingMin: 60 * 24 * 3,
            advanceBookingMax: 60 * 24 * 45,
            addOns: [{ addOnKey: 'TOWN_PLANNER_INPUT', priceCents: aud(950), turnaroundImpactDays: 5 }],
          },
          {
            name: 'Concept Design – Interior Reconfiguration',
            slug: 'concept-design-interior',
            description:
              'Concept layouts for interior reconfiguration, focusing on flow, light, and liveability. Includes furniture layouts and two revisions.',
            templateKey: TemplateKey.CONCEPT_DESIGN,
            templateData: {
              projectType: 'INTERIOR_RECONFIGURATION',
              optionsCount: '2',
              drawingTypes: ['FLOOR_PLANS', 'FURNITURE_LAYOUTS'],
              threeDLevel: 'NONE',
              revisionsIncluded: 2,
              touchpointsIncluded: 2,
            },
            coveragePackageKey: 'CONCEPT_DESIGN_BASIC',
            priceCents: aud(6100),
            leadTimeDays: 10,
            turnaroundDays: 18,
            deliveryMode: DeliveryMode.REMOTE,
            positioning: 'Best for making an existing home work better.',
            clientResponsibilities: ['Provide current floor plan (or measurements)', 'Confirm key pinch points and priorities'],
            slotDuration: 60,
            slotBuffer: 15,
            advanceBookingMin: 60 * 24 * 7,
            advanceBookingMax: 60 * 24 * 75,
            addOns: [{ addOnKey: 'EXTRA_REVISION_ROUND', priceCents: aud(720), turnaroundImpactDays: 2 }],
          },
          {
            name: 'Planning Refusal Review + Next Steps',
            slug: 'planning-refusal-review',
            description:
              'A structured review of a planning refusal with recommended pathway, risks, and priority changes to improve your resubmission.',
            templateKey: TemplateKey.REVIEW,
            templateData: {
              reviewTarget: 'PLANNING_REFUSAL',
              reviewDepth: 'DETAILED_ANNOTATED',
              inputsRequired: 'PDFS_ONLY',
            },
            coveragePackageKey: 'REVIEW_STANDARD',
            priceCents: aud(1350),
            leadTimeDays: 3,
            turnaroundDays: 6,
            deliveryMode: DeliveryMode.REMOTE,
            positioning: 'Best for turning a refusal into a clear action plan.',
            clientResponsibilities: ['Provide refusal letter and lodged documents', 'Provide any RFI history and consultant inputs'],
            slotDuration: 45,
            slotBuffer: 15,
            advanceBookingMin: 60 * 24,
            advanceBookingMax: 60 * 24 * 30,
            addOns: [{ addOnKey: 'EXPEDITED_TURNAROUND', priceCents: aud(220), turnaroundImpactDays: -2 }],
          },
        ],
        bundles: [
          {
            name: 'Renovation Planning Bundle',
            slug: 'renovation-planning-bundle',
            description: 'Consultation + feasibility + concept design for renovations and extensions in Adelaide.',
            pricingType: BundlePricingType.FIXED,
            priceCents: aud(8200),
            positioning: 'Best for a clear brief, risks checklist, and a workable concept.',
            services: [
              { serviceSlug: 'renovation-consultation', sortOrder: 0 },
              { serviceSlug: 'feasibility-planning-constraints', sortOrder: 1 },
              { serviceSlug: 'concept-design-interior', sortOrder: 2 },
            ],
          },
        ],
      },
    },
  ];

  console.log(`Seeding ${providerSeeds.length} providers…`);

  for (const seed of providerSeeds) {
    const { providerProfile, teamMember, owner } = await ensureProviderWithTeam(seed);

    await replaceProviderLicensing(providerProfile.id, seed.licensing);
    await replaceTeamMemberAvailability(teamMember.id, seed.availability);
    await replaceProviderMarketplace(providerProfile.id, seed.marketplace);

    console.log(`✓ ${providerProfile.name} (${providerProfile.slug}) — owner: ${owner.email}`);
  }

  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
