// Shows the error, keeps the username, and remembers where the visitor was headed. No secrets pass through the address bar.
(function () {
  var q = new URLSearchParams(location.search), err = document.getElementById('err'), user = document.getElementById('username'), pass = document.getElementById('password');
  var msgs = { bad: 'That username or password is not right.', limit: 'Too many tries. Wait a few minutes and try again.' };
  if (msgs[q.get('e')]) { err.textContent = msgs[q.get('e')]; err.hidden = false; }
  var next = q.get('next'); if (next && /^\/(?![\/\\])/.test(next)) document.getElementById('next').value = next;
  var u = q.get('u'); if (u) { user.value = u; pass.focus(); }
})();
