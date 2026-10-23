module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("assets");

    // Copy only dependency assets referenced directly from templates.
    eleventyConfig.addPassthroughCopy({
        "node_modules/bootstrap/dist": "node_modules/bootstrap/dist",
        "node_modules/font-awesome": "node_modules/font-awesome",
        "node_modules/jquery/dist": "node_modules/jquery/dist",
        "node_modules/animejs/lib": "node_modules/animejs/lib",
        "node_modules/underscore": "node_modules/underscore",
        "node_modules/mathjax/es5": "node_modules/mathjax/es5",
        "node_modules/pseudocode/build": "node_modules/pseudocode/build",
    });

    return {
        passthroughFileCopy: true,
    };
};