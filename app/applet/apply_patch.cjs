const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

https.get('https://github.com/tasoasteritopeleven/active_board_ai_studio_beta/pull/1.patch', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('pr.patch', data);
    console.log('Patch downloaded. Size:', data.length);
    try {
      const out = execSync('patch -p1 < pr.patch');
      console.log('Success:', out.toString());
    } catch(e) {
      console.error('Error stdout:', e.stdout ? e.stdout.toString() : 'none');
      console.error('Error stderr:', e.stderr ? e.stderr.toString() : 'none');
    }
  });
});
