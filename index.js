// Obtém referências aos elementos relevantes
const openModalButton = document.getElementById("open-modal-button");
const modal = document.getElementById("modal");
const closeModal = modal.querySelector(".close");
const postForm = document.getElementById("post-form");
const photoInput = document.getElementById("photo-input");
const titleInput = document.getElementById("title-input");
const captionInput = document.getElementById("caption-input");
const postInfoDiv = document.getElementById("post-info");
const localStorage = window.localStorage;
let isEditMode = false;
let currentPost;

// Função para converter o arquivo de imagem em base64
function getbase64(file, callback) {
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
    callback(reader.result); // Chama o callback com o resultado da conversão para base64
  };
  reader.onerror = function (error) {
    console.log("Error: ", error);
  };
}

// Função para excluir um post pelo ID
const deletePostById = (id, callback) => {
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  const filteredPosts = posts.filter((item) => item.postId !== id);
  localStorage.setItem("posts", JSON.stringify(filteredPosts));
  callback("success");
};

// Função para obter um post pelo ID
const getPostById = (id) => {
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  const filteredPosts = posts.filter((item) => item.postId === id);
  return filteredPosts[0];
};

// Função para substituir um post pelo ID
const replacePostById = (id, newPost, callback) => {
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  const filteredPosts = posts.filter((item) => item.postId !== id);
  filteredPosts.push(newPost);
  localStorage.setItem("posts", JSON.stringify(filteredPosts));
  callback("success");
};

/// Função para editar um post pelo ID
const editPostById = (id, callback) => {
  isEditMode = true;
  const modalForm = document.querySelector("#post-form");
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  const filteredPosts = posts.filter((item) => item.postId === id);
  const post = filteredPosts[0];

  const imageElement = modalForm.querySelector("#photo-input");
  const titleElement = modalForm.querySelector("#title-input");
  const captionElement = modalForm.querySelector("#caption-input");

  // Define os valores dos campos do formulário com os dados do post selecionado
  imageElement.value = "";
  titleElement.value = post.title;
  captionElement.value = post.caption;

  const buttonSubmit = modalForm.querySelector("#submit-modal-button");
  buttonSubmit.addEventListener("click", function () {
    if (imageElement.files.length > 0) {
      // Se uma nova imagem for selecionada, converte-a para base64
      getbase64(imageElement.files[0], function (base64) {
        const newPost = {
          postId: post.postId,
          title: titleElement.value,
          caption: captionElement.value,
          photoURL: base64,
        };
        // Substitui o post existente pelo novo post no armazenamento local
        replacePostById(post.postId, newPost, function (response) {
          modal.style.display = "none";
          refreshPosts(loadPostFromLocalStorage());
          window.location.reload(); // Recarregar a página
        });
      });
    } else {
      // Se nenhuma nova imagem for selecionada, mantém a imagem existente
      const newPost = {
        postId: post.postId,
        title: titleElement.value,
        caption: captionElement.value,
        photoURL: post.photoURL,
      };
      // Substitui o post existente pelo novo post no armazenamento local
      replacePostById(post.postId, newPost, function (response) {
        modal.style.display = "none";
        refreshPosts(loadPostFromLocalStorage());
        window.location.reload(); // Recarregar a página
      });
    }
  });

  isEditMode = false;
  callback("success");
};

// ...

// Função para limpar a seção de posts
const clearPostSection = () => {
  const postSection = document.querySelector(".posts-container");
  postSection.innerHTML = "";
};

// Função para carregar os posts do armazenamento local
function loadPostFromLocalStorage() {
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  return posts;
}

// Função para filtrar o conteúdo dos posts com base em uma pesquisa
function filterContent() {
  const posts = loadPostFromLocalStorage();
  const searchInput = document.querySelector("#search-input");
  const filteredPosts = posts.filter((item) => {
    const title = item.title.toLowerCase();
    const caption = item.caption.toLowerCase();
    const search = searchInput.value.toLowerCase();
    return title.includes(search) || caption.includes(search);
  });
  refreshPosts(filteredPosts);
}

// Função para atualizar a exibição dos posts
function refreshPosts(posts) {
  clearPostSection();
  const postSection = document.querySelector(".posts-container");

  posts.forEach((item) => {
    const postContainer = document.createElement("div");
    const imageElement = document.createElement("img");
    const postInfo = document.createElement("div");
    const titleElement = document.createElement("h3");
    const captionElement = document.createElement("p");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    imageElement.classList.add("post-image");
    imageElement.src = item.photoURL;
    imageElement.alt = item.title;
    titleElement.textContent = item.title;
    captionElement.textContent = item.caption;
    editButton.textContent = "Editar";
    editButton.classList.add("edit-button");
    deleteButton.textContent = "Excluir";
    deleteButton.classList.add("delete-button");

    postContainer.classList.add("post");
    postInfo.classList.add("post-info-content");
    postInfo.classList.add("post-info-buttons");

    postInfo.appendChild(editButton);
    postInfo.appendChild(deleteButton);

    postContainer.appendChild(imageElement);
    postContainer.appendChild(titleElement);
    postContainer.appendChild(captionElement);
    postContainer.appendChild(postInfo);

    postSection.appendChild(postContainer);

    editButton.addEventListener("click", function () {
      // Ao clicar no botão "Editar", chama a função para editar o post
      editPostById(item.postId, function (response) {
        refreshPosts(loadPostFromLocalStorage());
      });
      modal.style.display = "block";
    });

    deleteButton.addEventListener("click", function () {
      // Ao clicar no botão "Excluir", chama a função para excluir o post
      deletePostById(item.postId, function (response) {
        refreshPosts(loadPostFromLocalStorage());
      });
    });
  });
}

// Função executada quando a página é carregada
document.addEventListener("DOMContentLoaded", () => {
  refreshPosts(loadPostFromLocalStorage());
});

// Função para abrir o modal
openModalButton.addEventListener("click", function () {
  modal.style.display = "block";
  isEditMode = false;
  currentPost = null;
});

// Função para fechar o modal
closeModal.addEventListener("click", function () {
  modal.style.display = "none";
  photoInput.value = "";
  titleInput.value = "";
  captionInput.value = "";
});

// Função para lidar com o envio do formulário
postForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const file = photoInput.files[0];
  const title = titleInput.value;
  const caption = captionInput.value;

  if (title === "" || caption === "") {
    alert("Por favor, insira um título e uma legenda antes de enviar o formulário.");
    return;
  }

  photoInput.value = "";
  titleInput.value = "";
  captionInput.value = "";

  if (isEditMode && currentPost) {
    // Modo de edição
    getbase64(file, function (base64) {
      // Fazer algo com a imagem em base64, se necessário

      // Atualizar o post existente
      const newPost = {
        postId: currentPost.postId,
        title: title,
        caption: caption,
        photoURL: base64,
      };
      replacePostById(currentPost.postId, newPost, function (response) {
        modal.style.display = "none";
        refreshPosts(loadPostFromLocalStorage());
        window.location.reload(); // Recarregar a página
      });
    });
  } else {
    // Modo de adição
    getbase64(file, function (base64) {
      const localStorageLength = localStorage.getItem("posts") === null
        ? 1
        : localStorage.getItem("posts").length;
      const postId = `post-${localStorageLength}`;

      const newPost = {
        postId: postId,
        title: title,
        caption: caption,
        photoURL: base64,
      };

      const posts = JSON.parse(localStorage.getItem("posts") || "[]");
      posts.push(newPost);
      localStorage.setItem("posts", JSON.stringify(posts));

      modal.style.display = "none";
      refreshPosts(loadPostFromLocalStorage());
      window.location.reload(); // Recarregar a página
    });
  }
});
