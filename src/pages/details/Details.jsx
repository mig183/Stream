import React from "react";
import { useParams } from "react-router-dom";
import "./style.scss";

import useFetch from "../../hooks/useFetch";
import DetailsBanner from "./detailsBanner/DetailsBanner";
import Cast from "./cast/Cast";
import Similar from "./carousels/Similar";
import Recommendation from "./carousels/Recommendation";

const Details = () => {
    const { mediaType, id } = useParams();
    const { data, loading } = useFetch(`/${mediaType}/${id}/videos`);
    const { data: credits, loading: creditsLoading } = useFetch(
        `/${mediaType}/${id}/credits`
    );

    return (
        <div>
            {/* Cabecera principal con información y botón de reproducir */}
            <DetailsBanner video={data?.results?.[0]} crew={credits?.crew} />
            
            {/* Fila con el reparto de actores */}
            <Cast data={credits?.cast} loading={creditsLoading} />
            
            {/* Películas o series similares */}
            <Similar mediaType={mediaType} id={id} />
            
            {/* Recomendaciones personalizadas del catálogo */}
            <Recommendation mediaType={mediaType} id={id} />
        </div>
    );
};

export default Details;
