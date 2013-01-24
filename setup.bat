@echo off
set RQ_DIR=%~dp0
set HOME=%HOMEDRIVE%%HOMEPATH%
set MONGORC=.mongorc.js
set RQ_JS=rq.js
set JSON2_JS=json2.js
echo Checking "%HOME%\%MONGORC%"
if not exist "%HOME%\%MONGORC%" (goto :createMongoRC) else (goto:fileFound)

:createMongoRC
echo Creating .mongorc.js file..
goto addScript

:fileFound
echo "%HOME%\%MONGORC%" exists
echo Checking %EVAL_SCRIPT% in %HOME%\%MONGORC%
findstr /M /I %RQ_JS% "%HOME%\%MONGORC%"
if %errorlevel%==0 (
echo %RQ_JS% already found in file 
goto copyFiles
) else (
echo adding script for loading %RQ_JS%
goto addScript
)

:addScript
echo eval("load('%RQ_JS%')") >> "%HOME%\%MONGORC%"
echo eval("load('%JSON2_JS%')") >> "%HOME%\%MONGORC%"
echo Copying files to %HOME%
goto copyFiles

:copyFiles
echo copying %RQ_JS%
copy /Y %RQ_JS% "%HOME%"
echo copying %RQ_JS%
copy /Y %JSON2_JS% "%HOME%"
goto done

:done
echo Done.




