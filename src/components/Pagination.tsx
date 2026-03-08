import {
  Button,
  PaginationButton,
  PaginationContainer,
} from "./styles/componentStyles";
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

      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (page) => (
          <PaginationButton
            key={page}
            $active={page === currentPage}
            onClick={() => onPageChange(page)}
          >
            {page}
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
