const API_KEY = "TU_API_KEY_AQUI";
const IMG = "https://image.tmdb.org/t/p/w500";

const trendingContainer = document.getElementById("trending");
const popularContainer = document.getElementById("popular");

const banner = document.getElementById("banner");
const bannerTitle = document.getElementById("banner-title");
const bannerDesc = document.getElementById("banner-desc");

const modal = document.getElementById("modal");
const video = document.getElementById("video");
const closeBtn = document.getElementById("close");

let bannerSet = false;

// FETCH FUNC MEJORADA
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

                // REDIRECCIÓN A PÁGINA INDIVIDUAL
                btn.onclick = () => {
                    window.location.href = `movie.html?id=${movie.id}`;
                };

                // TRAILER RÁPIDO (DOBLE CLICK)
                img.ondblclick = () => openModal(movie.id);

                card.appendChild(img);
                card.appendChild(title);
                card.appendChild(btn);

                container.appendChild(card);
            });

        // Banner solo una vez
        if (!bannerSet && data.results.length > 0) {
            const random = data.results[Math.floor(Math.random() * data.results.length)];

            if (random.backdrop_path) {
                banner.style.backgroundImage = `url(${IMG + random.backdrop_path})`;
            }

            bannerTitle.textContent = random.title;
            bannerDesc.textContent = random.overview || "Sin descripción disponible";
            bannerSet = true;
        }

    } catch (error) {
        console.error("Error cargando películas:", error);
    }
}

// TRAILER
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

// CLOSE MODAL
closeBtn.onclick = () => {
    modal.style.display = "none";
    video.src = "";
};

// CERRAR HACIENDO CLICK FUERA
window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
        video.src = "";
    }
};

// SEARCH MEJORADO (DEBOUNCE)
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

// LOAD INICIAL
getMovies(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`, trendingContainer);
getMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`, popularContainer);