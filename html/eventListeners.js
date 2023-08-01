document.addEventListener('DOMContentLoaded', function() {
  //add listener to buttons
  document.getElementById('btnConnect').addEventListener('click', connectAs)
  document.getElementById('btnSend').addEventListener('click', sendMessage)
  document.getElementById('btnClear').addEventListener('click', clearMessage)

  //add keyboard handler for the document as a whole, not separate elements.
  document.addEventListener('keydown', handleKeyDown)
})
