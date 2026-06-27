const cl = console.log;

// HTML Elements
const spinner = document.getElementById('spinner');
const commentContainer = document.getElementById('commentContainer');
const commentForm = document.getElementById('commentForm');
const nameControl = document.getElementById('name');
const emailControl = document.getElementById('email');
const bodyControl = document.getElementById('body');
const userIdControl = document.getElementById('userId');
const addCommentBtn = document.getElementById('addCommentBtn');
const updateCommentBtn = document.getElementById('updateCommentBtn');

const BASE_URL = `https://jsonplaceholder.typicode.com`;
const COMMENT_URL = `${BASE_URL}/comments`;

let commentsArr = [];
let updateId = null;

function snackbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 3000
    });
}

function initTooltips() {
    $('[data-toggle="tooltip"]').tooltip({
        boundary: 'window'
    });
}

// Show Spinner function
function showSpinner() {
    spinner.classList.remove('d-none');
}

// Hide Spinner function
function hideSpinner() {
    spinner.classList.add('d-none');
}

// 1. Fetch Comments
function fetchComments() {
    showSpinner();
    let xhr = new XMLHttpRequest();
    xhr.open('GET', COMMENT_URL);
    xhr.send(null);

    xhr.onload = function () {
        hideSpinner();
        if (xhr.status >= 200 && xhr.status <= 299) {
            let data = JSON.parse(xhr.response);
            commentsArr = [...data]; 
            renderCommentCards(commentsArr.slice(0, 15).reverse());
        } else {
            snackbar('Error while fetching data!', 'error');
        }
    };
    xhr.onerror = function() {
        hideSpinner();
        snackbar('Network Error!', 'error');
    };
}


function renderCommentCards(arr) {
    let result = '';
    arr.forEach(comment => {
        result += `
            <div class="col-xl-3 col-md-6 col-12 mb-4" id="comment-${comment.id}">
                <div class="card comment-card h-100 d-flex flex-column justify-content-between shadow-sm">
                    <div>
                        <div class="card-header-bg p-3 text-white text-wrap">
                            <h4 class="card-title text-capitalize font-weight-bold" data-toggle="tooltip" title="${comment.name}">
                                ${comment.name}
                            </h4>
                            <p class="card-subtitle mb-0 text-white-50 text-truncate">Email: ${comment.email}</p>
                        </div>
                        <div class="card-body bg-white text-secondary">
                            <p class="card-text">${comment.body}</p>
                        </div>
                    </div>
                    <div class="card-footer bg-white d-flex justify-content-between align-items-center border-top p-3">
                        <button onclick="onEdit('${comment.id}')" class="btn btn-success px-4 py-1 btn-sm rounded">Edit</button>
                        <button onclick="onRemove('${comment.id}')" class="btn btn-danger px-3 py-1 btn-sm rounded">Remove</button>
                    </div>
                </div>
            </div>
        `;
    });
    commentContainer.innerHTML = result;
    initTooltips();
}

// 3. Form Submit (POST)
function onCommentSubmit(eve) {
    eve.preventDefault();

    let COMMENT_OBJ = {
        name: nameControl.value,
        email: emailControl.value,
        body: bodyControl.value,
        postId: userIdControl.value
    };

    showSpinner();
    let xhr = new XMLHttpRequest();
    xhr.open('POST', COMMENT_URL);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(COMMENT_OBJ));

    xhr.onload = function () {
        hideSpinner();
        if (xhr.status >= 200 && xhr.status <= 299) {
            let res = JSON.parse(xhr.response);
            
            res.name = res.name || COMMENT_OBJ.name;
            res.email = res.email || COMMENT_OBJ.email;
            res.body = res.body || COMMENT_OBJ.body;

            commentForm.reset();

            let div = document.createElement('div');
            div.className = 'col-xl-3 col-md-6 col-12 mb-4';
            div.id = `comment-${res.id}`;

            div.innerHTML = `
                <div class="card comment-card h-100 d-flex flex-column justify-content-between shadow-sm">
                    <div>
                        <div class="card-header-bg p-3 text-white">
                            <h4 class="card-title text-capitalize font-weight-bold" data-toggle="tooltip" title="${res.name}">
                                ${res.name}
                            </h4>
                            <p class="card-subtitle mb-0 text-white-50 text-truncate">Email: ${res.email}</p>
                        </div>
                        <div class="card-body bg-white text-secondary">
                            <p class="card-text">${res.body}</p>
                        </div>
                    </div>
                    <div class="card-footer bg-white d-flex justify-content-between align-items-center border-top p-3">
                        <button onclick="onEdit('${res.id}')" class="btn btn-success px-4 py-1 btn-sm rounded">Edit</button>
                        <button onclick="onRemove('${res.id}')" class="btn btn-danger px-3 py-1 btn-sm rounded">Remove</button>
                    </div>
                </div>
            `;
            commentContainer.insertBefore(div, commentContainer.firstChild);
            initTooltips();
            snackbar(`New comment created successfully!`, 'success');
        }
    };
}


function onEdit(id) {
    updateId = id;
    let EDIT_URL = `${BASE_URL}/comments/${updateId}`;

    showSpinner();
    let xhr = new XMLHttpRequest();
    xhr.open('GET', EDIT_URL);
    xhr.send(null);

    xhr.onload = function () {
        hideSpinner();
        if (xhr.status >= 200 && xhr.status <= 299) {
            let res = JSON.parse(xhr.response);
            nameControl.value = res.name;
            emailControl.value = res.email;
            bodyControl.value = res.body;
            userIdControl.value = res.postId || 1;

            addCommentBtn.classList.add('d-none');
            updateCommentBtn.classList.remove('d-none');
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
}

// 5. Update Action (PATCH)
function onUpdateComment() {
    let UPDATE_OBJ = {
        name: nameControl.value,
        email: emailControl.value,
        body: bodyControl.value,
        postId: userIdControl.value
    };

    showSpinner();
    let UPDATE_URL = `${BASE_URL}/comments/${updateId}`;

    let xhr = new XMLHttpRequest();
    xhr.open('PATCH', UPDATE_URL);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(UPDATE_OBJ));

    xhr.onload = function () {
        hideSpinner();
        if (xhr.status >= 200 && xhr.status <= 299) {
            let cardElement = document.getElementById(`comment-${updateId}`);
            if(cardElement) {
                cardElement.querySelector('.card-title').innerHTML = UPDATE_OBJ.name;
                cardElement.querySelector('.card-title').setAttribute('title', UPDATE_OBJ.name);
                cardElement.querySelector('.card-subtitle').innerHTML = `Email: ${UPDATE_OBJ.email}`;
                cardElement.querySelector('.card-text').innerHTML = UPDATE_OBJ.body;
                
                cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                cardElement.classList.add('highlight');
                setTimeout(() => { cardElement.classList.remove('highlight'); }, 3000);
            }

            initTooltips();
            commentForm.reset();

            updateId = null;
            addCommentBtn.classList.remove('d-none');
            updateCommentBtn.classList.add('d-none');
            snackbar('Comment updated successfully!', 'success');
        }
    };
}


function onRemove(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to remove this comment?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Remove'
    }).then(result => {
        if (result.isConfirmed) {
            showSpinner();
            let REMOVE_URL = `${BASE_URL}/comments/${id}`;

            let xhr = new XMLHttpRequest();
            xhr.open('DELETE', REMOVE_URL);
            xhr.send(null);

            xhr.onload = function () {
                hideSpinner();
                if (xhr.status >= 200 && xhr.status <= 299) {
                    let cardElement = document.getElementById(`comment-${id}`);
                    if(cardElement) cardElement.remove();
                    snackbar('Comment removed successfully!', 'success');
                }
            };
        }
    });
}

fetchComments();
commentForm.addEventListener('submit', onCommentSubmit);
updateCommentBtn.addEventListener('click', onUpdateComment);