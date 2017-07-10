#  Pre-requisities: node, npm

npm -g install yarn rimraf
 
git clone https://github.com/SouthbankSoftware/dbKoda
git clone https://github.com/SouthbankSoftware/dbKoda-ui
git clone https://github.com/SouthbankSoftware/dbKoda-controller

cd dbKoda
yarn dev:link

cd ..

for dir in dbKoda-ui dbKoda-controller dbKoda ;do
   ( cd $dir;yarn install  )
done
 
(cd dbKoda-controller; npm rebuild) 

(cd  dbKoda-ui;yarn dev) & 
(cd  dbKoda-controller; yarn dev) & 
(cd  dbKoda; npm run byo) & 

