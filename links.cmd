SET odir=%cd%
call rimraf .\build\controller
cd ..
SET dir=%cd%
ECHO %dir%
mklink /d %dir%\dbkoda\build\controller %dir%\dbkoda-controller
cd %dir%\dbkoda\build\controller
call yarn unlink
call yarn link
cd %odir%
call yarn link "@southbanksoftware/dbkoda-controller"
cd %dir%
call rimraf .\dbkoda-controller\public\ui
mklink /d %dir%\dbkoda-controller\public\ui %dir%\dbkoda-ui\dist\ui
call rimraf .\dbkoda\src\tests\tree\actions\uiDefinitions
mkdir .\dbkoda\src\tests\tree\actions\uiDefinitions
mklink /d %dir%\dbkoda\src\tests\tree\actions\uiDefinitions\ddd %dir%\dbkoda-ui\src\components\TreeActionPanel\DialogDefinitions
mklink /d %dir%\dbkoda\src\tests\tree\actions\uiDefinitions\inputAndTest %dir%\dbkoda-ui\src\components\TreeActionPanel\tests
cd %odir%
SET dir=
SET odir=
