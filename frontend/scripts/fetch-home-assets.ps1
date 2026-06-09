$ErrorActionPreference = 'Stop'
$base = 'http://localhost:3845/assets/'
$dest = Join-Path $PSScriptRoot '..\public\images\home'
New-Item -ItemType Directory -Force -Path $dest | Out-Null

$map = @{
  'hero-gloves.png'        = '1b851452dc4e801a9e0e9a23ee0e76b285c2bfa5.png'
  'product-gloves.png'     = '5a93ccd6829560e91f3750867ac7f0bceef43ef7.png'
  'product-gloves-box.png' = '80f84d6aac5e978a470294f91afac3cffe1dac70.png'
  'product-tape.png'       = '63265b44cd88789be4af97fdd040f0511085b124.png'
  'product-tape-rolls.png' = '77b91897c66f9792c4ff4227ccb2e70c293c46c6.png'
  'product-wiper-1.png'    = 'ba51a5c39074836ba348db119f5d1f0b3900f82e.png'
  'product-wiper-2.png'    = '4639b0c6cfb5debb0d9308fa3b9a5629f783d151.png'
  'product-packaging.png'  = 'e5eeba52015a11c5461d2be7718e63d993896778.png'
  'product-packaging-box.png' = 'ae88898c12c0c2150af7821d27d430aa585ce244.png'
  'news-1.png'             = 'ef1ea7c6114f26da210b62da5e9820bf8529476a.png'
  'news-2.png'             = '283dbd4dc2036d941992c4094ac963bddfb20dae.png'
  'news-3.png'             = '6dda6ddff20533ba890d2181099da8c71cf06e95.png'
}

foreach ($name in $map.Keys) {
  $url = $base + $map[$name]
  $out = Join-Path $dest $name
  try {
    Invoke-WebRequest -Uri $url -OutFile $out -TimeoutSec 20 -UseBasicParsing
    $size = (Get-Item $out).Length
    Write-Output ("OK  {0}  ({1} bytes)" -f $name, $size)
  } catch {
    Write-Output ("ERR {0}  {1}" -f $name, $_.Exception.Message)
  }
}
