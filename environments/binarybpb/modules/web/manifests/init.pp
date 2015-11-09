class web {
  package {['git']:}


  nginx::resource::vhost { 'binarybpb.com':
    www_root => '/opt/binarybpb.com',
  }


  vcsrepo { '/opt/binarybpb.com':
    ensure     => latest,
    provider   => git,
    source     => 'https://github.com/iLeonelPerea/Binary-BPB',
    submodules => false,
    revision   => 'development'
  }
}
