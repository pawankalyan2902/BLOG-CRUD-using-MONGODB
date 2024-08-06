const comment_btn = document.querySelector("#btn");
const ajax_data = document.getElementById("ajax_data");
const form_btn = document.querySelector("#form_comments");
const title_input = document.querySelector("#title");
const comment_input = document.querySelector("#comm");
const comment_section = document.getElementById("comment_section");
const comment_section_p = document.querySelector("#comment_section p");

//Helps to put the fetched data into a list
function comments(datas) {
    ul = document.createElement("ul");
    let list;
    for (let data of datas) {
        section = document.createElement("section");
        let comments = document.createElement("li")
        comments.innerHTML = `
        <h1>${data.title}</h1>
        <p>${data.comment}</p>
        `;
        section.appendChild(comments);
        ul.append(section);
    }
    console.log(ul)
    const list_of_comments = ul;
    return list_of_comments;
}

//Fetches the data 
async function comments_display() {
    ajax_data.style.display = "block";
    comment_section.style.display = "none";
    const id = comment_btn.dataset.post;
    const result = await fetch(`/comments/${id}`);//It fetches from server side and retures a promise encoded by json object
    const datas = await result.json();
    console.log(datas.length)
    if (!(datas && datas.length > 0)) {
        ajax_data.style.display = "none";
        comment_btn.style.display = "none";
        comment_section_p.innerHTML = "<p>No comments are given,try adding some! </p>"

    } else {
        const info = comments(datas);
        ajax_data.innerHTML = "";
        ajax_data.append(info);
    }

}
//stores the data
async function comment_form(event) {
    event.preventDefault();//prevents the default event that take place(form submission)
    const data = { title: title_input.value, comment: comment_input.value, tech_id: form_btn.dataset.post };
    try{
    const result = await fetch("/comment/" + form_btn.dataset.post + "/store", {
        method: "post",//setting the method because default fetch() as a get method
        body: JSON.stringify(data),//in fetch data is encodedto json format and sent
        headers: {
            "Content-Type": "application/json"
        }//the middleware express.json() will check the header to decode
    }
    
    )}catch(error)
    {
        alert("technical error")
    }
     //handling server side error in browser side js
     console.log(result.ok)
     if (result.ok) {
         
         comments_display();
     }
     else {
         alert("server side error")
     }
 }
form_btn.addEventListener("submit", comment_form)

comment_btn.addEventListener("click", comments_display);