import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";

import "./style.scss";

import { fetchDataFromApi } from "../../utils/api";
import ContentWrapper from "../../components/contentWrapper/ContentWrapper";
import MovieCard from "../../components/movieCard/MovieCard";
import Spinner from "../../components/spinner/Spinner";

const SearchResult = () => {
    const [data, setData] = useState(null);
    const [pageNum, setPageNum] = useState(1);
    const [loading, setLoading] = useState(false);
    const [resultadosOrdenados, setResultadosOrdenados] = useState([]); 
    const { query } = useParams();

    // 🧠 ALGORITMO INTEGRAL: Busca coincidencias en cualquier parte del título
    // y posiciona las películas más populares y taquilleras arriba de la grilla.
    const procesarYOrdenarResultados = (listaOriginal) => {
        if (!listaOriginal) return [];
        
        return [...listaOriginal].sort((a, b) => {
            const popularidadA = a.vote_count || 0;
            const popularidadB = b.vote_count || 0;
            
            // Ordena estrictamente de mayor a menor popularidad en TMDb
            return popularidadB - popularidadA; 
        });
    };

    const fetchInitialData = () => {
        setLoading(true);
        fetchDataFromApi(`/search/multi?query=${query}&page=${pageNum}`).then(
            (res) => {
                setData(res);
                setPageNum((prev) => prev + 1);

                // Ordenamos los primeros resultados de forma fluida
                const ordenados = procesarYOrdenarResultados(res?.results);
                setResultadosOrdenados(ordenados);
                
                setLoading(false);
            }
        ).catch(() => setLoading(false));
    };

    const fetchNextPageData = () => {
        fetchDataFromApi(`/search/multi?query=${query}&page=${pageNum}`).then(
            (res) => {
                if (data?.results) {
                    const nuevaListaOriginal = [...data.results, ...(res?.results || [])];
                    setData({
                        ...data,
                        results: nuevaListaOriginal,
                    });

                    const listaCompletaOrdenada = procesarYOrdenarResultados(nuevaListaOriginal);
                    setResultadosOrdenados(listaCompletaOrdenada);
                } else {
                    setData(res);
                    setResultadosOrdenados(procesarYOrdenarResultados(res?.results));
                }
                setPageNum((prev) => prev + 1);
            }
        );
    };

    useEffect(() => {
        setPageNum(1);
        fetchInitialData();
    }, [query]);

    return (
        <div className="searchResultsPage">
            {loading && <Spinner initial={true} />}
            {!loading && (
                <ContentWrapper>
                    {resultadosOrdenados.length > 0 ? (
                        <>
                            <div className="pageTitle">
                                {`Resultados de búsqueda para '${query}':`}
                            </div>
                            <InfiniteScroll
                                className="content"
                                dataLength={resultadosOrdenados.length}
                                next={fetchNextPageData}
                                hasMore={pageNum <= data?.total_pages}
                                loader={<Spinner />}
                            >
                                {resultadosOrdenados.map((item, index) => {
                                    if (item.media_type === "person") return null;
                                    return (
                                        <MovieCard
                                            key={`${item.id}-${index}`}
                                            data={item}
                                            fromSearch={true}
                                        />
                                    );
                                })}
                            </InfiniteScroll>
                        </>
                    ) : (
                        <span className="resultNotFound">
                            No se encontraron resultados.
                        </span>
                    )}
                </ContentWrapper>
            )}
        </div>
    );
};

export default SearchResult;
