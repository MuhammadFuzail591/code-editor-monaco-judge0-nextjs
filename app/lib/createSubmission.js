export async function createSubmission (code, language) {
  const url =
    'https://judge029.p.rapidapi.com/submissions?base64_encoded=true&wait=false&fields=*'
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': 'df0ecc66f6msh2efa1c1824c8b48p15df0cjsn947d9710b419',
      'x-rapidapi-host': 'judge029.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source_code:
        'I2luY2x1ZGUgPHN0ZGlvLmg+CgppbnQgbWFpbih2b2lkKSB7CiAgY2hhciBuYW1lWzEwXTsKICBzY2FuZigiJXMiLCBuYW1lKTsKICBwcmludGYoImhlbGxvLCAlc1xuIiwgbmFtZSk7CiAgcmV0dXJuIDA7Cn0',
      language_id: 52,
      stdin: 'SnVkZ2Uw',
      expected_output: 'aGVsbG8sIAo='
    })
  }

  try {
    const response = await fetch(url, options)
    const result = await response.text()
    console.log(result)
  } catch (error) {
    console.error(error)
  }
}
