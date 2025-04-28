
function monitorAuthState() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('user is signed in:', user.email)
    } else {
      console.log('user is signed out')
    }
  })
}