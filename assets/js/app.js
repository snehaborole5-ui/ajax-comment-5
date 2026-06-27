const cl = console.log;

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

function showSpinner() {
    spinner.classList.remove('d-none');
}

function hideSpinner() {
    spinner.classList.add('d-none');
}

function fetchComments() {
    let localData = localStorage.getItem('localComments');
    if (localData) {
        commentsArr = JSON.parse(localData);
        renderCommentCards(commentsArr);
        return;
    }

    showSpinner();
    let xhr = new XMLHttpRequest();
    xhr.open('GET', COMMENT_URL);
    xhr.send(null);

    xhr.onload = function () {
        hideSpinner();
        if (xhr.status >= 200 && xhr.status <= 299) {
            let data = JSON.parse(xhr.response);
            commentsArr = [...data].reverse(); 
            localStorage.setItem('localComments', JSON.stringify(commentsArr));
            renderCommentCards(commentsArr);
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
            <div class="col-xl-3 col-lg-3 col-md-6 col-12 mb-4 comment-card-wrapper" id="comment-${comment.id}">
                <div class="card comment-card h-100 d-flex flex-column justify-content-between shadow-sm">
                    <div>
                        <div class="card-header-bg p-3 text-white text-wrap">
                            <h4 class="card-title text-capitalize font-weight-bold custom-title-truncate" data-toggle="tooltip" title="${comment.name}">
                                ${comment.name}
                            </h4>
                            <p class="card-subtitle mb-0 text-white-50 text-truncate">Email: ${comment.email}</p>
                        </div>
                        <div class="card-body bg-white text-secondary">
                            <p class="card-text custom-body-truncate" data-toggle="tooltip" title="${comment.body}">${comment.body}</p>
                        </div>
                    </div>
                    <div class="card-footer bg-white d-flex justify-content-between align-items-center border-top p-3">
                        <button onclick="onEdit('${comment.id}')" class="btn btn-success px-3 py-1 btn-sm rounded">Edit</button>
                        <button onclick="onRemove('${comment.id}')" class="btn btn-danger px-2 py-1 btn-sm rounded">Remove</button>
                    </div>
                </div>
            </div>
        `;
    });
    commentContainer.innerHTML = result;
    initTooltips();
}

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
            
            res.id = res.id || Date.now(); 
            res.name = res.name || COMMENT_OBJ.name;
            res.email = res.email || COMMENT_OBJ.email;
            res.body = res.body || COMMENT_OBJ.body;

            $('#commentModal').modal('hide');
            commentForm.reset();

            commentsArr.unshift(res);
            localStorage.setItem('localComments', JSON.stringify(commentsArr));

            let div = document.createElement('div');
            div.className = 'col-xl-3 col-lg-3 col-md-6 col-12 mb-4 comment-card-wrapper';
            div.id = `comment-${res.id}`;

            div.innerHTML = `
                <div class="card comment-card h-100 d-flex flex-column justify-content-between shadow-sm">
                    <div>
                        <div class="card-header-bg p-3 text-white">
                            <h4 class="card-title text-capitalize font-weight-bold custom-title-truncate" data-toggle="tooltip" title="${res.name}">
                                ${res.name}
                            </h4>
                            <p class="card-subtitle mb-0 text-white-50 text-truncate">Email: ${res.email}</p>
                        </div>
                        <div class="card-body bg-white text-secondary">
                            <p class="card-text custom-body-truncate" data-toggle="tooltip" title="${res.body}">${res.body}</p>
                        </div>
                    </div>
                    <div class="card-footer bg-white d-flex justify-content-between align-items-center border-top p-3">
                        <button onclick="onEdit('${res.id}')" class="btn btn-success px-3 py-1 btn-sm rounded">Edit</button>
                        <button onclick="onRemove('${res.id}')" class="btn btn-danger px-2 py-1 btn-sm rounded">Remove</button>
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
    let targetComment = commentsArr.find(c => c.id == updateId);
    if(targetComment) {
        fillFormAndShowModal(targetComment);
    }
}

function fillFormAndShowModal(data) {
    nameControl.value = data.name;
    emailControl.value = data.email;
    bodyControl.value = data.body;
    userIdControl.value = data.postId || 1;

    addCommentBtn.classList.add('d-none');
    updateCommentBtn.classList.remove('d-none');
    $('#commentModal').modal('show');
}

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
            let index = commentsArr.findIndex(c => c.id == updateId);
            if(index !== -1) {
                commentsArr[index] = { ...commentsArr[index], ...UPDATE_OBJ };
                localStorage.setItem('localComments', JSON.stringify(commentsArr));
            }

            $('#commentModal').modal('hide');

            let cardElement = document.getElementById(`comment-${updateId}`);
            if(cardElement) {
                cardElement.querySelector('.card-title').innerHTML = UPDATE_OBJ.name;
                cardElement.querySelector('.card-title').setAttribute('title', UPDATE_OBJ.name);
                cardElement.querySelector('.card-subtitle').innerHTML = `Email: ${UPDATE_OBJ.email}`;
                cardElement.querySelector('.card-text').innerHTML = UPDATE_OBJ.body;
                cardElement.querySelector('.card-text').setAttribute('title', UPDATE_OBJ.body);
                
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
                    commentsArr = commentsArr.filter(c => c.id != id);
                    localStorage.setItem('localComments', JSON.stringify(commentsArr));

                    let cardElement = document.getElementById(`comment-${id}`);
                    if(cardElement) cardElement.remove();
                    snackbar('Comment removed successfully!', 'success');
                }
            };
        }
    });
}

document.getElementById('openFormBtn').addEventListener('click', () => {
    commentForm.reset();
    addCommentBtn.classList.remove('d-none');
    updateCommentBtn.classList.add('d-none');
});

fetchComments();
commentForm.addEventListener('submit', onCommentSubmit);
updateCommentBtn.addEventListener('click', onUpdateComment);