module.exports = {
  title: "Ben Anderson Portfolio",
  author: "Ben Anderson",
  // Replace with your real deployed URL once the site is live on Netlify/Cloudflare —
  // this is used to build absolute links in sitemap.xml.
  url: "https://ben-anderson-portfolio.example.com",
  favicon: "/assets/img/2.png",
  email: "bla002@ucsd.edu",
  github: {
    label: "biitzachu",
    url: "https://github.com/biitzachu",
  },
  linkedin: {
    label: "Ben Anderson",
    url: "https://www.linkedin.com/in/benjamin-anderson-891560266/",
  },
  year: new Date().getFullYear(),
  nav: [
    { text: "Home", url: "/" },
    { text: "About Me", url: "/aboutme/" },
    { text: "Projects", url: "/projects/" },
    { text: "Contact", url: "/contact/" },
    { text: "Resume", url: "/resume/" },
    { text: "Experiments", url: "/experiments/" },
    { text: "Search", url: "/search/" },
  ],
};
