export interface SkillCategory {
  name: string
  skills: string[]
}

export const skillCategories: SkillCategory[] = [
  {
    name: 'Implementation & Support',
    skills: [
      'Application Support',
      'Customer Onboarding',
      'Production Support',
      'Incident Management',
      'Escalation Handling',
      'Deployment Validation',
      'Troubleshooting',
      'Root Cause Analysis (RCA)',
      'Smoke Testing',
      'Kafka Troubleshooting',
      'Documentation & Runbooks',
    ],
  },
  {
    name: 'Technologies & Tools',
    skills: [
      'Java 8',
      'Java 11',
      'Spring Boot',
      'REST APIs',
      'JSON',
      'SQL',
      'Oracle',
      'Microsoft SQL Server (MSSQL)',
      'MySQL',
      'Linux',
      'Postman',
      'Jira',
    ],
  },
  {
    name: 'Web & Integration Technologies',
    skills: [
      'API Debugging',
      'HTTP Status Codes',
      'Browser Developer Tools',
      'Network & Console Debugging',
      'SSO / SAML Exposure',
      'Webhooks',
      'CRM / ITSM Integration Exposure',
    ],
  },
  {
    name: 'Databases',
    skills: [
      'PostgreSQL (Basic Knowledge)',
      'Oracle SQL Developer',
      'MySQL',
    ],
  },
]

export const serviceMarkets = [
  'Australia',
  'Europe',
  'Russia',
  'Canada',
  'Argentina',
  'Japan',
  'Egypt',
  'Dubai, United Arab Emirates',
  'South Africa',
]

export const profileDescription =
  'Freelance Java and Spring Boot developer providing remote backend engineering, application support, production support, incident management, API integration, and SQL database assistance for international teams.'
