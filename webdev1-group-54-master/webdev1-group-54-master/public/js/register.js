/**
 * TODO: 8.3 Register new user
 *       - Handle registration form submission
 *       - Prevent registration when password and passwordConfirmation do not match
 *       - Use createNotification() function from utils.js to show user messages of
 *       - error conditions and successful registration
 *       - Reset the form back to empty after successful registration
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 */


const registerButton = document.getElementById('btnRegister');
const registerForm = document.getElementById('register-form');



const submitRegistration = (event) => {
    event.preventDefault();
    //check passwords
    const pw1 = document.getElementById('password').value;
    const pw2 = document.getElementById('passwordConfirmation').value;
    const containerId = "notifications-container";
    if(pw1 !== pw2) {
        const msg = "Passwords do not match";
        
        createNotification(msg, containerId, false);
        return;
    } else {
        const data = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: pw1
        };
        const url = '/api/register';
        const method = 'POST';
        postOrPutJSON(url, method, data).then(response => {
            if(response.status === 201) {
                //success
                createNotification("user registered", containerId, true);
                return response;
            } else if(response.status === 400) {
                createNotification(response.statusText, containerId, false);
                return response;
            }
        });
        
        
    }
    
};
registerForm.addEventListener('submit', submitRegistration);