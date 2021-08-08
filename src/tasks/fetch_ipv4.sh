#!/bin/bash

network_interfaces_ipv4_length=$(/opt/puppetlabs/bin/facter networking.interfaces --json | jq '[[."networking.interfaces"[]] | map(select(has("ip")))[] | .ip ] | length' -r)
network_interfaces_ipv4_length=$(expr "$network_interfaces_ipv4_length * 1")
ip_array=$(/opt/puppetlabs/bin/facter networking.interfaces --json | jq '[[."networking.interfaces"[]] | map(select(has("ip")))[] | .ip ]')

iterator=0
while [[ "$iterator" -ne "$network_interfaces_ipv4_length" ]]
do
  facter_ip=$(echo $ip_array | jq '.[$a | tonumber]' -r --arg a $iterator)
  echo $facter_ip
  iterator=$((iterator + 1))
done

exit 0
