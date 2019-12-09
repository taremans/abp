// ESM syntax is supported.
import execa from 'execa';
import fse from 'fs-extra';

(async () => {
  const { projects } = await fse.readJSON('../angular.json');
  const projectNames = Object.keys(projects).filter(project => project !== 'dev-app');

  const packageJson = await fse.readJSON('../package.json');

  projectNames.forEach(project => {
    // do not convert to async
    const { dependencies = {}, peerDependencies = {} } = fse.readJSONSync(
      `../packages/${project}/package.json`,
    );

    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...dependencies,
      ...peerDependencies,
    };
  });

  await fse.writeJSON('../package.json', packageJson, { spaces: 2 });

  try {
    await execa('yarn', ['install', '--ignore-scripts'], {
      stdout: 'inherit',
      cwd: '../',
    });
  } catch (error) {
    console.error(error.stderr);
    process.exit(1);
  }

  process.exit(0);
})();
