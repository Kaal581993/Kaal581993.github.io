import type { CommandResult, OutputLine, OutputTone } from './types'
import { skillCategories, projects, experience } from '../professional-profile/profileContent'

const leetCodeUrl = import.meta.env.VITE_LEETCODE_URL
const hackerRankUrl = import.meta.env.VITE_HACKERRANK_URL

export const commandNames = [
  'help',
  'whoami',
  'about',
  'skills',
  'projects',
  'experience',
  'profiles',
  'leetcode',
  'hackerrank',
  'resources',
  'services',
  'clear',
  'contact',
  'sudo',
]

const line = (text: string, tone: OutputTone = 'default'): OutputLine => ({
  segments: [{ text, tone }],
})

const sectionHeader = (text: string): OutputLine => ({
  segments: [{ text: `\n${text}`, tone: 'accent' }],
})

const linkedLine = (label: string, detail: string, href: string): OutputLine => ({
  segments: [
    { text: label, tone: 'accent' },
    { text: `  ${detail}  `, tone: 'muted' },
    { text: '↗ source', tone: 'cyan', href },
  ],
})

const githubUrl = 'https://github.com/Kaal581993'
const repositoriesUrl = `${githubUrl}?tab=repositories`

export const executeCommand = (input: string): CommandResult => {
  const [command = ''] = input.trim().toLowerCase().split(/\s+/)

  switch (command) {
    case 'help':
      return {
        delayMs: 140,
        lines: [
          line('AVAILABLE COMMANDS', 'accent'),
          line('help        show this command index'),
          line('whoami      professional summary'),
          line('about       engineering background'),
          line('skills      technical stack'),
          line('projects    selected work + source links'),
          line('experience  career timeline'),
          line('profiles    open coding profile links'),
          line('resources   inspect browser runtime resources'),
          line('services    view service estimates'),
          line('contact     open direct email composer'),
          line('Each information command opens a HUD with the full response.', 'muted'),
          line('clear       clear terminal output'),
          line('sudo        request elevated access', 'muted'),
        ],
      }
    case 'whoami':
      return {
        delayMs: 260,
        lines: [
          line('VIRAL PRAJAPATI', 'accent'),
          line('Freelance Java Developer & Application Support Engineer | Backend Engineering Specialist', 'cyan'),
          line('━'.repeat(72), 'muted'),
          line(''),
          line('PROFESSIONAL SUMMARY', 'accent'),
          line('Technical Solutions Professional with 5+ years of experience bridging engineering requirements and business outcomes. Skilled in evaluating technical competencies across JavaScript, REST APIs, and cloud infrastructures, with a focus on stakeholder management, SLA delivery, and enterprise support operations.'),
          line(''),
          line('CORE COMPETENCIES', 'accent'),
          line('• Backend Engineering: Java 8/11/17, Spring Boot, Spring Data JPA, Hibernate, Microservices Architecture'),
          line('• API Development: REST APIs, JSON, API Debugging, HTTP Status Analysis, Webhooks, SSO/SAML'),
          line('• Message Queues: Apache Kafka, RabbitMQ, ActiveMQ — Event-driven Architecture & Troubleshooting'),
          line('• Databases: Oracle, MSSQL, MySQL, PostgreSQL — SQL Performance Tuning, Schema Design, Query Optimization'),
          line('• Cloud & DevOps: AWS Cloud Storage, Docker, Linux, CI/CD Pipelines, Production Monitoring'),
          line('• Production Operations: Incident Management, Escalation Handling, Root Cause Analysis (RCA), Deployment Validation, Smoke Testing, SLA Management'),
          line('• Healthcare Integrations: HL7, FHIR, Electronic Health Exchange, Carequality, Commonwell'),
          line(''),
          line('INDUSTRY EXPERIENCE', 'accent'),
          line('Healthcare Technology (eClinicalWorks) · Travel & Expense Management (Quest2Travel) · SaaS Platforms (Restolabs) · Headless CMS (Contentstack) · Hospitality Systems (eZee Technosys)'),
          line(''),
          line('AVAILABILITY', 'accent'),
          line('Remote collaboration available for international teams across Australia, Europe, North America, APAC, and MENA regions.', 'muted'),
          line('Run "services" for indicative project estimates or "contact" to discuss scope.', 'muted'),
        ],
      }
    case 'about':
      return {
        delayMs: 260,
        lines: [
          line('ENGINEERING BACKGROUND', 'accent'),
          line('━'.repeat(72), 'muted'),
          line(''),
          line('EDUCATION', 'accent'),
          line('B.Tech — Computer Engineering, NMIMS University (MPSTME) — 2019'),
          line('Diploma — Computer Engineering — 2015'),
          line(''),
          line('CAREER TRAJECTORY', 'accent'),
          line('2019–2020  ·  eZee Technosys  ·  Technical Support Engineer'),
          line('  Hospitality/Property Management Systems · On-premise Integrations · SQL Diagnostics · ITIL Processes'),
          line(''),
          line('2020–2020  ·  Contentstack  ·  Customer Success Engineer'),
          line('  Headless CMS · Content Delivery/Management APIs · JavaScript · RBAC Authentication · Kafka'),
          line(''),
          line('2020–2021  ·  Restolabs  ·  Software Support Engineer'),
          line('  SaaS Platform Support · Customer Onboarding · Kafka Operations · Engineering Coordination'),
          line(''),
          line('2022–2024  ·  eClinicalWorks  ·  Technical Account Manager / Technical Support Engineer'),
          line('  Enterprise Healthcare · HL7/FHIR · Microservices · Kafka/RabbitMQ/ActiveMQ · Cloud Production Monitoring'),
          line('  High-volume Production Data · Raw Log Analysis · Performance Metrics · Alert Monitoring'),
          line(''),
          line('2024–2025  ·  Quest2Travel  ·  Support Engineer / Technical Support Engineer'),
          line('  Expense Management Platforms · Oracle SQL · Kafka · API Troubleshooting · SLA Optimization'),
          line(''),
          line('2025–Present  ·  Freelance/Independent Consultant  ·  Backend Tech Consultant'),
          line('  Java/Spring Boot Microservices Development · SQL Performance Tuning · Database Optimization · Schema Design'),
          line(''),
          line('TECHNICAL PHILOSOPHY', 'accent'),
          line('• Ownership mindset with attention to detail — every incident is a learning opportunity'),
          line('• Process-oriented approach: documentation, runbooks, and knowledge transfer are first-class deliverables'),
          line('• Enthusiastic continuous learner — transitioning from infrastructure support to product engineering'),
          line('• Strong customer-facing communication — translating technical complexity into stakeholder clarity'),
          line(''),
          line('KEY STRENGTHS', 'accent'),
          line('✦ Strong troubleshooting and analytical skills'),
          line('✦ Customer-facing communication and coordination'),
          line('✦ Ownership mindset with attention to detail'),
          line('✦ Enthusiastic tech learner with process-oriented approach'),
          line('✦ Strong documentation and operational discipline'),
        ],
      }
    case 'skills':
      return {
        delayMs: 220,
        lines: [
          line('TECHNICAL SKILLS MATRIX', 'accent'),
          line('━'.repeat(72), 'muted'),
          line(''),
          ...skillCategories.map((category, index) => 
            line(`${category.name.toUpperCase()}`, index === 0 ? 'accent' : 'cyan')
          ),
          line(''),
          ...skillCategories.flatMap((category) => [
            line(`  ${category.name}`, 'cyan'),
            ...category.skills.map(skill => line(`    • ${skill}`, 'default')),
            line(''),
          ]),
        ],
      }
    case 'projects':
      return {
        delayMs: 240,
        lines: [
          line('SELECTED PROJECTS  /  BACKEND & INTEGRATION', 'accent'),
          line('━'.repeat(72), 'muted'),
          line(''),
          ...projects.flatMap((project, index) => [
            line(`${String(index + 1).padStart(2, '0')}  ${project.title}`, 'accent'),
            line(`    ${project.description}`, 'default'),
            line(''),
            line('    TECH STACK', 'cyan'),
            ...project.techStack.map(tech => line(`      • ${tech}`, 'default')),
            line(''),
            line('    HIGHLIGHTS', 'cyan'),
            ...project.highlights.map(highlight => line(`      ✓ ${highlight}`, 'default')),
            line(''),
            linkedLine(`    View Source`, `GitHub Repository`, repositoriesUrl),
            line(''),
          ]),
          line('Repository links open the Kaal581993 GitHub profile. Confirm project-specific details in the repositories.', 'muted'),
        ],
      }
    case 'experience':
      return {
        delayMs: 220,
        lines: [
          line('CAREER EXPERIENCE  /  DETAILED TIMELINE', 'accent'),
          line('━'.repeat(72), 'muted'),
          line(''),
          ...experience.flatMap((exp) => [
            line(`${exp.role}`, 'accent'),
            line(`${exp.company}  ·  ${exp.location}  ·  ${exp.startDate} – ${exp.endDate}`, 'cyan'),
            line(''),
            line(exp.description, 'default'),
            line(''),
            line('  TECHNOLOGIES', 'cyan'),
            ...exp.technologies.map(tech => line(`    • ${tech}`, 'default')),
            line(''),
            line('  KEY ACHIEVEMENTS', 'cyan'),
            ...exp.achievements.map(achievement => line(`    ✓ ${achievement}`, 'default')),
            line(''),
          ]),
        ],
      }
    case 'profiles':
      return {
        delayMs: 140,
        lines: [
          line('CODING PROFILES', 'accent'),
          leetCodeUrl
            ? linkedLine('LeetCode', 'problem solving profile', leetCodeUrl)
            : line('LeetCode URL not configured. Set VITE_LEETCODE_URL.', 'muted'),
          hackerRankUrl
            ? linkedLine('HackerRank', 'skills and certifications', hackerRankUrl)
            : line('HackerRank URL not configured. Set VITE_HACKERRANK_URL.', 'muted'),
        ],
      }
    case 'leetcode':
      return {
        lines: leetCodeUrl
          ? [linkedLine('LeetCode', 'problem solving profile', leetCodeUrl)]
          : [line('Set VITE_LEETCODE_URL to open the LeetCode profile.', 'muted')],
      }
    case 'hackerrank':
      return {
        lines: hackerRankUrl
          ? [linkedLine('HackerRank', 'skills and certifications', hackerRankUrl)]
          : [line('Set VITE_HACKERRANK_URL to open the HackerRank profile.', 'muted')],
      }
    case 'resources':
    case 'system':
      return { delayMs: 120, action: 'resources', lines: [line('Opening browser resource console…', 'cyan')] }
    case 'services':
    case 'service':
      return { delayMs: 120, action: 'services', lines: [line('Loading service estimates…', 'cyan')] }
    case 'clear':
      return { clear: true, lines: [] }
    case 'contact':
      return {
        delayMs: 120,
        action: 'contact',
        lines: [line('Opening secure message composer…', 'cyan')],
      }
    case 'sudo':
      return { delayMs: 300, lines: [line('Permission denied: you are not Morpheus.', 'accent')] }
    case '':
      return { lines: [] }
    default:
      return {
        error: true,
        lines: [
          { segments: [{ text: `bash: ${command}: command not found. `, tone: 'muted' }, { text: 'Try help.', tone: 'cyan' }] },
        ],
      }
  }
}
