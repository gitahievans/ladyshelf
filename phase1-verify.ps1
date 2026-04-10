$projectRoot = "C:\Users\gitahi\Development\wahi-fasion"
$logPath = Join-Path $projectRoot "wahi-dev.log"

if (Test-Path $logPath) {
  Remove-Item -LiteralPath $logPath -Force
}

$process = Start-Process `
  -FilePath "powershell.exe" `
  -ArgumentList @(
    "-NoProfile",
    "-Command",
    "Set-Location '$projectRoot'; npm run dev *> '$logPath'"
  ) `
  -PassThru

try {
  Start-Sleep -Seconds 12

  $response = Invoke-WebRequest -Uri "http://127.0.0.1:3000" -UseBasicParsing
  $content = $response.Content
  $cssMatch = [regex]::Match($content, "/_next/static/css/[^`"']+\.css")
  $cssUrl = if ($cssMatch.Success) {
    "http://127.0.0.1:3000$($cssMatch.Value)"
  }
  else {
    $null
  }

  $cssContent = if ($cssUrl) {
    (Invoke-WebRequest -Uri $cssUrl -UseBasicParsing).Content
  }
  else {
    ""
  }

  [pscustomobject]@{
    statusCode             = $response.StatusCode
    containsFoundationText = $content -like "*bg-gold is active.*"
    containsCormorantVar   = $content -like "*--font-cormorant*"
    containsDmSansVar      = $content -like "*--font-dm-sans*"
    cssUrl                 = $cssUrl
    cssHasBgGold           = $cssContent -like "*.bg-gold*"
    cssHasFontCormorant    = $cssContent -like "*font-cormorant*"
    cssHasFontDMSans       = $cssContent -like "*font-dm-sans*"
  } | ConvertTo-Json -Compress

  if (Test-Path $logPath) {
    Write-Output "`n---LOG---"
    Get-Content -LiteralPath $logPath
  }
}
finally {
  if ($process -and -not $process.HasExited) {
    Stop-Process -Id $process.Id -Force
  }
}
