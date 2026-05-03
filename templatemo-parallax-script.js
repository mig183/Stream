// ================= API =================
const API_KEY = "TU_API_KEY_AQUI";
const IMG = "https://image.tmdb.org/t/p/w500";

// ================= ELEMENTOS =================
const trendingContainer = document.getElementById("trending");
const popularContainer = document.getElementById("popular");

const banner = document.getElementById("banner");
const bannerTitle = document.getElementById("banner-title");
const bannerDesc = document.getElementById("banner-desc");

// 🎬 modal trailer
const trailerModal = document.getElementById("modal");
const video = document.getElementById("video");
const closeTrailer = document.getElementById("close");

// 🔐 modal login
const authModal = document.getElementById("authModal");

let isLogin = true;
let bannerSet = false;

// ================= UI USUARIO =================
function updateUI() {
    const isLogged = localStorage.getItem("logged");
    const user = localStorage.getItem("currentUser");
    const avatar = localStorage.getItem("avatar");

    if (isLogged === "true") {
        document.querySelector(".navbar p").innerHTML = `
            <img src="${avatar}" class="nav-avatar">
            ${user}
            <button onclick="logout()" style="margin-left:10px;">Salir</button>
        `;
    }
}

// ================= LOGOUT =================
function logout() {
    localStorage.clear();
    alert("Sesión cerrada");
    location.reload();
}

// ================= MODAL LOGIN =================
function toggleModal() {
    if (authModal.style.display === "block") {
        authModal.style.display = "none";
    } else {
        authModal.style.display = "block";

        // 👇 siempre abre en login
        isLogin = true;

        document.getElementById("modalTitle").textContent = "Iniciar Sesión";
        document.querySelector(".modal-content button").textContent = "Entrar";

        document.getElementById("switchText").innerHTML =
            '¿No tienes cuenta? <span onclick="switchMode()">Regístrate</span>';
    }
}

// abrir registro directo
function openRegister() {
    authModal.style.display = "block";

    isLogin = false;

    document.getElementById("modalTitle").textContent = "Registrarse";
    document.querySelector(".modal-content button").textContent = "Crear cuenta";

    document.getElementById("switchText").innerHTML =
        '¿Ya tienes cuenta? <span onclick="switchMode()">Inicia sesión</span>';
}

// cambiar modo
function switchMode() {
    isLogin = !isLogin;

    document.getElementById("modalTitle").textContent = isLogin 
        ? "Iniciar Sesión" 
        : "Registrarse";

    document.querySelector(".modal-content button").textContent = isLogin 
        ? "Entrar" 
        : "Crear cuenta";

    document.getElementById("switchText").innerHTML = isLogin 
        ? '¿No tienes cuenta? <span onclick="switchMode()">Regístrate</span>'
        : '¿Ya tienes cuenta? <span onclick="switchMode()">Inicia sesión</span>';
}

// ================= LOGIN / REGISTRO =================
function login() {
    const user = document.getElementById("user").value;
    const pass = document.getElementById("pass").value;
    const avatarInput = document.getElementById("avatar").value;

    if (!user || !pass) {
        alert("Completa los campos");
        return;
    }

    if (isLogin) {
        const savedUser = localStorage.getItem("user");
        const savedPass = localStorage.getItem("pass");

        if (user === savedUser && pass === savedPass) {
            localStorage.setItem("logged", "true");
            localStorage.setItem("currentUser", user);

            alert("Bienvenido " + user);
            toggleModal();
            updateUI();
        } else {
            alert("Datos incorrectos");
        }

    } else {
        localStorage.setItem("user", user);
        localStorage.setItem("pass", pass);
        localStorage.setItem("avatar", avatarInput || "https://i.imgur.com/1X6Yb6G.png");

        alert("Cuenta creada correctamente 🔥");
        switchMode();
    }
}

// ================= FETCH PELÍCULAS =================
async function getMovies(url, container) {
    try {
        const res = await fetch(url);
        const data = await res.json();

        container.innerHTML = "";

        data.results
            .filter(movie => movie.poster_path)
            .forEach(movie => {

                const card = document.createElement("div");
                card.classList.add("movie-card");

                const img = document.createElement("img");
                img.src = IMG + movie.poster_path;

                const title = document.createElement("p");
                title.textContent = movie.title;

                const btn = document.createElement("button");
                btn.textContent = "Ver ahora";

                btn.onclick = () => {
                    window.location.href = `movie.html?id=${movie.id}`;
                };

                img.ondblclick = () => openTrailer(movie.id);

                card.appendChild(img);
                card.appendChild(title);
                card.appendChild(btn);

                container.appendChild(card);
            });

    } catch (error) {
        console.error("Error:", error);
    }
}

// ================= TRAILER =================
async function openTrailer(id) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`);
        const data = await res.json();

        const trailer = data.results.find(v => v.type === "Trailer");

        if (trailer) {
            video.src = `https://www.youtube.com/embed/${trailer.key}`;
            trailerModal.style.display = "flex";
        } else {
            alert("No hay trailer");
        }

    } catch (error) {
        console.error(error);
    }
}

// cerrar trailer
closeTrailer.onclick = () => {
    trailerModal.style.display = "none";
    video.src = "";
};

// ================= CERRAR MODALES =================
window.onclick = (e) => {
    if (e.target === authModal) {
        authModal.style.display = "none";
    }

    if (e.target === trailerModal) {
        trailerModal.style.display = "none";
        video.src = "";
    }
};

// ================= BUSCADOR =================
let timeout;

document.getElementById("search").addEventListener("keyup", function() {
    clearTimeout(timeout);

    timeout = setTimeout(async () => {
        const query = this.value.trim();

        if (query.length > 2) {
            const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`);
            const data = await res.json();

            trendingContainer.innerHTML = "";

            data.results.forEach(movie => {
                const div = document.createElement("div");
                div.innerHTML = `
                    <img src="${IMG + movie.poster_path}">
                    <p>${movie.title}</p>
                `;
                trendingContainer.appendChild(div);
            });
        }
    }, 400);
});

// ================= INIT =================
window.onload = () => {
    updateUI();

    getMovies(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`, trendingContainer);
    getMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`, popularContainer);
};
