fetch('https://foxutnrfjrmjngtygzkq.supabase.co/auth/v1/health')
  .then(res => res.json())
  .then(data => console.log('SUCCESS:', data))
  .catch(err => console.error('FAILED:', err))