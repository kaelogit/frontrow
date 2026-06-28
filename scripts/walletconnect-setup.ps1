# WalletConnect Pay — create or list merchant ID
# Usage: .\scripts\walletconnect-setup.ps1
# Requires WALLETCONNECT_PAY_API_KEY in .env (root of repo)

$envFile = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envFile)) {
  Write-Host "Create .env first (copy from .env.example)" -ForegroundColor Red
  exit 1
}

$apiKey = $null
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^WALLETCONNECT_PAY_API_KEY=(.+)$') {
    $apiKey = $Matches[1].Trim()
  }
}

if (-not $apiKey) {
  Write-Host "WALLETCONNECT_PAY_API_KEY missing in .env" -ForegroundColor Red
  exit 1
}

$base = "https://api.pay.walletconnect.com"
$headers = @{ "Api-Key" = $apiKey }

Write-Host "Checking API key..." -ForegroundColor Cyan
try {
  $list = Invoke-RestMethod -Uri "$base/v1/merchants" -Headers $headers
} catch {
  Write-Host "API key rejected. In dashboard: WalletConnect Pay -> API -> Generate (copy full key once)." -ForegroundColor Red
  Write-Host $_.Exception.Message
  exit 1
}

if ($list.data -and $list.data.Count -gt 0) {
  Write-Host "`nExisting merchants:" -ForegroundColor Green
  foreach ($m in $list.data) {
    Write-Host "  $($m.id)  $($m.name)"
  }
  $merchantId = $list.data[0].id
} else {
  Write-Host "No merchant yet — creating Frontrowly..." -ForegroundColor Cyan
  $email = Read-Host "Your email (for merchant record)"
  $createHeaders = $headers.Clone()
  $createHeaders["Idempotency-Key"] = [guid]::NewGuid().ToString()
  $createHeaders["Content-Type"] = "application/json"
  $body = @{ merchantName = "Frontrowly"; merchantEmail = $email } | ConvertTo-Json
  $created = Invoke-RestMethod -Method POST -Uri "$base/v1/merchants" -Headers $createHeaders -Body $body
  $merchantId = $created.merchant.id
  Write-Host "Created: $merchantId" -ForegroundColor Green
}

Write-Host "`nAdd to .env:" -ForegroundColor Yellow
Write-Host "WALLETCONNECT_PAY_MERCHANT_ID=$merchantId"
