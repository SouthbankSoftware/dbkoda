THISDIR=$PWD
BUNDLE=${THISDIR}/dbKodaSupportBundle.tar
GBUNDLE=${BUNDLE}.gz
if [ -f ${GBUNDLE} ]; then
    echo "Deleting existing file ${GBUNDLE}"
    rm ${GBUNDLE}
fi
OS=`uname -a|cut -f 1 -d ' '`
if [ ${OS} = 'Darwin' ];then 
    OSX=1
else
    OSX=0
fi
    mongo --version >>/tmp/$$.tmp
    uname -a >>/tmp/$$.tmp

if [ ${OSX} -eq 1 ]; then 
    echo "Running on a mac"
    #system_profiler -detaillevel mini -timeout 2 >/tmp/$$.tmp
    sw_vers >>/tmp/$$.tmp
    cd ~/Library/Application\ Support/dbKoda/logs
    tar cvf ${BUNDLE} `ls -t |head -6`
    
else    
    echo "Running on Linux"
    cd ~/.config/dbKoda/logs
    tar cvf ${BUNDLE} `ls -t |head -6`
fi

cd  ~/.dbKoda 
tar rvf ${BUNDLE} * 
cd /tmp
tar rvf ${BUNDLE} $$.tmp
gzip ${BUNDLE}
echo 
echo "Please forward ${GBUNDLE}  to support@southbanksoftware.com"