import React, { useState, useEffect } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { SlMenu } from "react-icons/sl";
import { VscChromeClose } from "react-icons/vsc";
import { useNavigate, useLocation } from "react-router-dom";

import "./style.scss";

import ContentWrapper from "../contentWrapper/ContentWrapper";

const Header = () => {
    const [show, setShow] = useState("top");
    const [lastScrollY, setLastScrollY] = useState(0);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [query, setQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
        setShowSearch(false);
    }, [location]);

    const controlNavbar = () => {
        if (window.scrollY > 200) {
            if (window.scrollY > lastScrollY && !mobileMenu) {
                setShow("hide");
            } else {
                setShow("show");
            }
        } else {
            setShow("top");
        }
        setLastScrollY(window.scrollY);
    };

    useEffect(() => {
        window.addEventListener("scroll", controlNavbar);
        return () => {
            window.removeEventListener("scroll", controlNavbar);
        };
    }, [lastScrollY]);

    // 🚀 MISMA LÓGICA DEL GRANDE: Limpia y formatea la cadena de texto de forma idéntica
    const searchQueryHandler = (event) => {
        // .trim() corta espacios muertos a los lados y validamos que la consulta no vaya vacía
        if (event.key === "Enter" && query.trim().length > 0) {
            
            // Reemplaza múltiples espacios internos por un único espacio limpio antes de navegar
            const consultaFormateada = query.trim().replace(/\s+/g, " ");
            
            // Navegamos pasando el string limpio que tu SearchResult.jsx sabe descodificar perfectamente
            navigate(`/search/${consultaFormateada}`);
            
            setTimeout(() => {
                setShowSearch(false);
            }, 1000);
        }
    };

    const openSearch = () => {
        if (location.pathname === "/") return;
        setMobileMenu(false);
        setShowSearch(true);
    };

    const openMobileMenu = () => {
        setMobileMenu(true);
        setShowSearch(false);
    };

    const navigationHandler = (type) => {
        if (type === "movie") {
            navigate("/explore/movie");
        } else {
            navigate("/explore/tv");
        }
        setMobileMenu(false);
    };

    return (
        <header className={`header ${mobileMenu ? "mobileView" : ""} ${show}`}>
            <ContentWrapper>
                <div className="logo" onClick={() => navigate("/")}>
                    {/* 🛠️ FIJADO: Modificado a la propiedad fontWeight de CSS válida */}
                    <h1 style={{ color: "#E50914", margin: 0, fontSize: "24px", fontWeight: "bold", cursor: "pointer", letterSpacing: "1px" }}>
                        STREAM<span style={{ color: "#fff" }}>UMBER</span>
                    </h1>
                </div>
                <ul className="menuItems">
                    <li
                        className="menuItem"
                        onClick={() => navigationHandler("movie")}
                    >
                        Películas
                    </li>
                    <li
                        className="menuItem"
                        onClick={() => navigationHandler("tv")}
                    >
                        Series
                    </li>
                    {location.pathname !== "/" && (
                        <li className="menuItem">
                            <HiOutlineSearch onClick={openSearch} />
                        </li>
                    )}
                </ul>

                <div className="mobileMenuItems">
                    {location.pathname !== "/" && (
                        <HiOutlineSearch onClick={openSearch} />
                    )}
                    {mobileMenu ? (
                        <VscChromeClose onClick={() => setMobileMenu(false)} />
                    ) : (
                        <SlMenu onClick={openMobileMenu} />
                    )}
                </div>
            </ContentWrapper>
            {showSearch && location.pathname !== "/" && (
                <div className="searchBar">
                    <ContentWrapper>
                        <div className="searchInput">
                            <input
                                type="text"
                                placeholder="Buscar películas o series..."
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyUp={searchQueryHandler}
                            />
                            <VscChromeClose
                                onClick={() => setShowSearch(false)}
                            />
                        </div>
                    </ContentWrapper>
                </div>
            )}
        </header>
    );
};

export default Header;
