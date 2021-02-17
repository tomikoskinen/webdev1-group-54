/**
 * 8.3 List all users (use <template id="user-template"> in users.html)
 *       - Each user should be put inside a clone of the template fragment
 *       - Each individual user HTML should look like this
 *         (notice the id attributes and values, replace "{userId}" with the actual user id)
 *
 *         <div class="item-row" id="user-{userId}">
 *           <h3 class="user-name" id="name-{userId}">Admin</h3>
 *           <p class="user-email" id="email-{userId}">admin@email.com</p>
 *           <p class="user-role" id="role-{userId}">admin</p>
 *           <button class="modify-button" id="modify-{userId}">Modify</button>
 *           <button class="delete-button" id="delete-{userId}">Delete</button>
 *         </div>
 *
 *       - Each cloned template fragment should be appended to <div id="users-container">
 *       - Use getJSON() function from utils.js to fetch user data from server
 *
 * */
const template = document.querySelector('#user-template');
const url = '/api/users';


const getUsers = () => {
    getJSON(url).then(response => response.json())
            .then(data => {
                const usersJSON = data;
                usersJSON.map(user => {
                    const clone = template.content.cloneNode(true);
                    const div = clone.querySelector('.item-row');
                    const name = div.querySelector('.user-name');
                    const email = div.querySelector('.user-email');
                    const role = div.querySelector('.user-role');
                    const buttonModify = div.querySelector('.modify-button');
                    const buttonDelete = div.querySelector('.delete-button');

                    div.setAttribute('id', `user-${user._id}`);
                    name.setAttribute('id', `name-${user._id}`);
                    name.innerHTML = user.name;
                    email.setAttribute('id', `email-${user._id}`);
                    email.innerHTML = user.email;
                    role.setAttribute('id', `role-${user._id}`);
                    role.innerHTML = user.role;
                    buttonModify.setAttribute('id', `modify-${user._id}`);
                    buttonModify.addEventListener('click', (e) => {
                        modifyUser(e.target.id);
                    });
                    buttonDelete.setAttribute('id', `delete-${user._id}`);
                    buttonDelete.addEventListener('click', (e) => {
                        deleteUser(e.target.id);
                    });
                    document.querySelector('#users-container').appendChild(clone);
                    
                });
      
            });
};

getUsers();
    
/**
 * 8.5 Updating/modifying and deleting existing users
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 *       - Clicking "Delete" button of a user will delete the user and update the listing accordingly
 *       - Clicking "Modify" button of a user will use <template id="form-template"> to
 *         show an editing form populated with the values of the selected user
 *       - The edit form should appear inside <div id="modify-user">
 *       - Afted successful edit of user the form should be removed and the listing updated accordingly
 *       - You can use removeElement() from utils.js to remove the form.
 *       - Remove edit form from the DOM after successful edit or replace it with a new form when another
 *         user's "Modify" button is clicked. There should never be more than one form visible at any time.
 *         (Notice that the edit form has an id "edit-user-form" which should be unique in the DOM at all times.)
 *       - Also remove the edit form when a user is deleted regardless of which user is deleted.
 *       - Modifying a user successfully should show a notification message "Updated user {User Name}"
 *       - Deleting a user successfully should show a notification message "Deleted user {User Name}"
 *       - Use createNotification() function from utils.js to create notifications
 */

const notificationContainer = "notifications-container";
const usersContainer = "users-container";
const formContainer = "modify-user";
const formTemplate = document.getElementById('form-template');

const populateFormTemplate = user => {
    const clone = formTemplate.content.cloneNode(true);
    const form = clone.querySelector('#edit-user-form');
    const header = form.getElementsByTagName("h2");
    header[0].innerHTML = `Modify user ${user.name}`;
    const id = form.querySelector('#id-input');
    const name = form.querySelector('#name-input');
    const email = form.querySelector('#email-input');
    const role = form.querySelector('#role-input');

    id.value = user._id;
    name.value = user.name;
    email.value = user.email;
    role.value = user.role;

    form.addEventListener('submit', submitUpdate);


    document.querySelector(`#${formContainer}`).appendChild(clone);
    document.getElementById(usersContainer).style.display = "none";
    document.getElementById(formContainer).style.display = "block";
};

const submitUpdate = (e) => {
    e.preventDefault();

    const form = document.querySelector('#edit-user-form');
    const id = form.querySelector('#id-input').value;
    const role = form.querySelector('#role-input').value;
    const data = {
        role: role,
    };

    postOrPutJSON(`${url}/${id}`, 'PUT', data).then(response => {
        return response.json().then(userData => {
            createNotification(`Updated user ${userData.name}`, notificationContainer, true);
            document.getElementById(usersContainer).style.display = "block";
            
            removeElement(formContainer, "edit-user-form");
            let div = document.querySelector('#user-'+id);
            div.querySelector('.user-role').innerHTML = role;
            
        });
    }).catch(err => {
        console.log(err);
    });
};

const modifyUser = (id) => {

    const getId = id.split('-');

    getJSON(`${url}/${getId[1]}`).then(response => {
        return response.json().then(data => {
            //populate form
            populateFormTemplate(data);
        });
    }).catch(err => {
        console.log(err);
    });
    
};

const deleteUser = (id) => {
    const getId = id.split('-');
    deleteResourse(`${url}/${getId[1]}`).then(response => {
        return response.json().then(data => {
            createNotification(`Deleted user ${data.name}`, notificationContainer, true);
            const userDiv = `user-${data._id}`;
            removeElement(usersContainer, userDiv);
        });
    }).catch(err => {
        console.log(err);
        createNotification(`Deleted failed`, notificationContainer, false);
    });
};
