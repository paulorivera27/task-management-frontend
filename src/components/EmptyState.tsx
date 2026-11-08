import { sleepyTaskImage } from "../assets";
import type { EmptyStateProps } from "../types";
import { NoTasksContainer } from "./styles/taskList";

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <NoTasksContainer>
      <img src={sleepyTaskImage} alt="" width={200} height={200} />
      <p>{message}</p>
    </NoTasksContainer>
  );
}
