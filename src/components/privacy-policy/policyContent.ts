// app/privacy-policy/policyContent.ts
import {
    Shield,
    Lock,
    Database,
    UserCheck,
    Bell,
    Mail,
    Eye,
    Clock,
    Globe,
    Settings,
    FileLock
} from 'lucide-react';
import { PolicySection, PolicyMetadata } from './types';

export const policyMetadata: PolicyMetadata = {
    version: '2.1.0',
    effectiveDate: '2025-01-15',
    lastModified: '2025-03-01'
};

export const policySections: PolicySection[] = [
    {
        id: "introduction",
        title: "Introduction",
        subtitle: "Our commitment to your privacy",
        icon: Shield,
        lastUpdated: "2025-01-15",
        content: [
            "Welcome to House Edge Blackjack's Privacy Policy. This comprehensive document outlines our commitment to protecting your personal information and data rights while using our platform.",
            "By accessing or using our services, you acknowledge that you have read and understood this Privacy Policy and agree to be bound by its terms and conditions.",
            "We've designed our privacy practices to align with global standards, including GDPR, CCPA, and other applicable data protection regulations.",
            "Our team regularly reviews and updates this policy to ensure it remains accurate, comprehensive, and aligned with evolving privacy standards and regulations.",
            "If you have any questions about this policy or our privacy practices, please don't hesitate to contact our dedicated privacy team using the information provided in the Contact section."
        ]
    },
    {
        id: "data-collection",
        title: "Data Collection",
        subtitle: "Information we gather and why",
        icon: Database,
        lastUpdated: "2025-02-10",
        content: [
            "Personal Information: We collect identification details such as your name, email address, date of birth, and account credentials to verify your identity, enable secure access to our platform, and comply with regulatory requirements.",
            "Gaming Data: Your play history, betting patterns, win/loss records, and performance statistics are collected to provide game functionality, enhance user experience, and maintain game integrity.",
            "Technical Data: We automatically collect device information, IP addresses, browser types, operating systems, and other technical identifiers to ensure optimal performance, troubleshoot issues, and maintain security.",
            "Cookies and Similar Technologies: We use various tracking technologies to remember your preferences, analyze site traffic, personalize content, and enhance site functionality.",
            "Analytics: We gather anonymized usage patterns and behavioral data to improve our services, identify trends, and optimize user experience across our platform.",
            "Financial Information: When you make deposits or withdrawals, we collect and process necessary payment details through our secure, PCI-compliant payment processors.",
            "Communication Data: We record customer service interactions and feedback to improve our support services and maintain records of account-related communications."
        ]
    },
    {
        id: "data-usage",
        title: "Use of Data",
        subtitle: "How we leverage your information",
        icon: UserCheck,
        lastUpdated: "2025-02-15",
        content: [
            "Service Delivery: We use your data to provide, maintain, and improve our blackjack platform, including game functionality, account management, and customer support.",
            "Performance Analytics: Your gameplay data helps us optimize game mechanics, identify potential issues, implement improvements, and enhance overall user experience.",
            "Personalization: We analyze your preferences and behavior to customize your gaming experience, provide tailored recommendations, and deliver relevant content.",
            "Communication: Your contact information allows us to send important service announcements, account notifications, and (with your consent) marketing communications.",
            "Security and Fraud Prevention: We leverage collected data to verify identities, detect suspicious activities, prevent fraudulent transactions, and protect our platform integrity.",
            "Compliance: We process certain information to fulfill our legal obligations, including age verification, anti-money laundering checks, and responsible gambling measures.",
            "Business Operations: Aggregated and anonymized data helps inform our business decisions, product development, and strategic planning efforts."
        ]
    },
    {
        id: "data-sharing",
        title: "Data Sharing",
        subtitle: "When and how we share your information",
        icon: Globe,
        lastUpdated: "2025-02-20",
        content: [
            "Service Providers: We share data with trusted third-party service providers who perform services on our behalf, such as payment processing, fraud detection, customer support, and analytics.",
            "Business Partners: In limited circumstances, we may share information with strategic partners to offer integrated or co-branded services, always with appropriate safeguards in place.",
            "Legal Requirements: We may disclose information when required by law, legal process, litigation, or governmental authorities with proper jurisdiction.",
            "Business Transfers: In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of the transaction, subject to standard confidentiality arrangements.",
            "With Consent: We will obtain your explicit consent before sharing your personal information for any purpose not covered by this Privacy Policy.",
            "Aggregate Information: We may share anonymized, aggregated information that cannot reasonably be used to identify you with third parties for research, marketing, analytics, and other purposes."
        ]
    },
    {
        id: "data-security",
        title: "Data Security",
        subtitle: "How we protect your information",
        icon: Lock,
        lastUpdated: "2025-01-25",
        content: [
            "Encryption Technologies: We implement industry-standard encryption protocols (TLS/SSL) to secure data transmission and storage across our platform.",
            "Access Controls: We maintain strict internal access policies, role-based permissions, and authentication measures to ensure data is accessible only to authorized personnel.",
            "Regular Security Audits: Our systems undergo continuous security monitoring, vulnerability assessments, and penetration testing by independent security professionals.",
            "Compliance Framework: Our security practices align with GDPR, PCI-DSS, and other relevant regulatory frameworks to ensure comprehensive data protection.",
            "Incident Response Plan: We maintain a robust security incident response protocol to quickly address potential breaches and minimize any possible impact.",
            "Physical Safeguards: Our data centers and facilities incorporate multiple layers of physical security to protect against unauthorized access.",
            "Employee Training: All team members receive regular security awareness training to maintain a strong security culture throughout our organization."
        ]
    },
    {
        id: "user-rights",
        title: "Your Rights",
        subtitle: "Control over your personal data",
        icon: FileLock,
        lastUpdated: "2025-02-01",
        content: [
            "Access Rights: You can request a copy of your personal data that we hold, along with information about how we process it.",
            "Rectification: You may correct or update your personal information at any time through your account settings or by contacting our support team.",
            "Data Portability: You can request your data in a structured, commonly used, and machine-readable format for transfer to another service.",
            "Deletion: In certain circumstances, you can request the erasure of your personal data from our systems (subject to legal retention requirements).",
            "Restriction: You may request that we temporarily or permanently stop processing certain portions of your data.",
            "Objection: You have the right to object to processing of your personal data for certain purposes, such as direct marketing.",
            "Consent Withdrawal: Where processing is based on consent, you can withdraw your consent at any time without affecting the lawfulness of processing based on consent before its withdrawal.",
            "Complaint: You have the right to lodge a complaint with a supervisory authority if you believe your data is being processed unlawfully."
        ]
    },
    {
        id: "cookies",
        title: "Cookies & Tracking",
        subtitle: "How we use tracking technologies",
        icon: Eye,
        lastUpdated: "2025-02-05",
        content: [
            "Essential Cookies: These are necessary for the website to function properly and cannot be disabled. They enable core functionality such as security, network management, and account access.",
            "Performance Cookies: We use these to count visits and traffic sources, measure and improve site performance. They help us understand which pages are the most and least popular.",
            "Functionality Cookies: These enable enhanced functionality and personalization, such as remembering your preferences and settings.",
            "Targeting/Advertising Cookies: These cookies may be set through our site by our advertising partners to build a profile of your interests and show relevant ads on other sites.",
            "Social Media Cookies: Features from social media platforms may set cookies to enhance your experience and enable content sharing.",
            "Analytics Technologies: We employ various analytics tools to understand how users interact with our platform and improve our services accordingly.",
            "Cookie Control: You can manage your cookie preferences through our cookie consent tool or your browser settings at any time."
        ]
    },
    {
        id: "retention",
        title: "Data Retention",
        subtitle: "How long we keep your information",
        icon: Clock,
        lastUpdated: "2025-02-25",
        content: [
            "Account Information: We retain personal information associated with your account for as long as your account remains active, plus a reasonable period to allow for legal compliance and dispute resolution.",
            "Gameplay Data: Historical gameplay information is retained to maintain game integrity, detect patterns of potentially fraudulent activity, and provide historical access to your gaming records.",
            "Transaction Records: Financial transaction data is kept for a minimum of seven years to comply with accounting, tax, and anti-money laundering regulations.",
            "Communication Records: Customer service interactions and communications are retained to provide ongoing support, reference previous issues, and improve our services.",
            "Inactive Accounts: If your account becomes inactive, we will notify you before applying our data minimization procedures, which may include anonymization or deletion of certain personal information.",
            "Legal Requirements: Certain information may be retained for longer periods if required by law, regulation, or legitimate business purposes such as fraud prevention and security.",
            "Deletion Processes: When data is no longer necessary, we employ secure deletion methods to ensure it cannot be recovered or accessed."
        ]
    },
    {
        id: "updates",
        title: "Policy Updates",
        subtitle: "How we communicate changes",
        icon: Bell,
        lastUpdated: "2025-01-20",
        content: [
            "Regular Reviews: Our privacy policy undergoes periodic reviews to ensure accuracy, comprehensiveness, and compliance with evolving regulations and platform features.",
            "Change Notification: We will notify users of significant policy changes through email, in-app notifications, or site banners before they take effect.",
            "Version History: We maintain an accessible archive of previous policy versions to ensure transparency in our privacy practices over time.",
            "Consent Requirements: When required by law or when changes substantially affect your rights and obligations, we may seek your explicit consent to continue using our services.",
            "Effective Date: Each version of our privacy policy clearly indicates when it became effective and when it was last modified.",
            "Explanation of Changes: Major updates will be accompanied by a summary of key changes to help you understand what's new or different.",
            "Feedback Option: We welcome your input on our privacy practices and policy updates through our dedicated privacy feedback channel."
        ]
    },
    {
        id: "contact",
        title: "Contact Information",
        subtitle: "How to reach our privacy team",
        icon: Mail,
        lastUpdated: "2025-01-15",
        content: [
            "Privacy Team: Our dedicated privacy office is available to address your concerns and can be reached at privacy@houseedgeblackjack.com.",
            "Data Requests: To submit a data access, correction, or deletion request, please use our secure data request form in your account settings or email dpo@houseedgeblackjack.com.",
            "Complaint Resolution: If you have a privacy-related complaint, please contact our privacy team first to allow us to address your concerns promptly and thoroughly.",
            "Data Protection Officer: Our DPO can be contacted directly at dpo@houseedgeblackjack.com for matters relating to data protection laws and regulations.",
            "Regulatory Inquiries: For legal and regulatory matters, please direct your correspondence to legal@houseedgeblackjack.com.",
            "Physical Address: House Edge Blackjack Privacy Office, 123 Casino Boulevard, Suite 500, Las Vegas, NV 89109, USA.",
            "Response Time: We aim to respond to all privacy-related inquiries within 72 hours, with complete resolutions provided within 30 days or less."
        ]
    },
    {
        id: "international",
        title: "International Transfers",
        subtitle: "Cross-border data movement",
        icon: Globe,
        lastUpdated: "2025-03-01",
        content: [
            "Global Operations: As a global platform, we may transfer, store, and process your information in countries other than your own.",
            "Data Transfer Safeguards: When transferring data across borders, we implement appropriate safeguards such as Standard Contractual Clauses, adequacy decisions, or other legally approved mechanisms.",
            "EU-US Data Transfers: For transfers from the European Economic Area, we comply with the EU-US Data Privacy Framework and applicable data protection requirements.",
            "International Compliance: We ensure that any international data transfers comply with applicable data protection laws and provide adequate protection for your personal information.",
            "Third-Party Transfers: When we share data with service providers in other countries, we require them to commit to processing data in accordance with our privacy standards and applicable laws.",
            "Transparency: We will inform you about the locations where your data is processed and the safeguards in place to protect it during international transfers.",
            "Data Localization: Where required by local laws, we may store certain data within specific territories or regions to comply with data localization requirements."
        ]
    },
    {
        id: "technical-measures",
        title: "Technical Measures",
        subtitle: "Advanced protection systems",
        icon: Settings,
        lastUpdated: "2025-02-28",
        content: [
            "Infrastructure Security: Our systems are hosted in SOC 2 Type II certified data centers with redundant power, cooling, and network connectivity to ensure continuous operation and data protection.",
            "Encryption Standards: We utilize AES-256 encryption for data at rest and TLS 1.3 for data in transit to protect against unauthorized access and interception.",
            "Authentication Controls: Our platform implements multi-factor authentication, session timeout controls, and account lockout mechanisms to prevent unauthorized access.",
            "Network Protection: We employ enterprise-grade firewalls, intrusion detection systems, and real-time monitoring to defend against network-based threats.",
            "Vulnerability Management: Our security team conducts regular vulnerability scanning, patch management, and security updates to address potential security weaknesses.",
            "Automated Threat Detection: We utilize machine learning and behavioral analytics to identify and respond to unusual activity that may indicate security threats.",
            "Data Loss Prevention: Our systems incorporate controls to prevent unauthorized data exfiltration and accidental data exposure.",
            "Secure Development: All code undergoes security review, static and dynamic analysis, and follows secure coding practices to minimize security vulnerabilities."
        ]
    }
];