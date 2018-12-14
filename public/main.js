let mylogger = document.getElementById('login');
mylogger.addEventListener('click', function(){
    if(mylogger.textContent == 'Log In' || mylogger.innerText == 'Log In') {
        window.location.href = '/login';
    } else {
        window.location.href='/logout';
    }
});