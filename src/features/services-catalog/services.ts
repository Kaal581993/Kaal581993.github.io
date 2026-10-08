export interface ServiceItem {
  name: string
  summary: string
  estimate: string
}

export const services: ServiceItem[] = [
  { name: 'AI-based project', summary: 'Applied AI features, model/API integration, and automation workflows.', estimate: '₹25,000–₹1,20,000+' },
  { name: 'Backend web application', summary: 'Secure APIs, application logic, integrations, and production-ready setup.', estimate: '₹20,000–₹80,000+' },
  { name: 'Web designing', summary: 'Responsive interface design and frontend implementation.', estimate: '₹8,000–₹30,000+' },
  { name: 'Microservices project', summary: 'Service boundaries, REST messaging, Kafka/RabbitMQ, and deployment support.', estimate: '₹30,000–₹1,50,000+' },
  { name: 'SQL database programming', summary: 'Schema design, SQL queries, stored procedures, and query optimization.', estimate: '₹5,000–₹25,000+' },
]
