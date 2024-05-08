import {
  Book,
  ConductorSearchResponseAuthor,
  ConductorSearchResponseFile,
  Project,
} from "../../../types";
import CatalogCard from "./CatalogCard";
import "../Commons.css";
import PlaceholderCard from "./PlaceholderCard";

const VisualMode = ({
  items,
  loading,
  noResultsMessage,
  lastElementRef,
}: {
  items: (
    | Book
    | ConductorSearchResponseFile
    | Project
    | ConductorSearchResponseAuthor
  )[];
  loading?: boolean;
  noResultsMessage?: string;
  lastElementRef?: any;
}) => {
  if (items.length > 0) {
    return (
      <div className="commons-content-card-grid">
        {items.map((item) => (
          <CatalogCard item={item} key={crypto.randomUUID()} />
        ))}
        {loading && (
          <>
            {[...Array(10)].map((_, index) => (
              <PlaceholderCard key={index} />
            ))}
          </>
        )}
        <div ref={lastElementRef}></div>
      </div>
    );
  }

  if (items.length === 0 && loading) {
    return (
      <div className="commons-content-card-grid">
        {[...Array(10)].map((_, index) => (
          <PlaceholderCard key={index} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className="text-center italic">
        {noResultsMessage ??
          "No results found - Try adjusting your search or filters."}
      </p>
    </div>
  );
};

export default VisualMode;
