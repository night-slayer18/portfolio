const portfolioConfig = {
  personal: {
    name: "Samanuai",
    firstName: "Samanuai",
    fullName: "Samanuai A",
    role: "Full Stack Developer",
    fullRole: "Full-Stack Developer",
    company: null,
    tagline: "Crafting digital experiences with cutting-edge technologies.",
    bio: "Full Stack Developer",
    email: "samanuaia257@gmail.com",
    location: "Kochi, Kerala",
    responseTime: "Within 24 hours",
    status: "Available for opportunities",
    website: "https://night-slayer.tech",
    domain: "night-slayer.tech"
  },
  social: {
    github: {
      url: "https://github.com/night-slayer18",
      label: "GitHub",
      icon: "fab fa-github"
    },
    linkedin: {
      url: "https://www.linkedin.com/in/samanuaia257/",
      label: "LinkedIn",
      icon: "fab fa-linkedin"
    },
    twitter: {
      url: "https://twitter.com/NiGhTsL93934079",
      label: "Twitter",
      icon: "fab fa-twitter"
    },
    instagram: {
      url: "https://www.instagram.com/_n_i_g_h_t__s_l_a_y_e_r_/",
      label: "Instagram",
      icon: "fab fa-instagram"
    }
  },
  stats: {
    projects: {
      count: 47,
      label: "Projects Completed"
    },
    experience: {
      count: 1,
      label: "Years Experience"
    },
    technologies: {
      count: 15,
      label: "Technologies"
    }
  },
  skills: [
    "AI/ML Development",
    "Multi-Tenant Systems",
    "Developer Tools & CLI",
    "Full-Stack Development",
    "Clean Architecture"
  ],
  techIcons: [
    { name: "Python", icon: "fab fa-python" },
    { name: "Go", icon: "fab fa-golang" },
    { name: "JavaScript", icon: "fab fa-js" },
    { name: "TypeScript", icon: "fab fa-js-square" }
  ],
  hero: {
    greeting: "Hello World! 👋",
    title: {
      prefix: "I'm",
      name: "Samanuai",
      role: "Full Stack Developer"
    },
    description: "Full Stack Developer building AI-powered solutions, multi-tenant systems, and developer tools. Passionate about clean architecture, open-source, and creating tools that solve real-world problems.",
    cta: {
      text: "View My Work",
      href: "#projects",
      icon: "fas fa-arrow-down"
    },
    codeEditor: {
      filename: "main.ts",
      code: `interface Developer {
    name: string;
    role: string;
    skills: string[];
} 

const profile: Developer = {
    name: "Samanuai",
    role: "Full Stack Developer",
    skills: [
        "AI/ML Development",
        "Multi-Tenant Systems",
        "Developer Tools & CLI",
        "Clean Architecture"
    ]
};`
    }
  },
  seo: {
    title: "Samanuai - Full Stack Developer",
    description: "Full Stack Developer building AI-powered solutions, multi-tenant systems, and developer tools. Specializing in clean architecture, open-source, and enterprise solutions.",
    keywords: "full-stack developer, AI/ML developer, multi-tenant systems, developer tools, Go developer, TypeScript, Python, open-source contributor, agentic AI, database management",
    author: "Samanuai",
    themeColor: "#667eea",
    og: {
      type: "website",
      url: "https://night-slayer.tech",
      title: "Samanuai - Full Stack Developer",
      description: "Full Stack Developer building AI-powered solutions, multi-tenant systems, and developer tools. Specializing in clean architecture, open-source, and enterprise solutions.",
      image: "https://night-slayer.tech/images/og-image.jpg"
    },
    twitter: {
      card: "summary_large_image",
      url: "https://night-slayer.tech",
      title: "Samanuai - Full Stack Developer",
      description: "Full Stack Developer building AI-powered solutions, multi-tenant systems, and developer tools. Specializing in clean architecture, open-source, and enterprise solutions.",
      image: "https://night-slayer.tech/images/og-image.jpg"
    }
  },
};
if (typeof module !== 'undefined' && module.exports) {
  module.exports = portfolioConfig;
}
