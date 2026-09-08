const siteConfig = {
  name: "PhAIL Notes",
  acronym: "PhAIL",
  fullName: "Physical AI Evaluation & Intelligence Ledger",
  personalSite: "https://ziqihuangg.github.io/",
  email: "hello@example.com",
  affiliation: "NTU / MMLab",
  interests: "research interests: video generation evaluation, embodied/world models"
};

document.querySelectorAll("[data-site-name]").forEach((element) => {
  element.textContent = siteConfig.name;
});

document.querySelectorAll("[data-acronym]").forEach((element) => {
  element.textContent = siteConfig.acronym;
});

document.querySelectorAll("[data-full-name]").forEach((element) => {
  element.textContent = siteConfig.fullName;
});

document.querySelectorAll("[data-personal-link]").forEach((element) => {
  element.href = siteConfig.personalSite;
});

document.querySelectorAll("[data-email-link]").forEach((element) => {
  element.href = `mailto:${siteConfig.email}`;
});

document.querySelectorAll("[data-affiliation]").forEach((element) => {
  element.textContent = siteConfig.affiliation;
});

document.querySelectorAll("[data-interests]").forEach((element) => {
  element.textContent = siteConfig.interests;
});

document.title = `${siteConfig.name} - ${siteConfig.fullName}`;