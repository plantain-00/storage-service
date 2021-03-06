export default {
  include: [
    'dist/*.js',
    'LICENSE',
    'package.json',
    'yarn.lock',
    'README.md'
  ],
  exclude: [
  ],
  askVersion: true,
  releaseRepository: 'https://github.com/plantain-00/storage-service-release.git',
  postScript: [
    // 'cd "[dir]" && rm -rf .git',
    // 'cp Dockerfile "[dir]"',
    // 'cd "[dir]" && docker build -t plantain-00/storage-service . && docker push plantain-00/storage-service',
    'git add package.json',
    'git commit -m "[version]"',
    'git tag v[version]',
    'git push',
    'git push origin v[version]',
  ]
}
