let close=document.getElementById('close');
let open=document.getElementById('open');
let container=document.getElementById('pop-up-container');
let main_container=document.querySelector('.containers');
open.addEventListener('click',function(){
    container.classList.remove('show');
    main_container.classList.add('blur');
    console.log(container.classList);
});
close.addEventListener('click',function(){
    container.classList.add('show');
    main_container.classList.remove('blur');
    console.log(container.classList);
});