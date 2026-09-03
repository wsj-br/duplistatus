module.exports = {
  hooks: {
    readPackage(pkg) {
      // Force copy-webpack-plugin to use serialize-javascript 7.0.5
      if (pkg.dependencies && pkg.dependencies['serialize-javascript']) {
        pkg.dependencies['serialize-javascript'] = '^7.0.5';
      }
      // Range overrides do not rematch existing lockfile pins (cheerio → undici@8.5.0,
      // @svgr/plugin-svgo + postcss-svgo → svgo@4.0.1). Force patched versions here.
      if (pkg.dependencies && pkg.dependencies.undici) {
        pkg.dependencies.undici = '8.10.1';
      }
      if (pkg.dependencies && pkg.dependencies.svgo) {
        pkg.dependencies.svgo = '4.1.0';
      }
      // image-size is archived at 2.0.2 with no patched release (GHSA-w3rx-r6r6-pgpr,
      // GHSA-5p2g-fcmc-qvqq). Use the API-compatible community fork.
      if (pkg.dependencies && pkg.dependencies['image-size']) {
        pkg.dependencies['image-size'] = 'npm:image-size-next@2.1.1';
      }
      return pkg;
    }
  }
};
