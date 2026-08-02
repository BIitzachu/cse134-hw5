module.exports = function (eleventyConfig) {
  // Ship CSS/JS/media/docs as-is under /assets/
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Data-driven projects collection, generated from src/projects/*.njk,
  // rendered through the single shared layouts/project.njk template.
  eleventyConfig.addCollection("projects", (collectionApi) =>
    collectionApi.getFilteredByTag("projects").sort((a, b) => a.data.order - b.data.order)
  );

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
