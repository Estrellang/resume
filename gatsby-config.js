const normalizePathPrefix = value => {
  if (!value || value === '/') return '/';
  return `/${value.replace(/^\/+|\/+$/g, '')}`;
};

const owner = process.env.GATSBY_SITE_OWNER || 'Estrellang';
const repositoryUrl =
  process.env.GATSBY_REPOSITORY_URL || 'https://github.com/Estrellang/resume';

module.exports = {
  pathPrefix: normalizePathPrefix(process.env.GATSBY_PATH_PREFIX || '/resume'),
  siteMetadata: {
    title: 'Resume Generator',
    siteUrl:
      process.env.GATSBY_SITE_URL || 'https://estrellang.github.io/resume/',
    githubUrl: repositoryUrl,
    author: owner,
    contact: `https://github.com/${owner}`,
  },
  flags: {
    DEV_SSR: false,
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-antd',
      options: {
        style: true,
      },
    },
    {
      resolve: 'gatsby-plugin-less',
      options: {
        strictMath: true,
        lessOptions: {
          javascriptEnabled: true,
          modifyVars: {
            'font-family': 'roboto-regular, Arial',
            'primary-color': '#2f5785',
          },
        },
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
    'gatsby-plugin-pnpm',
  ],
};
