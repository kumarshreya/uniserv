// https://stackoverflow.com/questions/15759020/window-location-href-doesnt-redirect
let mylogger = document.getElementById('mylogger');
mylogger.addEventListener('click', function(){
    if(mylogger.textContent == 'Log Me In' || mylogger.innerText == 'Log Me In') {
        window.location.href = '/login';
    } else {
        window.location.href='/logout';
    }
});

let eyebrows = document.getElementById('eyebrows');
eyebrows.addEventListener('click', function(){
    window.location.href = '/eyebrows';
});

let makeup = document.getElementById('makeup');
makeup.addEventListener('click', function(){
    window.location.href = '/makeup';
});

let haircut = document.getElementById('haircut');
haircut.addEventListener('click', function(){
    window.location.href = '/haircut';
});

let dj = document.getElementById('dj');
dj.addEventListener('click', function(){
    window.location.href = '/dj';
});

let mc = document.getElementById('mc');
mc.addEventListener('click', function(){
    window.location.href = '/mc';
});

let photography = document.getElementById('photography');
photography.addEventListener('click', function(){
    window.location.href = '/photography';
});

let webdesign = document.getElementById('webdesign');
webdesign.addEventListener('click', function(){
    window.location.href = '/webdesign';
});

let graphicdesign = document.getElementById('graphicdesign');
graphicdesign.addEventListener('click', function(){
    window.location.href = '/graphicdesign';
});

let appdevelopment = document.getElementById('appdevelopment');
appdevelopment.addEventListener('click', function(){
    window.location.href = '/appdevelopment';
});

let logo = document.getElementById('logo');
logo.addEventListener('click', function(){
    window.location.href = '/';
});

