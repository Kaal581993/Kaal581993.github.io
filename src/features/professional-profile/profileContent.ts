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
      'Java 17',
      'Spring Boot',
      'Spring Data JPA',
      'Hibernate',
      'REST APIs',
      'JSON',
      'SQL',
      'Oracle',
      'Microsoft SQL Server (MSSQL)',
      'MySQL',
      'PostgreSQL',
      'Linux',
      'Postman',
      'Jira',
      'Apache Kafka',
      'Docker',
      'AWS Cloud Storage',
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
      'HL7 / FHIR Healthcare Integrations',
      'RabbitMQ',
      'ActiveMQ',
    ],
  },
  {
    name: 'Databases',
    skills: [
      'PostgreSQL (Basic Knowledge)',
      'Oracle SQL Developer',
      'MySQL',
      'SQL Performance Tuning',
      'Schema Design',
    ],
  },
]

export interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  highlights: string[]
}

export const projects: Project[] = [
  {
    id: 'fitness-microservices',
    title: 'Fitness Microservices API',
    description: 'Architected and developed a scalable backend using Java Spring Boot Microservices architecture with asynchronous messaging and event-driven communication using Apache Kafka.',
    techStack: ['Java Spring Boot', 'Apache Kafka', 'Spring Data JPA', 'Hibernate', 'AWS Cloud Storage'],
    highlights: [
      'Implemented asynchronous messaging and event-driven communication using Apache Kafka',
      'Utilized Spring Data JPA and Hibernate for efficient database operations and persistent storage',
      'Used AWS cloud storage for hosting the application',
      'Built scalable microservices architecture for fitness domain',
    ],
  },
  {
    id: 'ecommerce-inventory',
    title: 'E-Commerce Product Management Module',
    description: 'Designed a modular REST API for inventory and product management using Spring Boot and Java 17 with optimized scalable API designs.',
    techStack: ['Java 17', 'Spring Boot', 'REST APIs', 'SQL', 'AWS Cloud Storage'],
    highlights: [
      'Designed modular REST API for inventory and product management',
      'Optimized scalable API designs for high availability',
      'Performed extensive backend debugging',
      'Used AWS cloud storage for hosting',
    ],
  },
  {
    id: 'enterprise-api-support',
    title: 'Enterprise Application Support & API Troubleshooting',
    description: 'Supported enterprise applications involving REST APIs, backend services, SQL troubleshooting, and production issue resolution with focus on API validation and deployment verification.',
    techStack: ['REST APIs', 'SQL', 'Kafka', 'Production Monitoring', 'RCA'],
    highlights: [
      'API validation, browser-based troubleshooting, deployment verification',
      'Operational monitoring activities and incident response',
      'RCA preparation, escalation handling, customer issue coordination',
      'Production issue resolution across backend services',
    ],
  },
  {
    id: 'microservices-operations',
    title: 'Microservices & Backend Operations',
    description: 'Worked with Java Spring Boot microservices applications and REST API integrations, supporting Dockerized backend environments and service-level troubleshooting.',
    techStack: ['Java Spring Boot', 'Microservices', 'REST APIs', 'Docker', 'Service Troubleshooting'],
    highlights: [
      'Java Spring Boot microservices applications and REST API integrations',
      'Dockerized backend environments support',
      'Service-level troubleshooting activities',
      'Cross-service integration debugging',
    ],
  },
]

export interface ExperienceEntry {
  id: string
  role: string
  company: string
  location: string
  startDate: string
  endDate: string
  description: string
  technologies: string[]
  achievements: string[]
}

export const experience: ExperienceEntry[] = [
  {
    id: 'freelance-consultant',
    role: 'Independent Backend Tech Consultant / Upskilling Phase',
    company: 'Freelance',
    location: 'Remote',
    startDate: 'April 2025',
    endDate: 'Present',
    description: 'Designing and developing independent Java/Spring Boot enterprise microservices to transition infrastructure management skills into scalable product development. Freelanced/Consulted on SQL performance tuning, database optimization, and schema design for local clients/open-source projects.',
    technologies: ['Java', 'Spring Boot', 'Microservices', 'SQL Performance Tuning', 'Database Optimization', 'Schema Design'],
    achievements: [
      'Building enterprise-grade microservices portfolio',
      'SQL performance tuning and optimization for clients',
      'Database schema design consulting',
      'Transitioning from infrastructure to product development',
    ],
  },
  {
    id: 'quest2travel',
    role: 'Support Engineer / Technical Support Engineer',
    company: 'Quest2Travel',
    location: 'Mumbai',
    startDate: 'Sep 2024',
    endDate: 'Apr 2025',
    description: 'Supported enterprise expense management applications in production environments. Managed technical requirements gathering and candidate onboarding for enterprise expense management platforms. Evaluated technical proficiency in SQL, Kafka and API workflows.',
    technologies: ['Oracle SQL', 'UAT', 'Kafka', 'API Troubleshooting', 'Application Support', 'SLA Management'],
    achievements: [
      'Primary liaison between engineering teams and client stakeholders for high-priority escalations',
      'Orchestrated resource allocation consistently exceeding SLA performance targets',
      'Validated technical deployments and conducted root cause analysis',
      'Improved recruitment and training documentation through RCA insights',
    ],
  },
  {
    id: 'eclinicalworks',
    role: 'Technical Account Manager / Technical Support Engineer',
    company: 'eClinicalWorks',
    location: 'Mumbai',
    startDate: 'Jan 2022',
    endDate: 'Mar 2024',
    description: 'Orchestrated technical talent coordination for enterprise healthcare applications and microservices environments for workflows related to Electronic Health Exchange, Carequality and Commonwell. Screened and assessed technical competencies in Java, REST APIs, and HL7/FHIR integrations.',
    technologies: ['REST APIs', 'Kafka', 'RabbitMQ', 'ActiveMQ', 'Microservices', 'MSSQL', 'MySQL', 'HL7', 'FHIR', 'Jira', 'Linux', 'Cloud Monitoring'],
    achievements: [
      'Managed end-to-end communication for critical incidents between global teams and client leadership',
      'Developed comprehensive technical screening guides and operational documentation',
      'Facilitated Agile release cycles ensuring right technical expertise for critical upgrades',
      'Troubleshooting production systems with highest volume of data on cloud',
      'Raw log analysis, performance metrics, intranet documentation flow, alerts monitoring',
    ],
  },
  {
    id: 'restolabs',
    role: 'Software Support Engineer',
    company: 'Restolabs',
    location: 'Remote',
    startDate: 'Oct 2020',
    endDate: 'Dec 2021',
    description: 'Supported SaaS-based web applications and customer onboarding activities. Coordinated with engineering teams for troubleshooting, defect tracking, and issue resolution. Assisted customers during implementation and operational support activities on Kafka.',
    technologies: ['SaaS Support', 'Kafka', 'Customer Onboarding', 'Defect Tracking', 'Engineering Coordination'],
    achievements: [
      'SaaS-based web application support and customer onboarding',
      'Engineering team coordination for troubleshooting and defect resolution',
      'Kafka operational support during implementation',
      'Timely customer communication and issue updates',
    ],
  },
  {
    id: 'contentstack',
    role: 'Customer Success Engineer',
    company: 'Contentstack',
    location: 'Mumbai',
    startDate: 'Feb 2020',
    endDate: 'Aug 2020',
    description: 'Supported Headless CMS integrations and API workflows for enterprise customers based on Content Delivery API and Content Management API. Spearheaded technical staffing and API workflow integration support for Headless CMS enterprise accounts.',
    technologies: ['JavaScript', 'REST APIs', 'Kafka', 'Jira', 'Headless CMS', 'Content Delivery API', 'Content Management API', 'RBAC', 'Authentication'],
    achievements: [
      'Headless CMS integrations and API workflow support for enterprise accounts',
      'Technical staffing for API workflow integration',
      'User authentication and RBAC-based privilege management',
      'Translated client technical needs into engineering requirements',
      'Stakeholder expectation management through technical updates',
    ],
  },
  {
    id: 'ezee-technosys',
    role: 'Technical Support Engineer',
    company: 'eZee Technosys',
    location: 'Surat',
    startDate: 'May 2019',
    endDate: 'Dec 2019',
    description: 'Provided technical troubleshooting support for hospitality (property management) software platforms and global customers. Recording bookings on to the on-premise application from eZee Technosys channel manager.',
    technologies: ['Property Management Systems', 'Channel Manager', 'Door Locking Integration', 'POS/Kiosk Integration', 'SQL', 'On-premise Applications', 'ITIL'],
    achievements: [
      'Hospitality software platform troubleshooting for global customers',
      'Channel manager booking integration',
      'Door locking mechanism and POS/kiosk hardware integration',
      'SQL-based issue diagnosis with local database replication',
      'Escalation management and issue tracking per ITIL framework',
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