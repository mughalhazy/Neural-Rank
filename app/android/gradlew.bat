@echo off
setlocal
set "JAVA_HOME=D:\MobileDev\Android\Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "GRADLE_USER_HOME=D:\MobileDev\Gradle"
set "ANDROID_HOME=D:\MobileDev\Android\SDK"
set "ANDROID_SDK_ROOT=D:\MobileDev\Android\SDK"
set "TEMP=D:\MobileDev\Temp"
set "TMP=D:\MobileDev\Temp"
set "GRADLE_OPTS=-Djava.io.tmpdir=D:\MobileDev\Temp -Dkotlin.daemon.runFilesPath=D:\MobileDev\KotlinDaemon"
call "D:\MobileDev\GradleManual\gradle-8.14\bin\gradle.bat" %*
endlocal
