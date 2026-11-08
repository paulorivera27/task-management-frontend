import {
  PaginationButton,
  PaginationContainer,
} from "./styles/paginationComponent";
import { Button } from "./styles/shared";
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
    <PaginationContainer>
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        {t("pagination.previous")}
      </Button>

      {pageWindow(currentPage, totalPages).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`}>…</span>
        ) : (
          <PaginationButton
            key={item}
            $active={item === currentPage}
            onClick={() => onPageChange(item)}
          >
            {item}
          </PaginationButton>
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
