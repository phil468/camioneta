param(
  [string]$ProjectRoot = "c:\laragon\www\camioneta\frontend",
  [string]$GradleCacheRoot = "C:\GradleCache",
  [switch]$SkipNpmBuild
)

$ErrorActionPreference = "Stop"

$androidDir = Join-Path $ProjectRoot "android"
$apkPath = Join-Path $androidDir "app\build\outputs\apk\release\app-release.apk"
$logPath = Join-Path $androidDir ("build-release-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".log")

Write-Host "[1/8] Validando rutas..." -ForegroundColor Cyan
if (-not (Test-Path $ProjectRoot)) {
  throw "No existe ProjectRoot: $ProjectRoot"
}
if (-not (Test-Path $androidDir)) {
  throw "No existe carpeta android: $androidDir"
}

Write-Host "[2/8] Creando cache local de Gradle..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $GradleCacheRoot | Out-Null
$env:GRADLE_USER_HOME = $GradleCacheRoot

Write-Host "[3/8] Deteniendo procesos Java/Gradle..." -ForegroundColor Cyan
Get-Process -Name java -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "[4/8] Limpiando caches de transforms potencialmente bloqueados..." -ForegroundColor Cyan
$oldGlobalTransforms = Join-Path $env:USERPROFILE ".gradle\caches\8.9\transforms"
$newGlobalTransforms = Join-Path $GradleCacheRoot "caches\8.9\transforms"
Remove-Item -Recurse -Force $oldGlobalTransforms -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $newGlobalTransforms -ErrorAction SilentlyContinue

Write-Host "[5/8] Validando toolchain..." -ForegroundColor Cyan
Push-Location $androidDir
try {
  .\gradlew --stop | Tee-Object -FilePath $logPath -Append
  .\gradlew --version | Tee-Object -FilePath $logPath -Append
}
finally {
  Pop-Location
}

if (-not $SkipNpmBuild) {
  Write-Host "[6/8] Ejecutando npm run build:apk..." -ForegroundColor Cyan
  Push-Location $ProjectRoot
  try {
    npm run build:apk | Tee-Object -FilePath $logPath -Append
  }
  finally {
    Pop-Location
  }
}
else {
  Write-Host "[6/8] Omitiendo npm run build:apk (SkipNpmBuild)." -ForegroundColor Yellow
}

Write-Host "[7/8] Compilando release con flags anti-lock..." -ForegroundColor Cyan
Push-Location $androidDir
try {
  .\gradlew clean assembleRelease --no-daemon --stacktrace --max-workers=1 | Tee-Object -FilePath $logPath -Append
}
finally {
  Pop-Location
}

Write-Host "[8/8] Verificando APK generado..." -ForegroundColor Cyan
if (Test-Path $apkPath) {
  $apk = Get-Item $apkPath
  Write-Host "OK: APK generado" -ForegroundColor Green
  Write-Host "Ruta: $($apk.FullName)"
  Write-Host "Tamano: $([math]::Round($apk.Length / 1MB, 2)) MB"
  Write-Host "Fecha: $($apk.LastWriteTime)"
  Write-Host "Log: $logPath"
  exit 0
}

Write-Host "ERROR: No se encontro app-release.apk" -ForegroundColor Red
Write-Host "Revisa el log: $logPath"
exit 1
