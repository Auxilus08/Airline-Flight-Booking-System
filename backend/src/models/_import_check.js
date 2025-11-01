Promise.all([
  import('./booking.model.js'),
  import('./passenger.model.js'),
  import('./payment.model.js'),
  import('./user.model.js')
]).then(()=>console.log('OK')).catch(e=>{ console.error(e); process.exit(1); });
