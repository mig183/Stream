import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./style.scss";

import useFetch from "../../../hooks/useFetch";

import Img from "../../../components/lazyLoadImage/Img";
import ContentWrapper from "../../../components/contentWrapper/ContentWrapper";

const HeroBanner = () => {
    const [background, setBackground] = useState("");
    const [query, setQuery] = useState("");
    const navigate = useNavigate();
    const { url } = useSelector((state) => state.home);
    const { data, loading } = useFetch("/movie/upcoming");

    useEffect(() => {
        // 🛡️ FILTRO DE SEGURIDAD: Nos quedamos SOLO con las películas que sí tienen imagen de fondo real
        const peliculasConFondo = data?.results?.filter(movie => movie.backdrop_path);
        
        // Nos aseguramos de que haya datos y que la URL base de Redux ya esté disponible
        if (peliculasConFondo && peliculasConFondo.length > 0 && url?.backdrop) {
            // Selecciona una película al azar de la lista segura filtrada
            const randomMovie = peliculasConFondo[Math.floor(Math.random() * peliculasConFondo.length)];
            
            // Construimos la URL uniendo la base de Redux con la ruta de la imagen
            const bg = url.backdrop + randomMovie.backdrop_path;
            setBackground(bg);
        }
    }, [data, url]); // Agregamos 'url' a las dependencias para que recalcule si Redux tarda en cargar

    const searchQueryHandler = (event) => {
        if (event.key === "Enter" && query.length > 0) {
            navigate(`/search/${query}`);
        }
    };

    return (
        <div className="heroBanner">
            {!loading && background && (
                <div className="backdrop-img">
                    <Img src={background} />
                </div>
            )}

            <div className="opacity-layer"></div>
            <ContentWrapper>
                <div className="heroBannerContent">
                    {/* 🚀 Textos traducidos y adaptados a tu plataforma Streamumber */}
                    <span className="title">Bienvenido.</span>
                    <span className="subTitle">
                        Millones de películas y series por descubrir. 
                        Explora ahora el catálogo.
                    </span>
                    <div className="searchInput">
                        <input
                            type="text"
                            placeholder="Buscar películas o series..."
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyUp={searchQueryHandler}
                        />
                        <button onClick={() => query.length > 0 && navigate(`/search/${query}`)}>
                            Buscar
                        </button>
                    </div>
                </div>
            </ContentWrapper>
        </div>
    );
};

export default HeroBanner;
