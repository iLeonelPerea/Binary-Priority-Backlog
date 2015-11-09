class base {
  $environment = $::agent_environment
  $job_name = $::jenkins_job_name
  if $::is_vagrant == undef {
    $hosts = hiera('hosts', {})
    create_resources(host, $hosts)
  }
  elsif $::is_vagrant == 'true' {
    $hosts = hiera('dev_hosts', {})
    create_resources(host, $hosts)
  }
  file {'/etc/puppet/puppet.conf':
    content => template('base/puppet.conf.agent'),
    notify => Service['puppet'],
  }
  service {'puppet':
    ensure => running,
    enable => true,
  }
}
