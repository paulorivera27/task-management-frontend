import { filters } from "../utils/constants";
import { useTranslation } from "react-i18next";
import { FilterBar, FilterButton } from "./styles/componentStyles";

interface TaskFilterProps {
  current: string | null;
  onChange: (status: string | null) => void;
}

export default function TaskFilter({ current, onChange }: TaskFilterProps) {
  const { t } = useTranslation();

  return (
    <FilterBar>
      {filters.map((filter) => (
        <FilterButton
          key={filter.label}
          $active={current === filter.value}
          onClick={() => onChange(filter.value)}
        >
          {t(filter.label)}
        </FilterButton>
      ))}
    </FilterBar>
  );
}
