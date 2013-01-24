@echo off
set RQ_DIR=%~dp0
set HOME=%HOMEDRIVE%%HOMEPATH%
set MONGORC=.mongorc.js
set RQ_JS=rq.js
set JSON2_JS=json2.js
set RQ_EVAL_SCRIPT=eval("load('%RQ_DIR%rq.js')") 
set JSON_EVAL_SCRIPT=eval("load('%RQ_DIR%json2.js')") 
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
set loadRQ=%RQ_EVAL_SCRIPT:\=/%
set loadJSON=%JSON_EVAL_SCRIPT:\=/%
echo %loadRQ% >> "%HOME%\%MONGORC%"
echo %loadJSON% >> "%HOME%\%MONGORC%"
goto :done

:copyFiles
echo copying %RQ_JS%
copy /Y %RQ_JS% "%HOME%"
echo copying %RQ_JS%
copy /Y %JSON2_JS% "%HOME%"
goto done

:done
echo Done.




