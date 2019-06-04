import config from '/javascript/config.js';
const host = config.host;
const emailInput = document.querySelector('#email-input');
const passwordInput = document.querySelector('#password-input');
const confirmPasswordInput = document.querySelector('#confirm-password-input');
const nicknameInput = document.querySelector('#nickname-input');
const signupButton = document.querySelector('.button');

document.querySelector('#auth').addEventListener('click',()=>{
    window.location=`${host}/login`;
})
document.querySelector('#register').addEventListener('click',()=>{
    window.location=`${host}/register`;
})


signupButton.onclick = ()=>{
    let email = emailInput.value;
    let password = passwordInput.value;
    let confirmPassword = confirmPasswordInput.value;
    let nickname = nicknameInput.value;
    if(password.length>=7&&nickname.length>=4
        &&password===confirmPassword){
            let data = {email, password, nickname};
            fetch(`${host}/register`,{
                method:'POST',
                mode:'cors',
                headers:{
                    'Content-Type':'Application/json',
                },
                body:JSON.stringify(data)
            }).then(resp=>resp.json())
            .then(resp=>{
                if(resp.message==='succes!')
                    window.location = `${host}/login`
                else{
                    console.log(resp.message);
                }
            });
    }
}
