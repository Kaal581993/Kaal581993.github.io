import type { CommandResult, OutputLine, OutputTone } from './types'
import { skillCategories } from '../professional-profile/profileContent'

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
  'email',
  'clear',
  'contact',
  'sudo',
]

const line = (text: string, tone: OutputTone = 'default'): OutputLine => ({
  segments: [{ text, tone }],
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
          line('email       open direct email composer'),
          line('Each information command opens a HUD with the full response.', 'muted'),
          line('clear       clear terminal output'),
          line('sudo        request elevated access', 'muted'),
        ],
      }
    case 'whoami':
    case 'about':
      return {
        delayMs: 260,
        lines: [
          line('Viral Prajapati  /  Freelance Java Developer & Application Support Engineer', 'accent'),
          line('5+ years of experience across technical solutions, backend engineering, and enterprise application support.'),
          line('Backend focus: Java 8/11, Spring Boot, REST APIs, JSON, SQL, and service integrations.'),
          line('Production focus: incident triage, escalation handling, troubleshooting, root-cause analysis, smoke testing, and deployment validation.'),
          line('Integration focus: API debugging, HTTP status analysis, browser network/console tools, webhooks, and SSO/SAML exposure.'),
          line('Database work: Oracle, MSSQL, MySQL, Oracle SQL Developer, and PostgreSQL fundamentals.'),
          line('Remote collaboration available for international teams. Run services for indicative project estimates or contact to discuss scope.', 'muted'),
        ],
      }
    case 'skills':
      return {
        delayMs: 220,
        lines: skillCategories.map((category, index) => line(`${category.name.toUpperCase()}  ${category.skills.join(' · ')}`, index === 0 ? 'accent' : 'default')),
      }
    case 'projects':
      return {
        delayMs: 240,
        lines: [
          line('SELECTED PROJECTS  /  BACKEND & INTEGRATION', 'accent'),
          linkedLine('01  Fitness Microservices API', 'Spring Boot services · Kafka messaging · JPA persistence', repositoriesUrl),
          line('A service-oriented fitness API project combining REST endpoints with event messaging and relational persistence.'),
          linkedLine('02  E-Commerce Inventory Module', 'backend workflows · REST APIs · SQL data', repositoriesUrl),
          line('An inventory-focused module covering stock data and application API workflows.'),
          linkedLine('03  Enterprise API Debugging Suite', 'API diagnostics · production troubleshooting', repositoriesUrl),
          line('A support-oriented project focused on investigating API behavior and production issues.'),
          line('Repository links open the Kaal581993 GitHub profile. Confirm project-specific details in the repositories.', 'muted'),
        ],
      }
    case 'experience':
      return {
        delayMs: 220,
        lines: [
          line('CAREER EXPERIENCE  /  ORGANIZATIONS', 'accent'),
          line('Quest2Travel  ·  Technical solutions and backend engineering experience.'),
          line('eClinicalWorks  ·  Enterprise application environments and production support.'),
          line('Restolabs  ·  Application support and integration-focused technical work.'),
          line('Contentstack  ·  Platform support and backend systems experience.'),
          line('Cross-career work includes incident management, escalation handling, API troubleshooting, SQL investigation, deployment validation, and customer onboarding.'),
          line('Specific titles, dates, and project outcomes are available on request; this summary avoids unverified role-by-role claims.', 'muted'),
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
    case 'email':
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
