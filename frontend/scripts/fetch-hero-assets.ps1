$ErrorActionPreference = 'Stop'
$base = 'http://localhost:3845/assets/'
$dest = Join-Path $PSScriptRoot '..\public\images\home'
New-Item -ItemType Directory -Force -Path $dest | Out-Null

$map = @{
  'hero-gloves.png' = '1b851452dc4e801a9e0e9a23ee0e76b285c2bfa5.png'
  'hero-bg.png'     = '74648f0b1433dfee23249d934869e0c1c67c0296.png'
}

foreach ($name in $map.Keys) {
  $url = $base + $map[$name]
  $out = Join-Path $dest $name
  try {
    Invoke-WebRequest -Uri $url -OutFile $out -TimeoutSec 30 -UseBasicParsing
    $size = (Get-Item $out).Length
    Write-Output ("OK  {0}  ({1} bytes)" -f $name, $size)
  } catch {
    Write-Output ("ERR {0}  {1}" -f $name, $_.Exception.Message)
  }
}
