import { PaginationContainer } from "./styles/paginationComponent";
import { Button, ToggleButton } from "./styles/shared";
import { pageWindow } from "../utils/pagination";
import { useTranslation } from "react-i18next";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useTranslation();

  return (
    <PaginationContainer aria-label={t("pagination.label")}>
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        {t("pagination.previous")}
      </Button>

      {pageWindow(currentPage, totalPages).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} aria-hidden="true">
            …
          </span>
        ) : (
          <ToggleButton
            key={item}
            $active={item === currentPage}
            aria-current={item === currentPage ? "page" : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </ToggleButton>
        ),
      )}

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        {t("pagination.next")}
      </Button>
    </PaginationContainer>
  );
}
