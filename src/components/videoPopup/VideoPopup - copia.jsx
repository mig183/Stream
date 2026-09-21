import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./style.scss";
import { misPeliculas } from "../../peliculas"; 

const VideoPopup = ({ show, setShow, videoId, setVideoId }) => {
    const location = useLocation();

    const hidePopup = () => {
        setShow(false);
        setVideoId(null);
    };

    // Extraemos solo los dígitos del ID numérico puro de TMDb
    const idTMDb = videoId ? String(videoId).replace(/\D/g, "") : "";
    
    // Prioridad manual por si tienes tus propios enlaces en peliculas.js
    const peliculaActual = misPeliculas[idTMDb];

    // Detectamos si estamos en la sección de televisión o películas
    const esSerie = location.pathname.includes("/tv/");
    
    // 🔑 TUS CREDENCIALES COMPROBADAS DE VIMEUS
    const MI_API_KEY = "ak_w0PswI95e0UD0FH9nHiFKzn7RPnL0zfO";
    const MI_VIEW_KEY = "7jA-6-CG7IPtUalET7O4wmpsmNKi-GP2e_ZHCMYfTXI";

    /* 
        LÓGICA DE UNIFICACIÓN DEFINITIVA SIN ERRORES:
       - Películas: INTÁCTAS tal cual las tenías funcionando al 100%.
       - Series: Reparada la subruta '/e/serie?tmdb=' e inyectado el autoplay + view_key directo del ejemplo.
    */
    let videoUrlFinal = "";
    let esIframeHtml = false;
    
    if (peliculaActual) {
        videoUrlFinal = peliculaActual.videoUrl;
        // 🌟 DETECCIÓN: Si el contenido manual tiene código de etiqueta iframe, activamos la inyección HTML
        if (videoUrlFinal && videoUrlFinal.includes("<iframe")) {
            esIframeHtml = true;
        }
    } else {
        if (esSerie) {
            // 📺 Series (Arreglado con tu ejemplo): Ruta oficial /e/serie + ID + Autoplay + View Key sin api_key
            videoUrlFinal = "https://vimeus.com/e/serie?tmdb=" + idTMDb + "&autoplay=1&view_key=" + MI_VIEW_KEY;
        } else {
            // 🎬 Películas (INTACTO): Mantiene tu estructura original que ya te funciona perfecto
            videoUrlFinal = "https://vimeus.com/e/movie?tmdb=" + idTMDb + "&autoplay=1&api_key=" + MI_API_KEY + "&view_key=" + MI_VIEW_KEY;
        }
    }

    // 🛡️ Bloqueador del desplazamiento de fondo
    useEffect(() => {
        if (show) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "visible";
        }
        return () => {
            document.body.style.overflow = "visible";
        };
    }, [show]);

    return (
        <div className={`videoPopup ${show ? "visible" : ""}`}>
            <div className="opacityLayer" onClick={hidePopup}></div>
            <div className="videoPlayer">
                <span className="closeBtn" onClick={hidePopup}>
                    Cerrar
                </span>
                {show && idTMDb ? (
                    <>
                        {/* 🌟 CASO A: Si es un código iFrame HTML completo (Simbad de Tokyvideo), lo inyecta nativo sin romper a Vite */}
                        {esIframeHtml ? (
                            <div 
                                className="iframe-html-wrapper"
                                style={{ width: "100%", height: "100%" }}
                                dangerouslySetInnerHTML={{ __html: videoUrlFinal }}
                            />
                        ) : (
                            /* 🎬 CASO B: Tu iframe e inyecciones de Vimeus/enlaces tradicionales COMPLETAMENTE INTÁCTAS */
                            <iframe
                                src={videoUrlFinal} 
                                width="100%"
                                height="100%"
                                allowFullScreen
                                scrolling="auto"
                                frameBorder="0"
                                title="Streamumber Cinema Player"
                                style={{ border: "none", backgroundColor: "#000", borderRadius: "10px" }}
                                referrerPolicy="no-referrer-when-downgrade"
                                sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation allow-popups allow-popups-to-escape-sandbox"
                                allow="autoplay; encrypted-media; fullscreen; picture-in-picture; web-share"
                            ></iframe>
                        )}
                    </>
                ) : (
                    show && (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#fff" }}>
                            <h3>Conectando con el servidor oficial de Vimeus...</h3>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default VideoPopup;
