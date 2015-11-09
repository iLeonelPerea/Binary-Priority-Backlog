#!/bin/sh

# This script will make sure that a puppet_master service
# gets installed in the server where the script is executed

# To run the script:
#
# /// To install puppetmaster for environment iaas.
# If env is not provided only puppetmaster service will be installed.
# ./provisioner.sh master iaas
#
# /// To install normal agent
# ./provisioner.sh

txtrst=$(tput sgr0) # Text reset
txtred=$(tput setaf 1) # Red
txtgrn=$(tput setaf 2) # Green
txtylw=$(tput setaf 3) # Yellow
txtblu=$(tput setaf 4) # Blue
txtbld=$(tput bold)

if [ "$1" = "master" ];
then
    echo "Will install Master"
    package="puppetmaster"
    manifest="site.pp"
    env_parameter="--environment $2"
    environment=${env_parameter:-}
    iaasrepo="https://AAlvz:a3ce3870e2511de8eefba33227f88e11e9f7638c@github.com/AAlvz/iaas.git"
else
    echo "Will install Agent"
    package="puppet"
    manifest="site.pp" # the manifest may change in the future
    hostname=$(hostname)

cat > /opt/init.pp <<EOF
class base {
  \$environment = \$::agent_environment
  \$job_name = \$::jenkins_job_name
  if \$::is_vagrant == undef {
    \$hosts = hiera('hosts', {})
    create_resources(host, \$hosts)
  }
  elsif \$::is_vagrant == 'true' {
    \$hosts = hiera('dev_hosts', {})
    create_resources(host, \$hosts)
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
EOF

cat > /opt/hiera.yaml <<EOF
---
:backends:
  - yaml
:yaml:
  :datadir: "/etc/puppet/iaas/hieradata"
:hierarchy:
  - "%{::environment}/node/%{::hostname}"
  - "%{::environment}/hosts"
  - "node/%{::hostname}"
  - "hosts"
EOF

cat > /opt/hosts.yaml <<EOF
hosts:
  puppetmaster:
    ip:
      - "192.241.130.112"
    comment: Created by Puppets
    host_aliases:
      - puppetmaster.dominio
  "%{::hostname}":
    ip: "%{::ipaddress_eth0}"
    comment: Created by Puppet
dev_hosts:
  dev.puppetmaster:
    ip:
      - "192.168.33.10"
    comment: Created by Puppets
    host_aliases:
      - dev.puppetmaster
  "%{::hostname}":
    ip: "%{::ipaddress_eth0}"
    comment: Created by Puppet
classes:
  - base
EOF

cat > /opt/puppet.conf.agent <<EOF
[main]
<% if ! @job_name -%>
confdir=/etc/puppet/iaas
environmentpath=$confdir/environments
<% end -%>
logdir=/var/log/puppet
vardir=/var/lib/puppet
ssldir=/var/lib/puppet/ssl
rundir=/var/run/puppet
factpath=$vardir/lib/facter
prerun_command=/etc/puppet/etckeeper-commit-pre
postrun_command=/etc/puppet/etckeeper-commit-post
user=puppet
group=puppet
server=puppetmaster
[master]
ssl_client_header=SSL_CLIENT_S_DN
ssl_client_verify_header=SSL_CLIENT_VERIFY
[agent]
<% if @job_name -%>
certname=<%= @job_name %>
<% end -%>
report=true
graph=true
runinterval=10m
<% if @environment -%>
environment=<%= @environment %>
<% end -%>
EOF

fi

is_sudo()
{
    echo "Verifying sudo"
    if [ "$(whoami)" != 'root' ];
    then
        echo "Currently you are user $(whoami) \n${txtbld}${txtred}PLEASE RUN AS SUDO.${txtrst}"
        exit 1
    else
        return 0
    fi
}

is_installed()
{
    dpkg -s $package > /dev/null
    installed=$?
    if [ ! $installed -eq "0" ];
    then
        echo "$package not installed."
        return 1
    else
        echo "$package already installed."
        return 0
    fi
}

install_puppet()
{
    if ! is_installed;
    then
        echo "${txtblu}Installing $package package${txtrst}"
        apt-get update --fix-missing && apt-get install -y $package
    fi
}

install_dependencies()
{
    echo "${txtblu}Installing dependencies${txtrst}"
    apt-get install -y git
    dpkg -s git > /dev/null
    git_installed=$?
    if [ ! $git_installed -eq "0" ];
    then
        install_dependencies
    fi
}

prepare_puppet_files()
{

    is_installed

    # Make sure Manifests and Module files are
    # in the puppet path. /etc/puppet/{modules,manifests}

    # This will be done cloning the repository with the
    # proper files (puppetmaster modules and manifests)
    # into the puppet config path.

    # Vagrant Environment.
    # As a first version, the cloning will be replaced copying
    # the files located in /vagrant into the puppet path.
    echo "Copying modules and manifests folders"
    virtual=`facter virtual`
    if [ ! "$virtual" = "virtualbox" ]
    then
        if [ "$package" = "puppetmaster" -a "$environment" = "--environment iaas" ]
        then
            echo "${txtblu} Preparing puppetMASTER files${txtrst}"
            if [ ! -d "/etc/puppet/iaas" ]
            then
                git clone $iaasrepo /etc/puppet/iaas
            fi
        else
            echo "${txtblu} Preparing puppet agent files${txtrst}"
            mkdir -p /etc/puppet/modules
            mkdir -p /etc/puppet/modules/base/
            mkdir -p /etc/puppet/modules/base/manifests
            mkdir -p /etc/puppet/modules/base/templates
            mkdir -p /etc/puppet/iaas/
            mkdir -p /etc/puppet/iaas/hieradata/
            mv /opt/init.pp /etc/puppet/modules/base/manifests/init.pp
            mv /opt/hiera.yaml /etc/puppet/hiera.yaml
            mv /opt/puppet.conf.agent /etc/puppet/modules/base/templates/puppet.conf.agent
            mv /opt/hosts.yaml /etc/puppet/iaas/hieradata/hosts.yaml
        fi
    else
        echo "${txtblu} Virtual machine. Vagrantfile will rise.${txtrst}"
    fi
}

provision_server()
{
    if [ ! "$virtual" = "virtualbox" ]
    then
        if [ "$package" = "puppetmaster" ]
        then
            puppet apply /etc/puppet/iaas/manifests/$manifest --modulepath=/etc/puppet/iaas/environments/iaas/modules/ --hiera_config /etc/puppet/iaas/hiera.yaml $environment
        else
            puppet apply --modulepath=/etc/puppet/modules -e "include base"
        fi
    fi
}

main()
{
    install_dependencies
    install_puppet
    prepare_puppet_files
    provision_server
}

# This script should run as super user.
is_sudo
main
