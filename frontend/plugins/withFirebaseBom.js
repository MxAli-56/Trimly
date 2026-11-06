
const { withProjectBuildGradle } = require('@expo/config-plugins');

const FIREBASE_BOM = '34.19.0';

module.exports = function withFirebaseBom(config) {
  return withProjectBuildGradle(config, (config) => {
    const marker = '// Trimly Firebase BoM override';

    if (!config.modResults.contents.includes(marker)) {
      config.modResults.contents =
        `${marker}
project.ext {
  set('react-native', [
    versions: [
      firebase: [
        bom: "${FIREBASE_BOM}"
      ]
    ]
  ])
}

${config.modResults.contents}`;
    }

    return config;
  });
};
