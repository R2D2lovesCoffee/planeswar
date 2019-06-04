import config from '/javascript/config.js';
const host = config.host;
const emailInput = document.querySelector('#email-input');
const passwordInput = document.querySelector('#password-input');
const signinButton = document.querySelector('.button');

document.querySelector('#auth').addEventListener('click',()=>{
    window.location=`${host}/login`;
})
document.querySelector('#register').addEventListener('click',()=>{
    window.location=`${host}/register`;
})

signinButton.onclick=()=>{
    let data = {
        email:emailInput.value,
        password:passwordInput.value,
    }
    fetch(`${host}/login`,{
        method:'POST',
        mode:'cors',
        headers:{
            'Content-Type':'Application/json',
        },
        body:JSON.stringify(data)
    }).then(resp=>resp.json())
    .then(resp=>{
        if(resp.message==='success!')
            window.location = `${host}/home`
        else{
            document.querySelector('.message').innerHTML='INCORRECT EMAIL OR PASSWORD!';
        }
    });
}