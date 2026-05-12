module.exports = {
  hooks: {
    readPackage(pkg) {
      // Force copy-webpack-plugin to use serialize-javascript 7.0.5
      if (pkg.dependencies && pkg.dependencies['serialize-javascript']) {
        pkg.dependencies['serialize-javascript'] = '^7.0.5';
      }
      return pkg;
    }
  }
};
