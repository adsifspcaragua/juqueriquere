import "../styles/PageSkeleton.css";

interface SkeletonProps {
    width?: string;
    height?: string;
    borderRadius?: string;
    className?: string;
}

interface PageSkeletonProps {
    cards?: number;
    showFilters?: boolean;
    showDescription?: boolean;
    type?: "cards" | "list" | "map";
}


/* =========================================================
   SKELETON BASE
   ========================================================= */

function Skeleton({
    width = "100%",
    height = "1rem",
    borderRadius = "8px",
    className = "",
}: SkeletonProps) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                width,
                height,
                borderRadius,
            }}
            aria-hidden="true"
        />
    );
}


/* =========================================================
   CARD SKELETON
   ========================================================= */

function CardSkeleton() {
    return (
        <div className="pageSkeletonCard">

            <Skeleton
                height="180px"
                borderRadius="12px"
            />

            <div className="vertical gap10">

                <Skeleton
                    width="70%"
                    height="22px"
                />

                <Skeleton
                    width="90%"
                    height="14px"
                />

                <Skeleton
                    width="55%"
                    height="14px"
                />

            </div>

        </div>
    );
}


/* =========================================================
   LIST SKELETON
   ========================================================= */

function ListSkeleton() {
    return (
        <div className="pageSkeletonList">

            <Skeleton
                width="100%"
                height="70px"
                borderRadius="12px"
            />

            <Skeleton
                width="100%"
                height="70px"
                borderRadius="12px"
            />

            <Skeleton
                width="100%"
                height="70px"
                borderRadius="12px"
            />

            <Skeleton
                width="100%"
                height="70px"
                borderRadius="12px"
            />

        </div>
    );
}


/* =========================================================
   MAP SKELETON
   ========================================================= */

function MapSkeleton() {
    return (
        <Skeleton
            width="100%"
            height="450px"
            borderRadius="16px"
        />
    );
}


/* =========================================================
   PAGE SKELETON
   ========================================================= */

export default function PageSkeleton({
    cards = 6,
    showFilters = false,
    showDescription = false,
    type = "cards",
}: PageSkeletonProps) {

    return (
        <main className="pageSkeleton">

            <div className="paddingHeader"></div>

            <section className="conteudo vertical gap30">


                {/* =================================================
                   CABEÇALHO
                ================================================= */}

                <div className="vertical gap15">

                    <Skeleton
                        width="220px"
                        height="32px"
                    />

                    {showDescription && (
                        <>
                            <Skeleton
                                width="90%"
                                height="16px"
                            />

                            <Skeleton
                                width="70%"
                                height="16px"
                            />
                        </>
                    )}

                </div>


                {/* =================================================
                   FILTROS
                ================================================= */}

                {showFilters && (
                    <div className="pageSkeletonFilters">

                        <Skeleton
                            width="180px"
                            height="42px"
                        />

                        <Skeleton
                            width="180px"
                            height="42px"
                        />

                    </div>
                )}


                {/* =================================================
                   CONTEÚDO
                ================================================= */}

                {type === "cards" && (
                    <div className="pageSkeletonGrid">

                        {Array.from({ length: cards }).map((_, index) => (
                            <CardSkeleton key={index} />
                        ))}

                    </div>
                )}


                {type === "list" && (
                    <ListSkeleton />
                )}


                {type === "map" && (
                    <MapSkeleton />
                )}


            </section>

        </main>
    );
}