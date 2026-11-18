import { BlockType, PostStatus, PrismaClient, Role } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = hashSync("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@hospital.com" },
    create: { name: "Administrador", email: "admin@hospital.com", passwordHash, role: Role.ADMIN },
    update: { passwordHash, role: Role.ADMIN, active: true },
  });

  await prisma.user.upsert({
    where: { email: "editor@hospital.com" },
    create: { name: "Equipe de Comunicação", email: "editor@hospital.com", passwordHash, role: Role.EDITOR },
    update: { passwordHash, role: Role.EDITOR, active: true },
  });

  await prisma.user.upsert({
    where: { email: "usuario@hospital.com" },
    create: { name: "Usuário", email: "usuario@hospital.com", passwordHash, role: Role.USER },
    update: { passwordHash, role: Role.USER, active: true },
  });

  await prisma.siteSetting.upsert({
    where: { id: "main" },
    create: {},
    update: {},
  });

  // Home do hospital montada com blocos (editável no painel). Não sobrescreve o que já foi editado.
  await prisma.page.upsert({
    where: { slug: "home" },
    create: {
      slug: "home",
      title: "Página inicial",
      published: true,
      blocks: [
        { id: "home-heading-destaques", type: BlockType.HEADING, order: 0, content: { text: "O que está acontecendo", align: "left" } },
        { id: "home-carousel", type: BlockType.CAROUSEL, order: 1, content: {} },
        { id: "home-heading-conteudos", type: BlockType.HEADING, order: 2, content: { text: "Conteúdos para você", align: "left" } },
        {
          id: "home-text-conteudos",
          type: BlockType.TEXT,
          order: 3,
          content: {
            text: "Campanhas, novidades e orientações escritas pela nossa equipe para cuidar de você e da sua família.",
            align: "left",
          },
        },
        { id: "home-posts", type: BlockType.POSTS, order: 4, content: {} },
        {
          id: "home-hero",
          type: BlockType.HERO,
          order: 5,
          content: {
            eyebrow: "Sobre nós",
            title: "Saúde se constrói com informação, cuidado e presença.",
            text: "Somos uma rede de atendimento comprometida em acolher cada pessoa com atenção, respeito e excelência. Aqui você encontra orientações confiáveis sobre prevenção, tratamentos e a vida da nossa comunidade.",
            buttonText: "Acessar área interna",
            buttonUrl: "/login",
            items: [
              { icon: "heart-handshake", title: "Acolhimento", text: "Cada pessoa é única e merece atenção." },
              { icon: "shield-check", title: "Confiança", text: "Informação clara e responsável." },
              { icon: "stethoscope", title: "Excelência", text: "Equipe dedicada e estrutura moderna." },
            ],
          },
        },
      ],
    },
    update: {},
  });

  const admin = await prisma.user.findUniqueOrThrow({ where: { email: "admin@hospital.com" } });

  if ((await prisma.post.count()) === 0) {
    await prisma.post.create({
      data: {
        title: "Campanha de Vacinação 2026",
        slug: "campanha-vacinacao-2026",
        summary: "Proteja quem você ama. Vacinação gratuita em todas as unidades.",
        coverImage:
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80",
        status: PostStatus.PUBLISHED,
        order: 1,
        publishedAt: new Date(),
        authorId: admin.id,
        blocks: {
          create: [
            {
              type: BlockType.COLOR,
              order: 0,
              content: { color: "#E0F7F5", height: 16 },
            },
            {
              type: BlockType.HEADING,
              order: 1,
              content: { text: "Vacinar é cuidar de todo mundo", align: "left" },
            },
            {
              type: BlockType.TEXT,
              order: 2,
              content: {
                text: "A campanha 2026 começa agora! Estamos oferecendo vacinas gratuitas para todas as faixas etárias nas nossas unidades. Traga seu cartão de vacinação e venha conferir.",
                align: "left",
              },
            },
            {
              type: BlockType.IMAGE,
              order: 3,
              content: {
                url: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1600&q=80",
                alt: "Profissional de saúde preparando vacina",
                caption: "Nossa equipe está pronta para acolher você",
              },
            },
            {
              type: BlockType.QUOTE,
              order: 4,
              content: {
                text: "Cada vacina aplicada é uma vida protegida e uma família tranquila.",
                author: "Dra. Marina Costa — Coordenação de Prevenção",
              },
            },
            {
              type: BlockType.BUTTON,
              order: 5,
              content: {
                text: "Saiba mais sobre a campanha",
                url: "https://example.com/vacinacao",
                color: "#0EA5A4",
              },
            },
          ],
        },
      },
    });

    await prisma.post.create({
      data: {
        title: "Novo Centro de Cardiologia",
        slug: "novo-centro-cardiologia",
        summary: "Diagnóstico rápido, equipe especializada e estrutura moderna.",
        coverImage:
          "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1600&q=80",
        status: PostStatus.PUBLISHED,
        order: 2,
        publishedAt: new Date(),
        authorId: admin.id,
        blocks: {
          create: [
            {
              type: BlockType.HEADING,
              order: 0,
              content: { text: "Seu coração em boas mãos", align: "left" },
            },
            {
              type: BlockType.TEXT,
              order: 1,
              content: {
                text: "Inauguramos nosso novo Centro de Cardiologia com exames de última geração, atendimento humanizado e acompanhamento completo para você e sua família.",
                align: "left",
              },
            },
            {
              type: BlockType.IMAGE,
              order: 2,
              content: {
                url: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1600&q=80",
                alt: "Equipe médica em centro hospitalar",
                caption: "Estrutura moderna para cuidar de você",
              },
            },
            {
              type: BlockType.COLOR,
              order: 3,
              content: { color: "#FFF1EA", height: 12 },
            },
            {
              type: BlockType.BUTTON,
              order: 4,
              content: {
                text: "Agendar uma consulta",
                url: "https://example.com/agendar",
                color: "#FF8A65",
              },
            },
          ],
        },
      },
    });

    await prisma.post.create({
      data: {
        title: "Dicas para cuidar da saúde mental",
        slug: "dicas-saude-mental",
        summary: "Pequenas atitudes que fazem diferença no seu dia a dia.",
        status: PostStatus.DRAFT,
        order: 3,
        authorId: admin.id,
        blocks: {
          create: [
            {
              type: BlockType.HEADING,
              order: 0,
              content: { text: "Cuide da mente, cuide da vida", align: "left" },
            },
            {
              type: BlockType.TEXT,
              order: 1,
              content: {
                text: "Respirar profundamente, manter uma rotina de sono e conversar com alguém de confiança são passos simples que ajudam muito.",
                align: "left",
              },
            },
          ],
        },
      },
    });
  }

  console.log("✅ Seed concluído: admin@hospital.com / admin123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
