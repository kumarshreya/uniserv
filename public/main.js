let mylogger = document.getElementById('mylogger');
mylogger.addEventListener('click', function(){
    if(mylogger.textContent == 'Log Me In' || mylogger.innerText == 'Log Me In') {
        window.location.href = '/login';
    } else {
        window.location.href='/logout';
    }
});