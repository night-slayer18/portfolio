'use strict';

const portfolioConfig = {
  personal: {
    name: "Samanuai",
    firstName: "Samanuai",
    fullName: "Samanuai A",
    handle: "night-slayer18",
    role: "Full-Stack Developer & CLI Architect",
    title: "Founder @OpenSyntaxHQ · Systems & Developer Infrastructure",
    company: "Founder @OpenSyntaxHQ",
    tagline: "I build high-performance terminal tools, developer infrastructure, and distributed systems.",
    bio: "Founder @OpenSyntaxHQ — Architecting CLI/TUI suites, AI-assisted developer tools, and scalable cloud systems.",
    email: "samanuaia257@gmail.com",
    location: "Kochi, Kerala",
    locationFlag: "🇮🇳",
    website: "https://night-slayer.tech",
    domain: "night-slayer.tech",
    githubUsername: "night-slayer18",
    githubOrg: "OpenSyntaxHQ"
  },

  social: {
    github: {
      url: "https://github.com/night-slayer18",
      label: "GitHub",
      icon: "fab fa-github",
      handle: "night-slayer18"
    },
    linkedin: {
      url: "https://www.linkedin.com/in/samanuaia257/",
      label: "LinkedIn",
      icon: "fab fa-linkedin",
      handle: "samanuaia257"
    },
    twitter: {
      url: "https://twitter.com/NiGhTsL93934079",
      label: "Twitter / X",
      icon: "fab fa-x-twitter",
      handle: "@NiGhTsL93934079"
    },
    instagram: {
      url: "https://www.instagram.com/_n_i_g_h_t__s_l_a_y_e_r_/",
      label: "Instagram",
      icon: "fab fa-instagram",
      handle: "_n_i_g_h_t__s_l_a_y_e_r_"
    }
  },

  skills: [
    { name: "TypeScript / JavaScript", level: 95, icon: "fab fa-js" },
    { name: "Go", level: 92, icon: "fab fa-golang" },
    { name: "Python", level: 88, icon: "fab fa-python" },
    { name: "Java / Spring Boot", level: 85, icon: "fab fa-java" },
    { name: "CLI & TUI Architecture", level: 96, icon: "fas fa-terminal" },
    { name: "Model Context Protocol (MCP)", level: 88, icon: "fas fa-brain" },
    { name: "Distributed Systems & Kafka", level: 86, icon: "fas fa-network-wired" },
    { name: "Developer Tooling", level: 94, icon: "fas fa-wrench" }
  ],

  techStack: [
    { name: "TypeScript", icon: "fab fa-js", color: "#3178c6" },
    { name: "Go", icon: "fab fa-golang", color: "#00add8" },
    { name: "Python", icon: "fab fa-python", color: "#3572A5" },
    { name: "Java", icon: "fab fa-java", color: "#b07219" },
    { name: "Docker", icon: "fab fa-docker", color: "#2496ed" },
    { name: "Kafka", icon: "fas fa-stream", color: "#e05d44" }
  ],

  hero: {
    greeting: "Founder @OpenSyntaxHQ",
    title: {
      prefix: "I'm",
      name: "Samanuai",
      role: "Full-Stack Developer & CLI Architect"
    },
    description: "Founder @OpenSyntaxHQ. Building high-performance terminal tools, developer platforms, and distributed systems in Go, TypeScript, Java, and Python. Engineered with clean architecture and zero fluff.",
    cta: {
      primary: { text: "View My Work", href: "#projects", icon: "fas fa-code-branch" },
      secondary: { text: "Resume", href: "resume/resume.pdf", icon: "fas fa-download" }
    },
    codeSnippet: `// samanuai.config.ts
        interface Architect {
          name:  string;
          role:  string;
          org:   string;
          stack: string[];
        }

        const samanuai: Architect = {
          name:  "Samanuai A",
          role:  "Full-Stack Developer & CLI Architect",
          org:   "Founder @OpenSyntaxHQ",
          stack: ["TypeScript", "Go", "Java", "Python"]
        };

        export default samanuai;`
  },

  commandPalette: {
    commands: [
      { id: "home", label: "Go to Home", icon: "fas fa-home", action: "scroll", target: "#home" },
      { id: "projects", label: "View Projects & OpenSyntaxHQ", icon: "fas fa-code-branch", action: "scroll", target: "#projects" },
      { id: "stats", label: "GitHub & Org Stats", icon: "fab fa-github", action: "scroll", target: "#stats" },
      { id: "contact", label: "Connect & Ship", icon: "fas fa-satellite-dish", action: "scroll", target: "#contact" },
      { id: "resume", label: "Download Resume", icon: "fas fa-download", action: "link", target: "resume/resume.pdf" },
      { id: "github", label: "Open GitHub Profile", icon: "fab fa-github", action: "external", target: "https://github.com/night-slayer18" },
      { id: "opensyntax", label: "OpenSyntaxHQ Organization", icon: "fas fa-cube", action: "external", target: "https://github.com/OpenSyntaxHQ" },
      { id: "linkedin", label: "Open LinkedIn", icon: "fab fa-linkedin", action: "external", target: "https://www.linkedin.com/in/samanuaia257/" },
      { id: "email", label: "Send Email", icon: "fas fa-envelope", action: "external", target: "mailto:samanuaia257@gmail.com" },
      { id: "theme", label: "Toggle Theme", icon: "fas fa-sun", action: "theme" }
    ]
  },

  seo: {
    title: "Samanuai — Full-Stack Developer & CLI Architect | Founder @OpenSyntaxHQ",
    description: "Founder @OpenSyntaxHQ. Building AI-powered tools, terminal-native TUI suites, and developer infrastructure in Go, TypeScript, Java, and Python.",
    keywords: "full-stack developer, CLI developer, TUI, OpenSyntaxHQ, Go developer, TypeScript, Java Spring Boot, MCP server, distributed systems, Kochi, India",
    author: "Samanuai A",
    themeColor: "#00d4ff",
    og: {
      type: "website",
      url: "https://night-slayer.tech",
      title: "Samanuai — Full-Stack Developer & CLI Architect",
      description: "Founder @OpenSyntaxHQ. Building AI-powered tools, TUI suites, and developer infrastructure.",
      image: "https://night-slayer.tech/images/og-image.jpg"
    },
    twitter: {
      card: "summary_large_image",
      url: "https://night-slayer.tech",
      title: "Samanuai — Full-Stack Developer & CLI Architect",
      description: "Founder @OpenSyntaxHQ. Building AI-powered tools, TUI suites, and developer infrastructure.",
      image: "https://night-slayer.tech/images/og-image.jpg"
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = portfolioConfig;
}
