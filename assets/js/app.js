
const cl = console.log;
const commentform = document.getElementById('commentform')
const name = document.getElementById('name')
const email = document.getElementById('email')
const body = document.getElementById('body')
const userId = document.getElementById('userId')
const AddComment = document.getElementById('AddComment')
const UpdateComment = document.getElementById('UpdateComment')
const commentContainer = document.getElementById('commentContainer')
const spinner = document.getElementById('spinner')



let Base_url = `https://jsonplaceholder.typicode.com/comments`


let CommentArr =[]

function snackbar(msg,icon){
    swal.fire({
        title : msg,
        icon : icon,
        timer : 2000
    })
}


function fetchcomment(){
    spinner.classList.remove('d-none')

    let xhr = new XMLHttpRequest()

    xhr.open('GET',Base_url)

    xhr.send(null)

    xhr.onload = function (){
        if(xhr.status >= 200 && xhr.status <= 299){
            CommentArr = JSON.parse(xhr.response)
            CreateComment(CommentArr.reverse())
        }
        spinner.classList.add('d-none')
    }
}


fetchcomment()


function CreateComment(arr){
    let result = ``
    arr.forEach((ele,i) => {
        result += `<tr id=${ele.id}>
					    <td>${arr.length - i}</td>
					    <td>${ele.name}</td>
					    <td>${ele.email}</td>
					    <td>${ele.body}</td>
				    	<td><i type='button' class="fa-solid fa-pen-to-square fa-2x text-primary" onclick='OnEdit(this)'></i></td>
					    <td><i type='button' class="fa-solid fa-trash fa-2x text-danger" onclick='Onremove(this)'></i></td>
				    </tr>`
    });

    commentContainer.innerHTML =result;


}


function onsubmit(ele){
    spinner.classList.remove('d-none')

    ele.preventDefault()

    let newobj ={
        name :name.value,
        email : email.value,
        postId : userId.value,
        body : body.value
    }

    CommentArr.unshift(newobj)
    
    let xhr = new XMLHttpRequest()

    xhr.open('POST',Base_url)

    xhr.send(JSON.stringify(newobj))

    xhr.onload = function (){
        if(xhr.status >=200 && xhr.status <= 299){
            let res = JSON.parse(xhr.response)

            CreateNewComment(newobj,res)
        }else{
            snackbar(xhr)
        }


     spinner.classList.add('d-none')

    }
}



function CreateNewComment(newobj,res){
    let tr = document.createElement('tr')
    tr.id = res.id

    tr.innerHTML = `<td>${CommentArr.length}</td>
					    <td>${newobj.name}</td>
					    <td>${newobj.email}</td>
					    <td>${newobj.body}</td>
				    	<td><i type='button' class="fa-solid fa-pen-to-square fa-2x text-primary " onclick='OnEdit(this)'></i></td>
					    <td><i type='button' class="fa-solid fa-trash fa-2x text-danger" onclick='Onremove(this)'></i></td>
				   `
    commentContainer.prepend(tr)
    commentform.reset()

    snackbar(`The New Comment ID ${res.id} is Added Successfully!!`,'success')
}


function OnEdit(ele){
    spinner.classList.remove('d-none')
    
    let editId = ele.closest('tr').id

    localStorage.setItem('EditId',editId)

    let Edit_url = `${Base_url}/${editId}`

    let xhr = new XMLHttpRequest()

    xhr.open('GET',Edit_url)

    xhr.send(null)

    xhr.onload = function (){
        if(xhr.status >= 200 && xhr.status <= 299){
            let Editobj = JSON.parse(xhr.response)

            name.value = Editobj.name
            email.value = Editobj.email
            body.value = Editobj.body
            userId.value = Editobj.postId



            AddComment.classList.add('d-none')
            UpdateComment.classList.remove('d-none')

            commentform.scrollIntoView({
             behavior: 'smooth',
             block: 'start'
            });
        }else{
            snackbar(xhr)
        }
        spinner.classList.add('d-none')
    }

}

function onupdate(){
    spinner.classList.remove('d-none')

    let updateId = localStorage.getItem('EditId')

    let updateObj = {
        name :name.value,
        email : email.value,
        postId : userId.value,
        body : body.value,
        id : updateId
    }

    let Update_url = `${Base_url}/${updateId}`

    let xhr = new XMLHttpRequest()

    xhr.open('PUT',Update_url)

    xhr.send(JSON.stringify(updateObj))

    xhr.onload = function (){
        if(xhr.status >= 200 && xhr.status <= 299){
            let tr = document.getElementById(updateId).children

            tr[1].innerText = updateObj.name
            tr[2].innerText = updateObj.email
            tr[3].innerText = updateObj.body

            AddComment.classList.remove('d-none')
            UpdateComment.classList.add('d-none')

            snackbar(`The Comment Id ${updateId} is Updated Successfully!!`,'success')
            let row = document.getElementById(updateId)
            row.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            row.classList.add('highlight');

            setTimeout(() => {
                row.classList.remove('highlight');
            }, 4000);

        }else{
            snackbar(xhr)
        }



        spinner.classList.add('d-none')

    }


}


function Onremove(ele){

    let removeId = ele.closest('tr').id

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
        }).then((result) => {
        if (result.isConfirmed){
            spinner.classList.remove('d-none')
                
            let remove_Url = `${Base_url}/${removeId}`


            let xhr = new XMLHttpRequest()

            xhr.open('DELETE',remove_Url)

            xhr.send(null)

            xhr.onload =function(){
                if(xhr.status >= 200 && xhr.status <= 299){

                    ele.closest('tr').remove()

                    snackbar(`The Comment Id ${removeId} is Removed Successfully!!!`,'success')
                    
                }else{
                    snackbar(xhr)
                }


            spinner.classList.add('d-none')

            }
        }
    });

 }
commentform.addEventListener('submit',onsubmit)
UpdateComment.addEventListener('click',onupdate)