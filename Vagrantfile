# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

def standard_machine(config, hostname, ip)

  config.vm.define hostname do |config|
    config.vm.box = 'debian8.0'
    config.vm.box_url = 'https://github.com/holms/vagrant-jessie-box/releases/download/Jessie-v0.1/Debian-jessie-amd64-netboot.box'
    hostname.include?(".") ? config.vm.host_name = "#{hostname.split('.')[1]}" : config.vm.host_name = "#{hostname}"
    config.vm.network :private_network, ip: ip
    config.vm.provider :virtualbox do |vb|
      vb.customize ["modifyvm", :id, "--cpus", 1]
      # Work around https://www.virtualbox.org/ticket/11649
      vb.customize ['modifyvm', :id, '--natdnshostresolver1', 'on']
    end

    config.vm.synced_folder ".", "/etc/puppet/iaas"
    config.vm.synced_folder ".", "/opt"
    config.vm.provision "shell" do |s|
      s.path = 'provisioner.sh'
      if "#{hostname.split('.')[1]}" == 'puppetmaster'
        s.args = ["master", "#{hostname.split('.')[0]}"]
      end
    end

    config.vm.provision :puppet do |puppet|
      puppet.manifests_path = 'manifests'
      puppet.manifest_file = 'site.pp'
      puppet.working_directory = "/tmp/vagrant-puppet"
      puppet.hiera_config_path = "hiera.yaml"
      puppet.environment_path = "environments"
      puppet.environment = "#{hostname.split('.')[0]}"
      puppet.facter = {
        "agent_environment" => "#{hostname.split('.')[0]}",
        "is_vagrant" => "true"
      }
      if hostname.include? "."
        puppet.module_path = ['modules', "environments/#{hostname.split('.')[0]}/modules"]
      else
        puppet.module_path = ['modules', "environments/development/modules"]
      end
    end

    yield(config) if block_given?
  end
end

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  standard_machine config, 'binarybpb.web', '192.168.33.10'
end
