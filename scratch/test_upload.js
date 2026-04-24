async function run() {
  const fd = new FormData();
  // 6MB of data
  const data = new Uint8Array(6 * 1024 * 1024);
  fd.append('file', new Blob([data], { type: 'image/png' }), 'test_large.png');
  fd.append('section', 'about_toeicmore_grid1');

  try {
    const res = await fetch('http://localhost:3000/api/admin/gallery', {
      method: 'POST',
      body: fd
    });
    console.log(res.status);
    console.log(await res.text());
  } catch (e) {
    console.error('Network Error:', e.message);
  }
}
run();
