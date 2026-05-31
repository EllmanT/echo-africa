export const navItems = [
  { name: "About", link: "#about" },
  { name: "Projects", link: "#projects" },
  { name: "Testimonials", link: "#testimonials" },
  { name: "Contact", link: "#contact" },
];

export const gridItems = [
  {
    id: 1,
    title: "We build things that actually get used.",
    description: "",
    className: "lg:col-span-3 md:col-span-6 md:row-span-4 lg:min-h-[60vh]",
    imgClassName: "w-full h-full",
    titleClassName: "justify-end",
    img: "/b1.svg",
    spareImg: "",
  },
  {
    id: 2,
    title: "We work with clients across Zimbabwe and Africa.",
    description: "",
    className: "lg:col-span-2 md:col-span-3 md:row-span-2",
    imgClassName: "",
    titleClassName: "justify-start",
    img: "",
    spareImg: "",
  },
  {
    id: 3,
    title: "Our Tech Stack",
    description: "Tools we build with",
    className: "lg:col-span-2 md:col-span-3 md:row-span-2",
    imgClassName: "",
    titleClassName: "justify-center",
    img: "",
    spareImg: "",
  },
  {
    id: 6,
    title: "Ready to work with us?",
    description: "",
    className: "lg:col-span-2 md:col-span-3 md:row-span-1",
    imgClassName: "",
    titleClassName: "justify-start",
    img: "/grid.svg",
    spareImg: "/b4.svg",
  },

  {
    id: 5,
    title: "AI Automation for African Businesses",
    description: "Now available",
    className: "md:col-span-3 md:row-span-2 ",
    imgClassName: "absolute right-0 bottom-0 md:w-96 w-60",
    titleClassName: "justify-center md:justify-start lg:justify-center",
    img: "/b5.svg",
    spareImg: "/grid.svg",
  },
  {
    id: 4,
    title: "Zero risk. You only pay when you're satisfied.",
    description: "",
    className: "lg:col-span-2 md:col-span-3 md:row-span-1",
    imgClassName: "",
    titleClassName: "justify-center md:max-w-full max-w-60 text-center",
    img: "",
    spareImg: "",
  },
];

export const projects = [
  {
    id: 1,
    title: "Faramatsi Motors",
    des: "Website for a motor dealership in Harare. Clean, fast, and works on any device.",
    img: "/website-images/faramatsimotors-preivew.png",
    iconLists: [],
    link: "https://faramatsimotors.co.zw",
  },
  {
    id: 2,
    title: "Faramatsi Toyota",
    des: "Website for Zimbabwe's Toyota dealership. Modern design with AI features the client team loved.",
    img: "/website-images/faramatsitoyota-preview.png",
    iconLists: [],
    link: "https://faramatsitoyota.co.zw",
  },
  {
    id: 3,
    title: "Mosalex Group",
    des: "Website for a growing Zimbabwean business group. Built to look professional and win new clients.",
    img: "/website-images/mosalex-preview.png",
    iconLists: [],
    link: "https://mosalexgroup.com",
  },
  {
    id: 4,
    title: "Thee Art Crafts",
    des: "Website built to show off their craft and bring in more customers.",
    img: "/website-images/theeartcrafts-preview.png",
    iconLists: [],
    link: "https://theeartcrafts.com",
  },
  {
    id: 5,
    title: "Business Automation with AI",
    des: "We automate the tasks your team does by hand every day. Document processing, reporting, scheduling — handled by AI so your team can focus on real work.",
    img: "/b5.svg",
    iconLists: [],
    link: "mailto:tmuranda1@gmail.com",
  },
];

export const testimonials = [
  {
    quote:
      "Great work on the website — we’re really pleased with how it turned out. The AI features were a nice touch we didn’t expect.",
    name: "Faramatsi Motors",
    title: "Motor Dealership, Harare",
  },
  {
    quote:
      "We appreciated the use of modern technology in the site. Clean, professional, and exactly what we needed.",
    name: "Faramatsi Toyota",
    title: "Toyota Dealership, Zimbabwe",
  },
  {
    quote:
      "The website design exceeded our expectations. The team understood our brand immediately.",
    name: "Thee Art Crafts",
    title: "Creative Business, Zimbabwe",
  },
  {
    quote:
      "Professional service from start to finish. We’re proud to share our new website with clients.",
    name: "Mosalex Group",
    title: "Business Group, Zimbabwe",
  },
  {
    quote:
      "Really happy with the logo work. Clean, strong, and represents our brand well.",
    name: "Kolkart Mining",
    title: "Mining Company, Zimbabwe",
  },
  {
    quote:
      "Reliable, knowledgeable, and always quick to help. The support we received was exceptional.",
    name: "Fiscalisation Client",
    title: "Business Support, Harare",
  },
];

// CLIENT LOGOS — Owner to replace placeholder paths with actual logo files.
// Logos should be PNG with transparent background, ~200px wide.
export const companies = [
  {
    id: 1,
    name: "Faramatsi Motors",
    img: "/client-logos/fm-motorslogo.png",
    nameImg: "/client-logos/fm-motorslogo.png",
  },
  {
    id: 2,
    name: "Mosalex Group",
    img: "/client-logos/mosalex-logo.png",
    nameImg: "/client-logos/mosalex-logo.png",
  },
  {
    id: 3,
    name: "Thee Art Crafts",
    img: "/client-logos/theeartcraftslogo-light.PNG",
    nameImg: "/client-logos/theeartcraftslogo-light.PNG",
  },
  {
    id: 4,
    name: "Kolkart Mining",
    // PLACEHOLDER — owner to replace with final Kolkart Mining logo file
    img: "/client-logos/kolkart_mining-clean.png",
    nameImg: "/client-logos/kolkart_mining-clean.png",
  },
  {
    id: 5,
    name: "Excogitate",
    img: "/client-logos/excogitate_logo-clean.png",
    nameImg: "/client-logos/excogitate_logo-clean.png",
  },
  {
    id: 6,
    name: "Allea Worldwide",
    img: "/client-logos/alleaworldwide-logo.png",
    nameImg: "/client-logos/alleaworldwide-logo.png",
  },
  {
    id: 7,
    name: "Faramatsi Toyota",
    img: "/client-logos/fmtoyota-logo.png",
    nameImg: "/client-logos/fmtoyota-logo.png",
  },
];

export const workExperience = [
  {
    id: 1,
    title: "Founder, Eka",
    desc: "Building websites, AI tools, and automation for African businesses.",
    className: "md:col-span-2",
    thumbnail: "/exp1.svg",
  },
  {
    id: 2,
    title: "Fiscalisation Systems Specialist",
    desc: "Implementation and support of ZIMRA fiscalisation systems for businesses across Zimbabwe. Trusted by multiple clients for technical reliability and rapid response.",
    className: "md:col-span-2",
    thumbnail: "/exp2.svg",
  },
];

export const socialMedia = [
  {
    id: 1,
    img: "/git.svg",
    link: "https://github.com/EllmanT",
  },
  {
    id: 2,
    img: "/twit.svg",
  },
  {
    id: 3,
    img: "/link.svg",
    link: "https://www.linkedin.com/in/tapiwa-muranda-85747b335/",
  },
];
