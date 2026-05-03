// ================= API =================
const API_KEY = "TU_API_KEY_AQUI";
const IMG = "https://image.tmdb.org/t/p/w500";

// ================= ELEMENTOS =================
const trendingContainer = document.getElementById("trending");
const popularContainer = document.getElementById("popular");

const banner = document.getElementById("banner");
const bannerTitle = document.getElementById("banner-title");
const bannerDesc = document.getElementById("banner-desc");

const modal = document.getElementById("modal");
const video = document.getElementById("video");
const closeBtn = document.getElementById("close");

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
    localStorage.removeItem("logged");
    localStorage.removeItem("currentUser");

    alert("Sesión cerrada");
    location.reload();
}

// ================= MODAL =================
function toggleModal() {
    const modal = document.getElementById("authModal");
    modal.style.display = modal.style.display === "block" ? "none" : "block";
}

// abrir registro directo

function openRegister() {
    const modal = document.getElementById("authModal");

    modal.style.display = "block";

    isLogin = false; // 👈 IMPORTANTE (modo registro)

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
        // LOGIN
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
        // REGISTRO
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
                img.loading = "lazy";

                const title = document.createElement("p");
                title.textContent = movie.title;

                const btn = document.createElement("button");
                btn.textContent = "Ver ahora";

                btn.onclick = () => {
                    window.location.href = `movie.html?id=${movie.id}`;
                };

                // doble click = trailer
                img.ondblclick = () => openModal(movie.id);

                card.appendChild(img);
                card.appendChild(title);
                card.appendChild(btn);

                container.appendChild(card);
            });

        // banner solo una vez
        if (!bannerSet && data.results.length > 0) {
            const random = data.results[Math.floor(Math.random() * data.results.length)];

            if (random.backdrop_path) {
                banner.style.backgroundImage = `url(${IMG + random.backdrop_path})`;
            }

            bannerTitle.textContent = random.title;
            bannerDesc.textContent = random.overview || "Sin descripción";
            bannerSet = true;
        }

    } catch (error) {
        console.error("Error cargando películas:", error);
    }
}

// ================= TRAILER =================
async function openModal(id) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`);
        const data = await res.json();

        const trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");

        if (trailer) {
            video.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
            modal.style.display = "flex";
        } else {
            alert("No hay trailer disponible");
        }

    } catch (error) {
        console.error("Error cargando trailer:", error);
    }
}

// cerrar modal
closeBtn.onclick = () => {
    modal.style.display = "none";
    video.src = "";
};

// cerrar haciendo click afuera
window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
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
            try {
                const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
                const data = await res.json();

                trendingContainer.innerHTML = "";

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

                        card.appendChild(img);
                        card.appendChild(title);
                        card.appendChild(btn);

                        trendingContainer.appendChild(card);
                    });

            } catch (error) {
                console.error("Error en búsqueda:", error);
            }
        }
    }, 400);
});

// ================= INIT =================
window.onload = function() {
    updateUI();

    getMovies(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`, trendingContainer);
    getMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`, popularContainer);
};
