# Binary BPB
Prototyping Binary BPB

# This is the first prototype for Infrastructure as a Service.

Currently, the vagrant environment is provided.

Make sure to cover the following Requirements:

* Virtualbox
* Vagrant

After this, run:

`vagrant up`

2 Machines will then be created. `puppetmaster` and `agent`

To fetch and apply the configurations on the agent run:

`puppet agent -t --environment {$environment}` *default environment set to production

All the data and classes are provided by Hiera.

Modules should be located in `environments/{$environment}/modules`

Node classes are now assigned in `hieradata/{$environment}/node/{hostname}.yaml`
under the `classes` key
