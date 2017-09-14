#
# Collect logs and other information for dbKoda support 
# 
cd ~\.dbKoda  
systeminfo >systeminfo.txt
mongo --version >>systeminfo.txt
Compress-Archive -Force -Path * -DestinationPath ~\.dbKoda\dbKodaSupport.zip 
cd ~\AppData\Roaming\dbKoda\logs
gci . | sort LastWriteTime | select -last 4 | Foreach-Object {
    Compress-Archive -Update -Path $_ -DestinationPath ~\.dbKoda\dbKodaSupport.zip
}
Write-Host "Please send ~\.dbKoda\dbKodaSupport.zip to support@southbanksoftware.com"
Write-Host "Press any key to continue"
Read-Host
